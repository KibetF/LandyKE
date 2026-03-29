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
    .from("maintenance_requests")
    .select("*, properties(name), tenants(full_name)")
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { landlord_id, property_id, tenant_id, unit_number, description, priority, notes } = body;

  if (!landlord_id || !property_id || !description || !priority) {
    return NextResponse.json({ error: "landlord_id, property_id, description, and priority are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("maintenance_requests")
    .insert({
      landlord_id,
      property_id,
      tenant_id: tenant_id || null,
      unit_number: unit_number || null,
      description,
      priority,
      notes: notes || null,
    })
    .select("*, properties(name), tenants(full_name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ request: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { request_id, status, notes, date_resolved } = body;

  if (!request_id || !status) {
    return NextResponse.json({ error: "request_id and status are required" }, { status: 400 });
  }

  const updateData: Record<string, string | null> = { status };
  if (notes !== undefined) updateData.notes = notes;
  if (status === "completed") {
    updateData.date_resolved = date_resolved || new Date().toISOString().slice(0, 10);
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("maintenance_requests")
    .update(updateData)
    .eq("id", request_id)
    .select("*, properties(name), tenants(full_name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ request: data });
}
