import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLandlord,
  getMonthRange,
  getMonthStart,
  getMonthEnd,
  getShortMonth,
  formatMonthKey,
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
    supabase.schema("landyke").from("payments").select("id, amount, paid_date, status, notes, tenant_id, landlord_id, tenants(full_name, property_id, properties(name))").eq("landlord_id", landlord.id).order("paid_date", { ascending: false }),
  ]);

  const properties = propertyRes.data || [];
  const activeTenants = tenantRes.data || [];
  const allPayments = paymentRes.data || [];

  const monthStart = getMonthStart(selectedMonth);
  const monthEnd = getMonthEnd(selectedMonth);

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

  // Income by month
  const months = getMonthRange(selectedMonth, 6);
  const incomeData = months.map((key) => {
    const start = getMonthStart(key);
    const end = getMonthEnd(key);
    const collected = allPayments
      .filter((p) => p.paid_date && p.paid_date >= start && p.paid_date <= end && p.status === "paid")
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
    const start = getMonthStart(key);
    const end = getMonthEnd(key);
    const collected = allPayments
      .filter((p) => p.paid_date && p.paid_date >= start && p.paid_date <= end && p.status === "paid")
      .reduce((s, p) => s + Number(p.amount), 0);
    const rate = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0;
    return { month: formatMonthKey(key).split(" ")[0], rate };
  });

  // Tenant status
  const tenantStatusData = tenantsForMonth.map((t) => {
    const tenantPayments = allPayments.filter(
      (p) => p.tenant_id === t.id && p.paid_date && p.paid_date >= monthStart && p.paid_date <= monthEnd
    );
    const paidPayment = tenantPayments.find((p) => p.status === "paid");
    const pendingPayment = tenantPayments.find((p) => p.status === "pending");

    let status: "paid" | "pending" | "overdue" = "overdue";
    let date = "No payment";
    let paymentNotes = "";
    if (paidPayment && paidPayment.paid_date) {
      status = "paid";
      date = new Date(paidPayment.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
      paymentNotes = paidPayment.notes || "";
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

  // Per-property payment breakdown
  const propertyBreakdown = properties.map((prop) => {
    const pTenants = tenantsForMonth.filter((t) => t.property_id === prop.id);
    const pExpected = pTenants.reduce((s, t) => s + Number(t.rent_amount), 0);
    const pPaidPayments = allPayments.filter(
      (p) => p.paid_date && p.paid_date >= monthStart && p.paid_date <= monthEnd && p.status === "paid" &&
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
