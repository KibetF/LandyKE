import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId, getTenantPayments } from "@/lib/queries-tenant";
import TenantStatement from "@/components/tenant/TenantStatement";

export default async function TenantStatementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tenant-login");

  const tenant = await getTenantByUserId(supabase, user.id);
  if (!tenant) redirect("/unauthorized");

  const payments = await getTenantPayments(supabase, tenant.id);

  return (
    <TenantStatement
      tenant={{
        full_name: tenant.full_name,
        unit_number: tenant.unit_number,
        rent_amount: Number(tenant.rent_amount || tenant.monthly_rent),
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
    />
  );
}
