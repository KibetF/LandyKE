import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId, getTenantMaintenanceRequests } from "@/lib/queries-tenant";
import TenantMaintenance from "@/components/tenant/TenantMaintenance";

export default async function TenantMaintenancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tenant-login");

  const tenant = await getTenantByUserId(supabase, user.id);
  if (!tenant) redirect("/unauthorized");

  const requests = await getTenantMaintenanceRequests(supabase, tenant.id);

  return (
    <TenantMaintenance
      tenantId={tenant.id}
      propertyId={tenant.property_id}
      unitNumber={tenant.unit_number}
      requests={requests.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        description: r.description as string,
        priority: r.priority as "low" | "medium" | "high" | "urgent",
        status: r.status as "open" | "in-progress" | "completed",
        date_submitted: r.date_submitted as string,
        date_resolved: (r.date_resolved as string) || null,
        notes: (r.notes as string) || null,
      }))}
    />
  );
}
