import { createClient } from "@/lib/supabase/server";
import { getLandlord, getTenantsPaginated } from "@/lib/queries";
import TenantTable from "@/components/tenants/TenantTable";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TenantsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

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
    rent_amount: number;
    status: string;
    properties: { name: string; location: string | null };
  }> = [];

  let properties: Array<{ id: string; name: string }> = [];
  let totalPages = 1;

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
        const result = await getTenantsPaginated(
          supabase,
          properties.map((p) => p.id),
          page
        );
        tenants = result.tenants;
        totalPages = result.totalPages;
      }
    }
  }

  return (
    <TenantTable
      tenants={tenants}
      properties={properties}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
