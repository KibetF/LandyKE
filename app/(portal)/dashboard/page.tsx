export const revalidate = 60; // Cache dashboard data for 60 seconds

import { createClient } from "@/lib/supabase/server";
import {
  getLandlord,
  getProperties,
  getActiveTenants,
  getPayments,
  getMonthRange,
  getMonthEnd,
  formatMonthKey,
  periodOf,
  computeIncomeByMonth,
  computePropertyBreakdown,
  computeTenantStatus,
  computeRecentTransactions,
} from "@/lib/queries";
import KpiRow from "@/components/dashboard/KpiRow";
import IncomeChart from "@/components/dashboard/IncomeChart";
import PropertyBreakdown from "@/components/dashboard/PropertyBreakdown";
import TenantStatusList from "@/components/dashboard/TenantStatusList";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MonthSelector from "@/components/dashboard/MonthSelector";
import LandlordReports from "@/components/dashboard/LandlordReports";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface DashboardSearchParams {
  month?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;
  const selectedMonth = params.month || new Date().toISOString().slice(0, 7);
  const monthLabel = formatMonthKey(selectedMonth);
  const greeting = getGreeting();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userName = "User";
  let incomeData: { month: string; collected: number; expected: number }[] = [];
  let properties: { name: string; location: string; units: number; income: number; occupancy: string }[] = [];
  let tenants: { initials: string; color: string; name: string; property: string; amount: number; date: string; status: "paid" | "pending" | "overdue" | "vacated_unpaid" | "partial" }[] = [];
  let transactions: { title: string; detail: string; amount: string; isDeduction?: boolean }[] = [];
  let kpiData = {
    totalCollected: 0,
    totalExpected: 0,
    tenantsPaid: 0,
    totalTenants: 0,
    outstanding: 0,
    outstandingCount: 0,
    propertyCount: 0,
    totalUnits: 0,
    occupancyRate: 0,
    monthLabel,
  };

  if (user) {
    const landlord = await getLandlord(supabase, user.id);

    if (landlord) {
      userName = landlord.full_name.split(" ")[0];

      const dbProperties = await getProperties(supabase, landlord.id);

      if (dbProperties.length > 0) {
        const propertyIds = dbProperties.map((p: { id: string }) => p.id);
        // Payments are linked by landlord_id, not property_id
        const allPayments = await getPayments(supabase, landlord.id);
        const activeTenants = await getActiveTenants(supabase, propertyIds);

        // Count tenants created during or before the selected month for expected rent
        // Also skip tenants from properties where collection hasn't started yet
        const monthEndStr = getMonthEnd(selectedMonth);
        const propStartMap = new Map(dbProperties.map((p: { id: string; collection_start_month?: string | null }) => [p.id, p.collection_start_month]));
        const tenantsForMonth = activeTenants.filter(
          (t: { created_at?: string; property_id: string }) => {
            if (t.created_at && t.created_at > monthEndStr) return false;
            const propStart = propStartMap.get(t.property_id);
            if (propStart && propStart > selectedMonth) return false;
            return true;
          }
        );
        const totalTenants = tenantsForMonth.length;
        const totalExpected = tenantsForMonth.reduce((sum: number, t: { rent_amount: number }) => sum + Number(t.rent_amount), 0);
        const totalUnits = dbProperties.reduce((sum: number, p: { total_units: number }) => sum + (p.total_units || 0), 0);
        const occupancyRate = totalUnits > 0 ? Math.round((activeTenants.length / totalUnits) * 100) : 0;

        // Filter payments for selected period using rent_period (fallback to paid_date YYYY-MM)
        const monthPayments = allPayments.filter((p: { paid_date: string | null; rent_period?: string | null; payment_type?: string | null }) => {
          if (p.payment_type && p.payment_type !== "rent") return false;
          return periodOf(p) === selectedMonth;
        });
        const paidPayments = monthPayments.filter((p: { status: string }) => p.status === "paid");
        const totalCollected = paidPayments.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

        // Tenants who paid in full for the period (paid sum >= rent)
        const tenantPaidSum = new Map<string, number>();
        for (const p of paidPayments as Array<{ tenant_id: string; amount: number }>) {
          tenantPaidSum.set(p.tenant_id, (tenantPaidSum.get(p.tenant_id) || 0) + Number(p.amount));
        }
        const tenantsFullyPaid = tenantsForMonth.filter((t: { id: string; rent_amount: number }) =>
          (tenantPaidSum.get(t.id) || 0) >= Number(t.rent_amount)
        ).length;

        kpiData = {
          totalCollected,
          totalExpected,
          tenantsPaid: tenantsFullyPaid,
          totalTenants,
          outstanding: Math.max(0, totalExpected - totalCollected),
          outstandingCount: totalTenants - tenantsFullyPaid,
          propertyCount: dbProperties.length,
          totalUnits,
          occupancyRate,
          monthLabel,
        };

        // Income chart — last 6 months ending at selected month
        const months = getMonthRange(selectedMonth, 6);
        incomeData = computeIncomeByMonth(allPayments, totalExpected, months);

        // Property breakdown — needs tenants for occupancy
        properties = computePropertyBreakdown(dbProperties, activeTenants, allPayments, selectedMonth);

        // Tenant status
        tenants = computeTenantStatus(activeTenants, allPayments, selectedMonth);

        // Recent transactions
        transactions = computeRecentTransactions(monthPayments.length > 0 ? monthPayments : allPayments);
      }
    }
  }

  return (
    <>
      {/* Header */}
      <div
        className="flex justify-between items-start dashboard-header"
        style={{ marginBottom: "2.5rem" }}
      >
        <div>
          <h1
            className="font-serif"
            style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}
          >
            {greeting},{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              {userName}
            </span>
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              marginTop: "0.2rem",
            }}
          >
            Here&apos;s your portfolio snapshot for {monthLabel}
          </p>
        </div>
        <MonthSelector />
      </div>

      {/* KPIs */}
      <KpiRow data={kpiData} />

      {/* Chart + Properties */}
      <div
        className="dashboard-grid-2"
        style={{ marginBottom: "1.5rem" }}
      >
        <IncomeChart data={incomeData} />
        <PropertyBreakdown properties={properties} />
      </div>

      {/* Tenants + Transactions */}
      <div
        className="dashboard-grid-2"
        style={{ marginBottom: "1.5rem" }}
      >
        <TenantStatusList tenants={tenants} />
        <RecentTransactions transactions={transactions} />
      </div>

      {/* Reports Section — Pie charts, property breakdown with tenant preview & downloads */}
      <LandlordReports selectedMonth={selectedMonth} />
    </>
  );
}
