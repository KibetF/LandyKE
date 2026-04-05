import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId } from "@/lib/queries-tenant";
import TenantNav from "@/components/tenant/TenantNav";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tenant-login");
  }

  const tenant = await getTenantByUserId(supabase, user.id);

  if (!tenant) {
    redirect("/unauthorized");
  }

  const propertyName = tenant.properties?.name || "Property";
  const tenantName = tenant.full_name || user.email || "Tenant";

  return (
    <div className="flex min-h-screen bg-[#f7f5f2] tenant-layout">
      <TenantNav
        tenantName={tenantName}
        propertyName={propertyName}
        unitNumber={tenant.unit_number}
      />
      <main className="flex-1 overflow-y-auto px-5 py-8 pb-20 sm:px-10 tenant-main">
        {children}
      </main>
    </div>
  );
}
