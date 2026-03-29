import { createClient } from "@/lib/supabase/server";
import { getLandlord, getProperties } from "@/lib/queries";
import MaintenanceView from "@/components/maintenance/MaintenanceView";

export default async function MaintenancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let requests: Array<{
    id: string;
    property_id: string;
    tenant_id: string | null;
    unit_number: string | null;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in-progress" | "completed";
    date_submitted: string;
    date_resolved: string | null;
    notes: string | null;
    properties: { name: string };
    tenants: { full_name: string } | null;
  }> = [];

  let properties: Array<{ id: string; name: string }> = [];
  let tenants: Array<{ id: string; full_name: string; property_id: string; unit_number: string | null }> = [];
  let landlordId = "";

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      landlordId = landlord.id;
      const dbProperties = await getProperties(supabase, landlord.id);
      properties = dbProperties.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }));

      if (properties.length > 0) {
        const { data: dbRequests } = await supabase
          .schema("landyke")
          .from("maintenance_requests")
          .select("*, properties(name), tenants(full_name)")
          .eq("landlord_id", landlord.id)
          .order("created_at", { ascending: false });

        requests = dbRequests || [];

        const { data: dbTenants } = await supabase
          .schema("landyke")
          .from("tenants")
          .select("id, full_name, property_id, unit_number")
          .eq("landlord_id", landlord.id)
          .eq("status", "active");

        tenants = dbTenants || [];
      }
    }
  }

  return (
    <MaintenanceView
      requests={requests}
      properties={properties}
      tenants={tenants}
      landlordId={landlordId}
    />
  );
}
