import { createClient } from "@/lib/supabase/server";
import {
  getLandlord,
  getProperties,
  getActiveTenants,
  getPayments,
  getMonthRange,
  getMonthStart,
  getMonthEnd,
  getShortMonth,
  formatMonthKey,
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
  let tenants: { initials: string; color: string; name: string; property: string; amount: number; date: string; status: "paid" | "pending" | "overdue" }[] = [];
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
        const allPayments = await getPayments(supabase, propertyIds);
        const activeTenants = await getActiveTenants(supabase, propertyIds);

        const totalTenants = activeTenants.length;
        const totalExpected = activeTenants.reduce((sum: number, t: { monthly_rent: number }) => sum + Number(t.monthly_rent), 0);
        const totalUnits = dbProperties.reduce((sum: number, p: { total_units: number }) => sum + (p.total_units || 0), 0);
        const activeTenantCount = activeTenants.length;
        const occupancyRate = totalUnits > 0 ? Math.round((activeTenantCount / totalUnits) * 100) : 0;

        // Filter payments for selected month
        const monthStart = getMonthStart(selectedMonth);
        const monthEnd = getMonthEnd(selectedMonth);
        const monthPayments = allPayments.filter(
          (p: { payment_date: string }) => p.payment_date >= monthStart && p.payment_date <= monthEnd
        );
        const paidPayments = monthPayments.filter((p: { status: string }) => p.status === "paid");
        const totalCollected = paidPayments.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

        kpiData = {
          totalCollected,
          totalExpected,
          tenantsPaid: paidPayments.length,
          totalTenants,
          outstanding: Math.max(0, totalExpected - totalCollected),
          outstandingCount: totalTenants - paidPayments.length,
          propertyCount: dbProperties.length,
          totalUnits,
          occupancyRate,
          monthLabel,
        };

        // Income chart — last 6 months ending at selected month
        const months = getMonthRange(selectedMonth, 6);
        incomeData = computeIncomeByMonth(allPayments, totalExpected, months);

        // Property breakdown
        properties = computePropertyBreakdown(dbProperties, allPayments, selectedMonth);

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
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <IncomeChart data={incomeData} />
        <PropertyBreakdown properties={properties} />
      </div>

      {/* Tenants + Transactions */}
      <div
        className="dashboard-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <TenantStatusList tenants={tenants} />
        <RecentTransactions transactions={transactions} />
      </div>
    </>
  );
}
