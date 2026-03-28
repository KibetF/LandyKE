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

  const propertyId = request.nextUrl.searchParams.get("property_id");
  const landlordId = request.nextUrl.searchParams.get("landlord_id");

  const adminClient = createAdminClient();

  if (propertyId) {
    const { data, error } = await adminClient
      .schema("landyke")
      .from("tenants")
      .select("*, properties(name)")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tenants: data });
  }

  if (landlordId) {
    const { data, error } = await adminClient
      .schema("landyke")
      .from("tenants")
      .select("*, properties(name)")
      .eq("landlord_id", landlordId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tenants: data || [] });
  }

  return NextResponse.json({ error: "property_id or landlord_id required" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { property_id, landlord_id, full_name, email, phone, rent_amount, unit_number } = body;

  if (!property_id || !full_name || !rent_amount || !landlord_id) {
    return NextResponse.json({ error: "property_id, landlord_id, full_name, and rent_amount are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("tenants")
    .insert({
      property_id,
      landlord_id,
      full_name,
      email: email || null,
      phone: phone || null,
      rent_amount: Number(rent_amount),
      unit_number: unit_number || null,
      status: "active",
    })
    .select("*, properties(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ tenant: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { tenant_id, status } = body;

  if (!tenant_id || !status) {
    return NextResponse.json({ error: "tenant_id and status are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("tenants")
    .update({ status })
    .eq("id", tenant_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ tenant: data });
}
