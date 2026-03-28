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
  let totalExpected = 0;

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      const dbProperties = await getProperties(supabase, landlord.id);
      if (dbProperties.length > 0) {
        const propertyIds = dbProperties.map((p: { id: string }) => p.id);
        const allPayments = await getPayments(supabase, propertyIds);
        const activeTenants = await getActiveTenants(supabase, propertyIds);

        totalExpected = activeTenants.reduce(
          (sum: number, t: { monthly_rent: number }) => sum + Number(t.monthly_rent),
          0
        );

        const months = getMonthRange(selectedMonth, 6);
        incomeData = computeIncomeByMonth(allPayments, totalExpected, months);
        occupancyData = computeOccupancyData(dbProperties);
        collectionRates = computeCollectionRates(allPayments, totalExpected, months);
        arrearsData = computeArrears(activeTenants, allPayments, selectedMonth);
      }
    }
  }

  return (
    <ReportsView
      incomeData={incomeData}
      occupancyData={occupancyData}
      collectionRates={collectionRates}
      arrearsData={arrearsData}
      selectedMonth={selectedMonth}
    />
  );
}
