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
    <div className="flex tenant-layout" style={{ minHeight: "100vh", background: "#f7f5f2" }}>
      <TenantNav
        tenantName={tenantName}
        propertyName={propertyName}
        unitNumber={tenant.unit_number}
      />
      <main
        className="flex-1 overflow-y-auto tenant-main"
        style={{ padding: "2rem 2.5rem", paddingBottom: "5rem" }}
      >
        {children}
      </main>
    </div>
  );
}
