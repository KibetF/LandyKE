import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLandlord,
  getMonthRange,
  getMonthEnd,
  getShortMonth,
  formatMonthKey,
  periodOf,
} from "@/lib/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const landlord = await getLandlord(supabase, user.id);
  if (!landlord) return NextResponse.json({ error: "Landlord not found" }, { status: 404 });

  const selectedMonth = request.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);

  // Fetch all data for this landlord
  const [propertyRes, tenantRes, paymentRes] = await Promise.all([
    supabase.schema("landyke").from("properties").select("id, name, location, total_units, collection_start_month").eq("landlord_id", landlord.id),
    supabase.schema("landyke").from("tenants").select("id, full_name, rent_amount, status, property_id, unit_number, unit_type, created_at, properties(name)").eq("landlord_id", landlord.id).eq("status", "active"),
    supabase.schema("landyke").from("payments").select("id, amount, paid_date, rent_period, payment_type, status, notes, tenant_id, landlord_id, tenants(full_name, property_id, properties(name))").eq("landlord_id", landlord.id).order("paid_date", { ascending: false }),
  ]);

  const properties = propertyRes.data || [];
  const activeTenants = tenantRes.data || [];
  const allPayments = paymentRes.data || [];

  const monthEnd = getMonthEnd(selectedMonth);
  const isRentPayment = (p: { payment_type?: string | null }) => !p.payment_type || p.payment_type === "rent";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getPropertyName(row: any): string {
    if (!row.properties) return "";
    if (Array.isArray(row.properties)) return row.properties[0]?.name || "";
    return row.properties.name || "";
  }

  // Build map of property collection start months
  const propStartMap = new Map(properties.map((p) => [p.id, p.collection_start_month]));

  // Tenants eligible for this month
  const tenantsForMonth = activeTenants.filter((t) => {
    if (t.created_at && t.created_at > monthEnd) return false;
    const propStart = propStartMap.get(t.property_id);
    if (propStart && propStart > selectedMonth) return false;
    return true;
  });
  const totalExpected = tenantsForMonth.reduce((s: number, t: { rent_amount: number }) => s + Number(t.rent_amount), 0);

  // Income by rent period
  const months = getMonthRange(selectedMonth, 6);
  const incomeData = months.map((key) => {
    const collected = allPayments
      .filter((p) => p.status === "paid" && isRentPayment(p) && periodOf(p) === key)
      .reduce((s, p) => s + Number(p.amount), 0);
    return { month: getShortMonth(key), collected, expected: totalExpected };
  });

  // Occupancy
  const occupancyData = properties.map((prop) => {
    const occupied = activeTenants.filter((t) => t.property_id === prop.id).length;
    const rate = prop.total_units > 0 ? Math.round((occupied / prop.total_units) * 100) : 0;
    return { name: prop.name, total: prop.total_units, occupied, rate };
  });

  // Collection rates
  const collectionRates = months.map((key) => {
    const collected = allPayments
      .filter((p) => p.status === "paid" && isRentPayment(p) && periodOf(p) === key)
      .reduce((s, p) => s + Number(p.amount), 0);
    const rate = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0;
    return { month: formatMonthKey(key).split(" ")[0], rate };
  });

  // Determine if the selected month's rent is not yet due (before the 5th)
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonth = selectedMonth === currentMonthKey;
  const rentNotYetDue = isCurrentMonth && today.getDate() < 5;

  // Tenant status (bucketed by rent_period)
  const tenantStatusData = tenantsForMonth.map((t) => {
    const tenantPayments = allPayments.filter(
      (p) => p.tenant_id === t.id && isRentPayment(p) && periodOf(p) === selectedMonth
    );
    const paidEvents = tenantPayments.filter((p) => p.status === "paid");
    const paidSum = paidEvents.reduce((s, p) => s + Number(p.amount), 0);
    const pendingPayment = tenantPayments.find((p) => p.status === "pending");
    const vacatedPayment = tenantPayments.find((p) => p.status === "vacated_unpaid");
    const lastPaid = paidEvents
      .filter((p) => p.paid_date)
      .map((p) => p.paid_date as string)
      .sort()
      .pop();

    const rent = Number(t.rent_amount);
    let status: "paid" | "pending" | "overdue" | "vacated_unpaid" | "partial" = rentNotYetDue ? "pending" : "overdue";
    let date = rentNotYetDue ? "Due 5th" : "No payment";
    let paymentNotes = "";

    if (vacatedPayment) {
      status = "vacated_unpaid";
      date = "Vacated";
      paymentNotes = vacatedPayment.notes || "";
    } else if (paidSum >= rent && rent > 0) {
      status = "paid";
      if (lastPaid) date = new Date(lastPaid).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
      paymentNotes = paidEvents[0]?.notes || "";
    } else if (paidSum > 0) {
      status = "partial";
      date = `KES ${(rent - paidSum).toLocaleString("en-KE")} owed`;
      paymentNotes = paidEvents[0]?.notes || "";
    } else if (pendingPayment) {
      status = "pending";
      date = pendingPayment.paid_date
        ? `Due ${new Date(pendingPayment.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}`
        : "Pending";
      paymentNotes = pendingPayment.notes || "";
    }

    return {
      name: t.full_name,
      property: getPropertyName(t),
      unit: t.unit_number || "",
      amount: Number(t.rent_amount),
      date,
      status,
      notes: paymentNotes,
    };
  });

  // Per-property payment breakdown (bucketed by rent_period)
  const propertyBreakdown = properties.map((prop) => {
    const pTenants = tenantsForMonth.filter((t) => t.property_id === prop.id);
    const pExpected = pTenants.reduce((s, t) => s + Number(t.rent_amount), 0);
    const pPaidPayments = allPayments.filter(
      (p) => p.status === "paid" && isRentPayment(p) && periodOf(p) === selectedMonth &&
        pTenants.some((t) => t.id === p.tenant_id)
    );
    const pCollected = pPaidPayments.reduce((s, p) => s + Number(p.amount), 0);
    const pExternalPayments = pPaidPayments.filter((p) => p.notes && /kcb/i.test(p.notes));
    const pExternal = pExternalPayments.reduce((s, p) => s + Number(p.amount), 0);
    const paidTenantIds = new Set(pPaidPayments.map((p) => p.tenant_id));
    const tenantsPaid = pTenants.filter((t) => paidTenantIds.has(t.id)).length;

    return {
      name: prop.name,
      location: prop.location,
      totalTenants: pTenants.length,
      tenantsPaid,
      collected: pCollected,
      expected: pExpected,
      receivedInAccount: pCollected - pExternal,
      paidToExternal: pExternal,
      rate: pExpected > 0 ? Math.round((pCollected / pExpected) * 100) : 0,
    };
  });

  return NextResponse.json({
    incomeData,
    occupancyData,
    collectionRates,
    tenantStatusData,
    propertyBreakdown,
    selectedMonth,
  });
}
