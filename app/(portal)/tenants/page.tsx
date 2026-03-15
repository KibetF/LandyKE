import { createClient } from "@/lib/supabase/server";
import { getLandlord, getTenants } from "@/lib/queries";
import TenantTable from "@/components/tenants/TenantTable";

export default async function TenantsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tenants: Array<{
    id: string;
    property_id: string;
    unit_number: string | null;
    full_name: string;
    phone: string | null;
    monthly_rent: number;
    is_active: boolean;
    properties: { name: string; location: string | null };
  }> = [];

  let properties: Array<{ id: string; name: string }> = [];

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      const { data: dbProperties } = await supabase
        .schema("landyke")
        .from("properties")
        .select("id, name")
        .eq("landlord_id", landlord.id);

      properties = dbProperties || [];

      if (properties.length > 0) {
        tenants = await getTenants(
          supabase,
          properties.map((p) => p.id)
        );
      }
    }
  }

  return <TenantTable tenants={tenants} properties={properties} />;
}
