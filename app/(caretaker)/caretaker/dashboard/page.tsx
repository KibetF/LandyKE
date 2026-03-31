import { createClient } from "@/lib/supabase/server";
import {
  getCaretakerAssignments,
  getCaretakerTenants,
  getCaretakerPayments,
  computeUnitStatus,
} from "@/lib/queries-caretaker";
import { getMonthStart, getMonthEnd, formatMonthKey } from "@/lib/queries";
import CaretakerDashboard from "@/components/caretaker/CaretakerDashboard";

interface DashboardSearchParams {
  month?: string;
}

export default async function CaretakerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;
  const now = new Date();
  const selectedMonth = params.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = formatMonthKey(selectedMonth);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const assignments = await getCaretakerAssignments(supabase, user.id);
  const propertyIds = assignments.map((a: { property_id: string }) => a.property_id);

  const tenants = await getCaretakerTenants(supabase, propertyIds);
  const tenantIds = tenants.map((t: { id: string }) => t.id);

  const monthStart = getMonthStart(selectedMonth);
  const monthEnd = getMonthEnd(selectedMonth);
  const payments = await getCaretakerPayments(supabase, tenantIds, monthStart, monthEnd);

  const units = computeUnitStatus(tenants, payments);

  return (
    <CaretakerDashboard
      units={units}
      selectedMonth={selectedMonth}
      monthLabel={monthLabel}
    />
  );
}
