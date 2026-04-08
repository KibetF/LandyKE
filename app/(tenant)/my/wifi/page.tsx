import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId, getTenantWifiSubscription, getPropertyWifiPlansForTenant } from "@/lib/queries-tenant";
import TenantWifi from "@/components/tenant/TenantWifi";

export default async function TenantWifiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tenant-login");

  const tenant = await getTenantByUserId(supabase, user.id);
  if (!tenant) redirect("/unauthorized");

  const subscription = await getTenantWifiSubscription(supabase, tenant.id);
  const availablePlans = await getPropertyWifiPlansForTenant(supabase, tenant.property_id);

  return (
    <TenantWifi
      subscription={subscription}
      availablePlans={availablePlans}
      tenantName={tenant.full_name}
    />
  );
}
