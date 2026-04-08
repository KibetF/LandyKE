import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: tenant } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("id, property_id, unit_number, full_name")
    .eq("user_id", user.id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
  }

  const { requested_plan_name } = await req.json();

  if (!requested_plan_name?.trim()) {
    return NextResponse.json({ error: "Plan name is required" }, { status: 400 });
  }

  // Look up landlord_id from the property
  const { data: property } = await supabase
    .schema("landyke")
    .from("properties")
    .select("landlord_id")
    .eq("id", tenant.property_id)
    .single();

  const landlordId = property?.landlord_id;

  if (landlordId) {
    const adminClient = createAdminClient();
    await createNotification(
      adminClient,
      landlordId,
      "wifi_change_request",
      "WiFi Plan Change Request",
      `${tenant.full_name} (Unit ${tenant.unit_number || "—"}) requests to change to ${requested_plan_name} WiFi plan.`,
      { tenant_id: tenant.id, requested_plan: requested_plan_name }
    );
  }

  return NextResponse.json({ success: true, message: "Change request sent to admin" });
}
