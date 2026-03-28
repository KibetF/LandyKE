import { createClient } from "@/lib/supabase/server";
import KpiRow from "@/components/dashboard/KpiRow";
import IncomeChart from "@/components/dashboard/IncomeChart";
import PropertyBreakdown from "@/components/dashboard/PropertyBreakdown";
import TenantStatusList from "@/components/dashboard/TenantStatusList";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MonthSelector from "@/components/dashboard/MonthSelector";

// Dummy data fallback matching the HTML exactly
const fallbackIncomeData = [
  { month: "Oct", collected: 176000, expected: 200000 },
  { month: "Nov", collected: 192000, expected: 200000 },
  { month: "Dec", collected: 185000, expected: 200000 },
  { month: "Jan", collected: 200000, expected: 200000 },
  { month: "Feb", collected: 196000, expected: 200000 },
  { month: "Mar", collected: 188000, expected: 200000 },
];

const fallbackProperties = [
  { name: "Plot A — Langas", location: "Langas, Eldoret", units: 6, income: 75000, occupancy: "100% occupied" },
  { name: "Kapsoya Block", location: "Kapsoya, Eldoret", units: 4, income: 48000, occupancy: "100% occupied" },
  { name: "Plot B — Pioneer", location: "Pioneer, Eldoret", units: 4, income: 40000, occupancy: "75% occupied" },
  { name: "Annex — Huruma", location: "Huruma, Eldoret", units: 2, income: 25000, occupancy: "100% occupied" },
];

const fallbackTenants = [
  { initials: "JW", color: "#4a5c4e", name: "James Waweru", property: "Plot A · Unit 4", amount: 12500, date: "1 Mar 2026", status: "paid" as const },
  { initials: "GA", color: "#8b3a2a", name: "Grace Akinyi", property: "Kapsoya · Unit 2", amount: 12000, date: "2 Mar 2026", status: "paid" as const },
  { initials: "DO", color: "#c8963e", name: "Daniel Otieno", property: "Plot B · Unit 7", amount: 10000, date: "Due 5 Mar", status: "pending" as const },
  { initials: "FK", color: "#2d6a4f", name: "Faith Kiprotich", property: "Plot A · Unit 1", amount: 12500, date: "1 Mar 2026", status: "paid" as const },
  { initials: "SM", color: "#6b3d8a", name: "Samuel Mutua", property: "Annex · Unit 1", amount: 12500, date: "Overdue 5 days", status: "overdue" as const },
  { initials: "RN", color: "#3d6b8a", name: "Ruth Njeri", property: "Kapsoya · Unit 1", amount: 12000, date: "3 Mar 2026", status: "paid" as const },
];

const fallbackTransactions = [
  { title: "M-Pesa · James Waweru", detail: "Plot A · 1 Mar 2026 · 09:41", amount: "+12,500" },
  { title: "Bank Transfer · Grace Akinyi", detail: "Kapsoya · 2 Mar 2026 · 14:02", amount: "+12,000" },
  { title: "M-Pesa · Faith Kiprotich", detail: "Plot A · 1 Mar 2026 · 08:15", amount: "+12,500" },
  { title: "M-Pesa · Ruth Njeri", detail: "Kapsoya · 3 Mar 2026 · 11:30", amount: "+12,000" },
  { title: "M-Pesa · Peter Kamau", detail: "Annex · 2 Mar 2026 · 16:45", amount: "+12,500" },
  { title: "Management Fee — March", detail: "Deduction · 1 Mar 2026", amount: "-9,400", isDeduction: true },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Try to fetch real data, fall back to dummy data
  let userName = "Margaret";
  let incomeData = fallbackIncomeData;
  let properties = fallbackProperties;
  let tenants = fallbackTenants;
  let transactions = fallbackTransactions;
  let kpiData = {
    totalCollected: 188000,
    totalExpected: 200000,
    tenantsPaid: 14,
    totalTenants: 16,
    outstanding: 12000,
    outstandingCount: 2,
    propertyCount: 4,
    totalUnits: 16,
    occupancyRate: 96,
  };

  if (user) {
    const { data: landlord } = await supabase
      .schema("landyke")
      .from("landlords")
      .select("id, full_name")
      .eq("user_id", user.id)
      .single();

    if (landlord) {
      userName = landlord.full_name.split(" ")[0];
    }

    // Fetch properties using the landlord's table id (not auth user id)
    const landlordId = landlord?.id;
    const { data: dbProperties } = await supabase
      .schema("landyke")
      .from("properties")
      .select("*")
      .eq("landlord_id", landlordId);

    if (dbProperties && dbProperties.length > 0) {
      // Use real data if available
      const { data: dbPayments } = await supabase
        .schema("landyke")
        .from("payments")
        .select("*, tenants(full_name, unit_number, monthly_rent, property_id)")
        .in(
          "property_id",
          dbProperties.map((p) => p.id)
        );

      if (dbPayments && dbPayments.length > 0) {
        // Calculate KPIs from real data
        const marchPayments = dbPayments.filter(
          (p) =>
            p.payment_date >= "2026-03-01" && p.payment_date <= "2026-03-31"
        );
        const paidPayments = marchPayments.filter(
          (p) => p.status === "paid"
        );
        const totalCollected = paidPayments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );

        const { data: allTenants } = await supabase
          .schema("landyke")
          .from("tenants")
          .select("*")
          .in(
            "property_id",
            dbProperties.map((p) => p.id)
          )
          .eq("is_active", true);

        const totalTenants = allTenants?.length || 16;
        const totalExpected =
          allTenants?.reduce((sum, t) => sum + Number(t.monthly_rent), 0) ||
          200000;

        kpiData = {
          totalCollected,
          totalExpected,
          tenantsPaid: paidPayments.length,
          totalTenants,
          outstanding: totalExpected - totalCollected,
          outstandingCount:
            totalTenants - paidPayments.length,
          propertyCount: dbProperties.length,
          totalUnits: dbProperties.reduce(
            (sum, p) => sum + (p.total_units || 0),
            0
          ),
          occupancyRate: 96,
        };
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
            Good morning,{" "}
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
            Here&apos;s your portfolio snapshot for March 2026
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
