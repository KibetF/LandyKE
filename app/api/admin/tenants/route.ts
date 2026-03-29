import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

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
  const { property_id, landlord_id, full_name, email, phone, rent_amount, unit_number, unit_type } = body;

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
      unit_type: unit_type || null,
      status: "active",
    })
    .select("*, properties(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create notification for new tenant
  if (data) {
    const propertyName = data.properties?.name || "";
    await createNotification(
      adminClient,
      landlord_id,
      "tenant_added",
      "New Tenant Added",
      `${full_name} has been added to ${propertyName}${unit_number ? ` Unit ${unit_number}` : ""}`,
      { tenant_id: data.id, property_id }
    );
  }

  return NextResponse.json({ tenant: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { tenant_id, status, full_name, email, phone, rent_amount, unit_number, unit_type, property_id } = body;

  if (!tenant_id) {
    return NextResponse.json({ error: "tenant_id is required" }, { status: 400 });
  }

  const updateData: Record<string, string | number | null> = {};
  if (status !== undefined) updateData.status = status;
  if (full_name !== undefined) updateData.full_name = full_name;
  if (email !== undefined) updateData.email = email || null;
  if (phone !== undefined) updateData.phone = phone || null;
  if (rent_amount !== undefined) updateData.rent_amount = Number(rent_amount);
  if (unit_number !== undefined) updateData.unit_number = unit_number || null;
  if (unit_type !== undefined) updateData.unit_type = unit_type || null;
  if (property_id !== undefined) updateData.property_id = property_id;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("tenants")
    .update(updateData)
    .eq("id", tenant_id)
    .select("*, properties(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create notification if tenant moved out
  if (data && status === "moved") {
    const propertyName = data.properties?.name || "";
    await createNotification(
      adminClient,
      data.landlord_id,
      "tenant_moved",
      "Tenant Moved Out",
      `${data.full_name} has moved out of ${propertyName}`,
      { tenant_id: data.id }
    );
  }

  return NextResponse.json({ tenant: data });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { tenant_id } = await request.json();
  if (!tenant_id) return NextResponse.json({ error: "tenant_id required" }, { status: 400 });

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .schema("landyke")
    .from("tenants")
    .delete()
    .eq("id", tenant_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
