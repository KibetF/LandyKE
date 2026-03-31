import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  // 1. Verify authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify user is a caretaker
  const adminClient = createAdminClient();
  const { data: roleData } = await adminClient
    .schema("landyke")
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleData?.role !== "caretaker") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Parse and validate request body
  const body = await request.json();
  const { tenant_id, amount, paid_date, method, mpesa_reference } = body;

  if (!tenant_id || !amount || !paid_date || !method) {
    return NextResponse.json(
      { error: "tenant_id, amount, paid_date, and method are required" },
      { status: 400 }
    );
  }

  // 4. Look up tenant to get property_id
  const { data: tenant } = await adminClient
    .schema("landyke")
    .from("tenants")
    .select("id, full_name, property_id, properties(name, landlord_id)")
    .eq("id", tenant_id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // 5. Verify this property is in the caretaker's assignments (defense-in-depth)
  const { data: assignment } = await adminClient
    .schema("landyke")
    .from("caretaker_assignments")
    .select("id")
    .eq("caretaker_id", user.id)
    .eq("property_id", tenant.property_id)
    .single();

  if (!assignment) {
    return NextResponse.json(
      { error: "You are not assigned to this property" },
      { status: 403 }
    );
  }

  // Supabase may return properties as array or object depending on join
  const props = Array.isArray(tenant.properties) ? tenant.properties[0] : tenant.properties;
  const landlordId = props?.landlord_id;
  if (!landlordId) {
    return NextResponse.json({ error: "Property landlord not found" }, { status: 500 });
  }

  // 6. Build notes from method + optional M-Pesa reference
  let notes = method;
  if (method === "M-Pesa" && mpesa_reference) {
    notes = `M-Pesa · ${mpesa_reference}`;
  }

  // 7. Insert payment
  const { data: payment, error } = await adminClient
    .schema("landyke")
    .from("payments")
    .insert({
      tenant_id,
      landlord_id: landlordId,
      amount: Number(amount),
      paid_date,
      status: "paid",
      notes,
      marked_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 8. Create notification for the landlord
  const propertyName = props?.name || "";
  await createNotification(
    adminClient,
    landlordId,
    "payment_received",
    "Payment Received",
    `KES ${Number(amount).toLocaleString()} from ${tenant.full_name} — ${propertyName} (marked by caretaker)`,
    { payment_id: payment.id, tenant_id, amount: Number(amount), marked_by: user.id }
  );

  return NextResponse.json({ payment }, { status: 201 });
}
