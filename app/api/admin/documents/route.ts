import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const landlordId = request.nextUrl.searchParams.get("landlord_id");
  if (!landlordId) return NextResponse.json({ error: "landlord_id required" }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("documents")
    .select("*, properties(name)")
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const landlordId = formData.get("landlord_id") as string;
  const propertyId = formData.get("property_id") as string | null;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;

  if (!file || !landlordId || !name || !type) {
    return NextResponse.json({ error: "file, landlord_id, name, and type are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Upload file to storage
  const filePath = `${landlordId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await adminClient.storage
    .from("documents")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Insert document record
  const { data, error } = await adminClient
    .schema("landyke")
    .from("documents")
    .insert({
      landlord_id: landlordId,
      property_id: propertyId || null,
      name,
      type,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
    })
    .select("*, properties(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ document: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { document_id } = await request.json();
  if (!document_id) return NextResponse.json({ error: "document_id required" }, { status: 400 });

  const adminClient = createAdminClient();

  // Get file path first
  const { data: doc } = await adminClient
    .schema("landyke")
    .from("documents")
    .select("file_path")
    .eq("id", document_id)
    .single();

  if (doc?.file_path) {
    await adminClient.storage.from("documents").remove([doc.file_path]);
  }

  const { error } = await adminClient
    .schema("landyke")
    .from("documents")
    .delete()
    .eq("id", document_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
