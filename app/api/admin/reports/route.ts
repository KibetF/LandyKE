import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMonthRange,
  getShortMonth,
  formatMonthKey,
  periodOf,
  computeTenantStatus,
  computeArrears,
  countTenantsFullyPaid,
  computeClientMonthlyAccount,
} from "@/lib/queries";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const landlordId = request.nextUrl.searchParams.get("landlord_id");
  const selectedMonth = request.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);

  if (!landlordId) return NextResponse.json({ error: "landlord_id required" }, { status: 400 });

  const adminClient = createAdminClient();

  // Fetch all data for this landlord
  const [propertyRes, tenantRes, paymentRes, landlordRes] = await Promise.all([
    adminClient.schema("landyke").from("properties").select("id, name, location, total_units, collection_start_month").eq("landlord_id", landlordId),
    adminClient.schema("landyke").from("tenants").select("id, full_name, rent_amount, status, property_id, unit_number, unit_type, created_at, properties(name)").eq("landlord_id", landlordId).eq("status", "active"),
    adminClient.schema("landyke").from("payments").select("id, amount, paid_date, rent_period, payment_type, status, notes, from_carryover, tenant_id, landlord_id, tenants(full_name, property_id, properties(name))").eq("landlord_id", landlordId).order("paid_date", { ascending: false }),
    adminClient.schema("landyke").from("landlords").select("full_name, carryover_amount, carryover_as_of").eq("id", landlordId).single(),
  ]);

  const properties = propertyRes.data || [];
  const activeTenants = tenantRes.data || [];
  const allPayments = paymentRes.data || [];
  const landlord = landlordRes.data;

  const isRentPayment = (p: { payment_type?: string | null }) => !p.payment_type || p.payment_type === "rent";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getPropertyName(row: any): string {
    if (!row.properties) return "";
    if (Array.isArray(row.properties)) return row.properties[0]?.name || "";
    return row.properties.name || "";
  }

  // Build map of property collection start months
  const propStartMap = new Map(properties.map((p) => [p.id, p.collection_start_month]));

  // Tenants eligible for this month:
  // - created during or before selected month
  // - property's collection_start_month <= selected month (if set)
  const tenantsForMonth = activeTenants.filter((t) => {
    if (t.created_at && t.created_at.slice(0, 7) > selectedMonth) return false;
    const propStart = propStartMap.get(t.property_id);
    if (propStart && propStart > selectedMonth) return false;
    return true;
  });

  // Supabase types the `properties` relation as an array on some rows; the
  // shared compute* helpers expect a plain object, so normalise it once here
  // rather than re-deriving the name at every call site.
  const tenantsForReports = tenantsForMonth.map((t) => ({
    ...t,
    properties: { name: getPropertyName(t), location: null },
  }));

  // Expected rent for a given month: only tenants/properties actually
  // collecting that month (created on/before month end, collection started).
  function expectedForMonth(key: string): number {
    return activeTenants
      .filter((t) => {
        if (t.created_at && t.created_at.slice(0, 7) > key) return false;
        const propStart = propStartMap.get(t.property_id);
        if (propStart && propStart > key) return false;
        return true;
      })
      .reduce((s: number, t: { rent_amount: number }) => s + Number(t.rent_amount), 0);
  }

  // Income by month
  const months = getMonthRange(selectedMonth, 6);
  const incomeData = months.map((key) => {
    const collected = allPayments
      .filter((p) => p.status === "paid" && isRentPayment(p) && periodOf(p) === key)
      .reduce((s, p) => s + Number(p.amount), 0);
    return { month: getShortMonth(key), collected, expected: expectedForMonth(key) };
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
    const monthExpected = expectedForMonth(key);
    const rate = monthExpected > 0 ? Math.round((collected / monthExpected) * 100) : 0;
    return { month: formatMonthKey(key).split(" ")[0], rate };
  });

  // Arrears — partial-aware: `amount` is the outstanding balance, not full rent
  const arrearsData = computeArrears(tenantsForReports, allPayments, selectedMonth);

  // Tenant status (for Tenant Payment PDF) — shared with the landlord route so
  // partial payments are bucketed by rent_period and summed against rent.
  const tenantStatusData = computeTenantStatus(tenantsForReports, allPayments, selectedMonth).map((t) => ({
    name: t.name,
    property: t.property,
    unit: t.unit,
    amount: t.amount,
    date: t.date,
    status: t.status,
    notes: t.notes,
  }));

  // Per-property payment breakdown for the selected month
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

  // Cash-basis account view for the end-of-month client statement. Kept
  // separate from the figures above, which are rent-period based.
  const clientReport = {
    landlordName: landlord?.full_name || "",
    ...computeClientMonthlyAccount(allPayments, selectedMonth, {
      carryoverAmount: landlord?.carryover_amount,
      carryoverAsOf: landlord?.carryover_as_of,
    }),
  };

  return NextResponse.json({
    incomeData,
    occupancyData,
    collectionRates,
    arrearsData,
    tenantStatusData,
    propertyBreakdown,
    clientReport,
    selectedMonth,
  });
}
