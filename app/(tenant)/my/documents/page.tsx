import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId, getTenantDocuments } from "@/lib/queries-tenant";
import TenantDocuments from "@/components/tenant/TenantDocuments";

export default async function TenantDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tenant-login");

  const tenant = await getTenantByUserId(supabase, user.id);
  if (!tenant) redirect("/unauthorized");

  const documents = await getTenantDocuments(supabase, tenant.id, tenant.property_id);

  return (
    <TenantDocuments
      documents={documents.map((d: Record<string, unknown>) => ({
        id: d.id as string,
        name: d.name as string,
        type: d.type as string,
        file_path: d.file_path as string,
        file_size: d.file_size as number | null,
        mime_type: d.mime_type as string | null,
        created_at: d.created_at as string,
      }))}
    />
  );
}
