import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMonthRange,
  getMonthStart,
  getMonthEnd,
  getShortMonth,
  LAUNCH_MONTH,
} from "@/lib/queries";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminClient = createAdminClient();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthStart = getMonthStart(currentMonth);
  const monthEnd = getMonthEnd(currentMonth);

  // Fetch all data in parallel
  const [landlordRes, propertyRes, tenantRes, paymentRes] = await Promise.all([
    adminClient.schema("landyke").from("landlords").select("id, full_name, email"),
    adminClient.schema("landyke").from("properties").select("id, name, location, total_units, landlord_id, collection_start_month"),
    adminClient.schema("landyke").from("tenants").select("id, full_name, rent_amount, status, property_id, landlord_id, unit_number, unit_type, created_at"),
    adminClient.schema("landyke").from("payments").select("id, amount, paid_date, status, tenant_id, landlord_id").gte("paid_date", monthStart).lte("paid_date", monthEnd),
  ]);

  const landlords = landlordRes.data || [];
  const properties = propertyRes.data || [];
  const tenants = tenantRes.data || [];
  const payments = paymentRes.data || [];

  // Build per-landlord overview
  const landlordOverviews = landlords.map((l) => {
    const lProperties = properties.filter((p) => p.landlord_id === l.id);
    const lTenants = tenants.filter((t) => lProperties.some((p) => p.id === t.property_id));
    const activeTenants = lTenants.filter((t) => t.status === "active");
    const lPayments = payments.filter((p) => p.landlord_id === l.id);
    const paidPayments = lPayments.filter((p) => p.status === "paid");
    const totalCollected = paidPayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalExpected = activeTenants
      .filter((t) => {
        if (t.created_at && t.created_at > monthEnd) return false;
        const prop = lProperties.find((p) => p.id === t.property_id);
        if (prop?.collection_start_month && prop.collection_start_month > currentMonth) return false;
        return true;
      })
      .reduce((s, t) => s + Number(t.rent_amount), 0);
    const totalUnits = lProperties.reduce((s, p) => s + (p.total_units || 0), 0);

    const propertyDetails = lProperties.map((p) => {
      const pTenants = activeTenants.filter((t) => t.property_id === p.id);
      const collectionStarted = !p.collection_start_month || p.collection_start_month <= currentMonth;
      const pPaidTenants = pTenants.filter((t) =>
        paidPayments.some((pay) => pay.tenant_id === t.id)
      );
      const pCollected = paidPayments
        .filter((pay) => pTenants.some((t) => t.id === pay.tenant_id))
        .reduce((s, pay) => s + Number(pay.amount), 0);
      const pExpected = collectionStarted ? pTenants
        .filter((t) => !t.created_at || t.created_at <= monthEnd)
        .reduce((s, t) => s + Number(t.rent_amount), 0) : 0;

      return {
        id: p.id,
        name: p.name,
        location: p.location,
        totalUnits: p.total_units,
        occupiedUnits: pTenants.length,
        occupancyRate: p.total_units > 0 ? Math.round((pTenants.length / p.total_units) * 100) : 0,
        tenantsPaid: pPaidTenants.length,
        totalTenants: pTenants.length,
        collected: pCollected,
        expected: pExpected,
      };
    });

    return {
      id: l.id,
      name: l.full_name,
      email: l.email,
      totalProperties: lProperties.length,
      totalUnits,
      activeTenants: activeTenants.length,
      totalCollected,
      totalExpected,
      collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
      properties: propertyDetails,
    };
  });

  // Global totals
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((s, p) => s + (p.total_units || 0), 0);
  const totalActiveTenants = tenants.filter((t) => t.status === "active").length;
  const totalCollected = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const occupancyRate = totalUnits > 0 ? Math.round((totalActiveTenants / totalUnits) * 100) : 0;

  // Income chart - months from launch to current
  const months = getMonthRange(currentMonth, 6);

  // Fetch all payments for chart (not just current month)
  const chartStart = getMonthStart(months[0] || LAUNCH_MONTH);
  const { data: allPayments } = await adminClient
    .schema("landyke")
    .from("payments")
    .select("amount, paid_date, status")
    .gte("paid_date", chartStart)
    .lte("paid_date", monthEnd);

  const totalExpectedAll = tenants
    .filter((t) => {
      if (t.status !== "active") return false;
      if (t.created_at && t.created_at > monthEnd) return false;
      const prop = properties.find((p) => p.id === t.property_id);
      if (prop?.collection_start_month && prop.collection_start_month > currentMonth) return false;
      return true;
    })
    .reduce((s, t) => s + Number(t.rent_amount), 0);

  const incomeChart = months.map((key) => {
    const start = getMonthStart(key);
    const end = getMonthEnd(key);
    const collected = (allPayments || [])
      .filter((p) => p.paid_date && p.paid_date >= start && p.paid_date <= end && p.status === "paid")
      .reduce((s, p) => s + Number(p.amount), 0);
    return { month: getShortMonth(key), collected, expected: totalExpectedAll };
  });

  return NextResponse.json({
    totals: {
      landlords: landlords.length,
      properties: totalProperties,
      units: totalUnits,
      activeTenants: totalActiveTenants,
      collected: totalCollected,
      occupancyRate,
    },
    landlordOverviews,
    incomeChart,
    currentMonth,
  });
}
