import { createClient } from "@/lib/supabase/server";
import {
  getLandlord,
  getProperties,
  getActiveTenants,
  getPayments,
  getMonthRange,
  computeIncomeByMonth,
  computeOccupancyData,
  computeCollectionRates,
  computeArrears,
  computeTenantStatus,
} from "@/lib/queries";
import ReportsView from "@/components/reports/ReportsView";

interface ReportsSearchParams {
  month?: string;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<ReportsSearchParams>;
}) {
  const params = await searchParams;
  const selectedMonth = params.month || new Date().toISOString().slice(0, 7);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let incomeData: { month: string; collected: number; expected: number }[] = [];
  let occupancyData: { name: string; total: number; occupied: number; rate: number }[] = [];
  let collectionRates: { month: string; rate: number }[] = [];
  let arrearsData: { tenant: string; property: string; unit: string; amount: number; days: number }[] = [];
  let tenantStatusData: { name: string; property: string; unit: string; amount: number; date: string; status: "paid" | "pending" | "overdue" | "vacated_unpaid" }[] = [];

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      const dbProperties = await getProperties(supabase, landlord.id);
      if (dbProperties.length > 0) {
        const propertyIds = dbProperties.map((p: { id: string }) => p.id);
        const allPayments = await getPayments(supabase, landlord.id);
        const activeTenants = await getActiveTenants(supabase, propertyIds);

        // Filter out tenants from properties where collection hasn't started
        const propStartMap = new Map(dbProperties.map((p: { id: string; collection_start_month?: string | null }) => [p.id, p.collection_start_month]));
        const eligibleTenants = activeTenants.filter(
          (t: { property_id: string }) => {
            const propStart = propStartMap.get(t.property_id);
            return !propStart || propStart <= selectedMonth;
          }
        );

        const totalExpected = eligibleTenants.reduce(
          (sum: number, t: { rent_amount: number }) => sum + Number(t.rent_amount),
          0
        );

        const months = getMonthRange(selectedMonth, 6);
        incomeData = computeIncomeByMonth(allPayments, totalExpected, months);
        occupancyData = computeOccupancyData(dbProperties, activeTenants);
        collectionRates = computeCollectionRates(allPayments, totalExpected, months);
        arrearsData = computeArrears(eligibleTenants, allPayments, selectedMonth);

        const statusList = computeTenantStatus(eligibleTenants, allPayments, selectedMonth);
        tenantStatusData = statusList.map((t) => ({
          name: t.name,
          property: t.property,
          unit: t.unit,
          amount: t.amount,
          date: t.date,
          status: t.status,
        }));
      }
    }
  }

  return (
    <ReportsView
      incomeData={incomeData}
      occupancyData={occupancyData}
      collectionRates={collectionRates}
      arrearsData={arrearsData}
      tenantStatusData={tenantStatusData}
      selectedMonth={selectedMonth}
    />
  );
}
