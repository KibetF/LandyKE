import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documentId = request.nextUrl.searchParams.get("id");
  if (!documentId) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify landlord owns document
  const { data: landlord } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!landlord) return NextResponse.json({ error: "Landlord not found" }, { status: 404 });

  const adminClient = createAdminClient();
  const { data: doc } = await adminClient
    .schema("landyke")
    .from("documents")
    .select("file_path, landlord_id")
    .eq("id", documentId)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  // Check admin or owner
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  if (!isAdmin && doc.landlord_id !== landlord.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: signedUrl } = await adminClient.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 60);

  if (!signedUrl) return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 });
  return NextResponse.json({ url: signedUrl.signedUrl });
}
