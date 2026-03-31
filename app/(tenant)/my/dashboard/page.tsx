import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId, getTenantPayments, computeTenantBalance } from "@/lib/queries-tenant";
import TenantDashboard from "@/components/tenant/TenantDashboard";

export default async function TenantDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tenant-login");

  const tenant = await getTenantByUserId(supabase, user.id);
  if (!tenant) redirect("/unauthorized");

  const payments = await getTenantPayments(supabase, tenant.id);
  const balance = computeTenantBalance(payments, Number(tenant.rent_amount || tenant.monthly_rent));

  return (
    <TenantDashboard
      tenant={{
        id: tenant.id,
        full_name: tenant.full_name,
        phone: tenant.phone,
        email: tenant.email || user.email || null,
        unit_number: tenant.unit_number,
        unit_type: tenant.unit_type,
        rent_amount: Number(tenant.rent_amount || tenant.monthly_rent),
        lease_start: tenant.lease_start || null,
        lease_end: tenant.lease_end || null,
        property_name: tenant.properties?.name || "Property",
        property_location: tenant.properties?.location || null,
      }}
      payments={payments.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        amount: Number(p.amount),
        paid_date: (p.paid_date as string) || null,
        method: (p.method as string) || (p.notes as string) || "M-Pesa",
        status: p.status as string,
      }))}
      balance={balance}
    />
  );
}
