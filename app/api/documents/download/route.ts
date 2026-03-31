import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documentId = request.nextUrl.searchParams.get("id");
  if (!documentId) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Check if user is a landlord or a tenant
  const { data: landlord } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: tenant } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("id, property_id")
    .eq("user_id", user.id)
    .single();

  if (!landlord && !tenant) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const adminClient = createAdminClient();
  const { data: doc } = await adminClient
    .schema("landyke")
    .from("documents")
    .select("file_path, landlord_id, tenant_id, property_id")
    .eq("id", documentId)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  // Check access: admin, landlord owner, or tenant (own docs or property-wide docs)
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  const isLandlordOwner = landlord && doc.landlord_id === landlord.id;
  const isTenantOwner = tenant && (
    doc.tenant_id === tenant.id ||
    (doc.tenant_id === null && doc.property_id === tenant.property_id)
  );

  if (!isAdmin && !isLandlordOwner && !isTenantOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: signedUrl } = await adminClient.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 60);

  if (!signedUrl) return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 });
  return NextResponse.json({ url: signedUrl.signedUrl });
}
