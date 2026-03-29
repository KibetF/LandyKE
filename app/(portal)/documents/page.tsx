import { createClient } from "@/lib/supabase/server";
import { getLandlord, getProperties } from "@/lib/queries";
import DocumentsView from "@/components/documents/DocumentsView";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let documents: Array<{
    id: string;
    property_id: string | null;
    name: string;
    type: "lease" | "invoice" | "receipt" | "report" | "legal";
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    created_at: string;
    properties: { name: string } | null;
  }> = [];

  let properties: Array<{ id: string; name: string }> = [];
  let landlordId = "";

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      landlordId = landlord.id;
      const dbProperties = await getProperties(supabase, landlord.id);
      properties = dbProperties.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }));

      const { data: dbDocuments } = await supabase
        .schema("landyke")
        .from("documents")
        .select("*, properties(name)")
        .eq("landlord_id", landlord.id)
        .order("created_at", { ascending: false });

      documents = dbDocuments || [];
    }
  }

  return (
    <DocumentsView
      documents={documents}
      properties={properties}
      landlordId={landlordId}
    />
  );
}
