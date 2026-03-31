import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId } from "@/lib/queries-tenant";
import TenantProfile from "@/components/tenant/TenantProfile";

export default async function TenantProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tenant-login");

  const tenant = await getTenantByUserId(supabase, user.id);
  if (!tenant) redirect("/unauthorized");

  return (
    <TenantProfile
      tenant={{
        id: tenant.id,
        full_name: tenant.full_name,
        email: tenant.email || user.email || null,
        phone: tenant.phone,
        unit_number: tenant.unit_number,
        unit_type: tenant.unit_type,
        rent_amount: Number(tenant.rent_amount || tenant.monthly_rent),
        lease_start: tenant.lease_start || null,
        lease_end: tenant.lease_end || null,
        property_name: tenant.properties?.name || "Property",
        property_location: tenant.properties?.location || null,
      }}
    />
  );
}
