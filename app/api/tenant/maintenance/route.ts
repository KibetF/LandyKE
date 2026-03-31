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

  // Verify the user is a tenant
  const { data: tenant } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("id, property_id, unit_number, full_name")
    .eq("user_id", user.id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
  }

  const { description, priority } = await req.json();

  if (!description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  const validPriorities = ["low", "medium", "high", "urgent"];
  if (!validPriorities.includes(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  // Look up landlord_id from the property
  const { data: property } = await supabase
    .schema("landyke")
    .from("properties")
    .select("landlord_id")
    .eq("id", tenant.property_id)
    .single();

  const landlordId = property?.landlord_id;

  const adminClient = createAdminClient();

  const { error: insertError } = await adminClient
    .schema("landyke")
    .from("maintenance_requests")
    .insert({
      landlord_id: landlordId,
      property_id: tenant.property_id,
      tenant_id: tenant.id,
      unit_number: tenant.unit_number,
      description: description.trim(),
      priority,
      status: "open",
      date_submitted: new Date().toISOString().split("T")[0],
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Notify the landlord
  if (landlordId) {
    await createNotification(
      adminClient,
      landlordId,
      "maintenance_request",
      "New Maintenance Request",
      `${tenant.full_name} (Unit ${tenant.unit_number || "—"}) reported a ${priority} priority issue.`,
      { tenant_id: tenant.id, priority }
    );
  }

  return NextResponse.json({ message: "Request submitted" });
}
