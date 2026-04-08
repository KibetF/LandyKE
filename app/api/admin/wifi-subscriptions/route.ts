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

  const adminClient = createAdminClient();
  let query = adminClient
    .schema("landyke")
    .from("wifi_subscriptions")
    .select("*, property_wifi_plans(*, wifi_plans(*)), tenants(full_name, unit_number, property_id, properties(name))")
    .order("created_at", { ascending: false });

  if (propertyId) {
    // Get tenant IDs for this property first
    const { data: tenants } = await adminClient
      .schema("landyke")
      .from("tenants")
      .select("id")
      .eq("property_id", propertyId);

    const tenantIds = (tenants || []).map((t: { id: string }) => t.id);
    if (tenantIds.length === 0) {
      return NextResponse.json({ subscriptions: [] });
    }
    query = query.in("tenant_id", tenantIds);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscriptions: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { tenant_id, property_wifi_plan_id, create_payment, landlord_id } = body;

  if (!tenant_id || !property_wifi_plan_id) {
    return NextResponse.json({ error: "tenant_id and property_wifi_plan_id are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Cancel any existing active subscription for this tenant
  await adminClient
    .schema("landyke")
    .from("wifi_subscriptions")
    .update({ status: "cancelled", ended_at: new Date().toISOString().split("T")[0] })
    .eq("tenant_id", tenant_id)
    .eq("status", "active");

  // Create new subscription
  const { data, error } = await adminClient
    .schema("landyke")
    .from("wifi_subscriptions")
    .insert({
      tenant_id,
      property_wifi_plan_id,
      status: "active",
      started_at: new Date().toISOString().split("T")[0],
    })
    .select("*, property_wifi_plans(*, wifi_plans(*)), tenants(full_name, unit_number, property_id, properties(name))")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Optionally create a WiFi payment entry
  if (create_payment && data && landlord_id) {
    const planName = data.property_wifi_plans?.wifi_plans?.name || "WiFi";
    const price = data.property_wifi_plans?.price || 0;

    await adminClient
      .schema("landyke")
      .from("payments")
      .insert({
        tenant_id,
        landlord_id,
        amount: price,
        paid_date: null,
        due_date: new Date().toISOString().split("T")[0],
        notes: `WiFi - ${planName}`,
        status: "pending",
        payment_type: "wifi",
      });

    // Notify landlord
    const tenantName = data.tenants?.full_name || "Unknown";
    await createNotification(
      adminClient,
      landlord_id,
      "wifi_assigned",
      "WiFi Plan Assigned",
      `${tenantName} assigned to ${planName} WiFi plan (KES ${price.toLocaleString()}/mo)`,
      { tenant_id, plan: planName, price }
    );
  }

  return NextResponse.json({ subscription: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { subscription_id, status } = body;

  if (!subscription_id || !status) {
    return NextResponse.json({ error: "subscription_id and status are required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { status };
  if (status === "cancelled") {
    updates.ended_at = new Date().toISOString().split("T")[0];
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("wifi_subscriptions")
    .update(updates)
    .eq("id", subscription_id)
    .select("*, property_wifi_plans(*, wifi_plans(*)), tenants(full_name, unit_number, property_id, properties(name))")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ subscription: data });
}
