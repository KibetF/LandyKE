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
    // Get all properties for this landlord, then all tenants
    const { data: properties } = await adminClient
      .schema("landyke")
      .from("properties")
      .select("id")
      .eq("landlord_id", landlordId);

    if (!properties || properties.length === 0) {
      return NextResponse.json({ tenants: [] });
    }

    const { data, error } = await adminClient
      .schema("landyke")
      .from("tenants")
      .select("*, properties(name)")
      .in("property_id", properties.map((p) => p.id))
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tenants: data });
  }

  return NextResponse.json({ error: "property_id or landlord_id required" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { property_id, full_name, unit_number, phone, monthly_rent, is_active } = body;

  if (!property_id || !full_name || !monthly_rent) {
    return NextResponse.json({ error: "property_id, full_name, and monthly_rent are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("tenants")
    .insert({
      property_id,
      full_name,
      unit_number: unit_number || null,
      phone: phone || null,
      monthly_rent: Number(monthly_rent),
      is_active: is_active !== false,
    })
    .select("*, properties(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ tenant: data }, { status: 201 });
}
