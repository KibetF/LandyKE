import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLandlord,
  getMonthRange,
  getShortMonth,
  formatMonthKey,
  periodOf,
  computeTenantStatus,
  countTenantsFullyPaid,
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
    if (t.created_at && t.created_at.slice(0, 7) > selectedMonth) return false;
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

  // Supabase types the `properties` relation as an array on some rows; the
  // shared compute* helpers expect a plain object, so normalise it once here.
  const tenantsForReports = tenantsForMonth.map((t) => ({
    ...t,
    properties: { name: getPropertyName(t), location: null },
  }));

  // Tenant status (bucketed by rent_period) — shared with the admin route.
  const tenantStatusData = computeTenantStatus(tenantsForReports, allPayments, selectedMonth).map((t) => ({
    name: t.name,
    property: t.property,
    unit: t.unit,
    amount: t.amount,
    date: t.date,
    status: t.status,
    notes: t.notes,
  }));

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
    // Only fully-settled tenants count — a partial payer still owes a balance.
    const tenantsPaid = countTenantsFullyPaid(pTenants, allPayments, selectedMonth);

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
