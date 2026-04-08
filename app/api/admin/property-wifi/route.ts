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
  if (!propertyId) return NextResponse.json({ error: "property_id required" }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("property_wifi_plans")
    .select("*, wifi_plans(*)")
    .eq("property_id", propertyId)
    .order("wifi_plans(sort_order)", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { property_id, wifi_plan_id, price } = body;

  if (!property_id || !wifi_plan_id || !price) {
    return NextResponse.json({ error: "property_id, wifi_plan_id, and price are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("property_wifi_plans")
    .upsert(
      { property_id, wifi_plan_id, price: Number(price), is_available: true },
      { onConflict: "property_id,wifi_plan_id" }
    )
    .select("*, wifi_plans(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ plan: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, price, is_available } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (price !== undefined) updates.price = Number(price);
  if (is_available !== undefined) updates.is_available = is_available;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("property_wifi_plans")
    .update(updates)
    .eq("id", id)
    .select("*, wifi_plans(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ plan: data });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .schema("landyke")
    .from("property_wifi_plans")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
