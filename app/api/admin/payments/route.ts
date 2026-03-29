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

  const landlordId = request.nextUrl.searchParams.get("landlord_id");
  if (!landlordId) return NextResponse.json({ error: "landlord_id required" }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("payments")
    .select("*, tenants(full_name, property_id, properties(name))")
    .eq("landlord_id", landlordId)
    .order("paid_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { tenant_id, landlord_id, amount, paid_date, due_date, notes, status } = body;

  if (!tenant_id || !landlord_id || !amount || !status) {
    return NextResponse.json({ error: "tenant_id, landlord_id, amount, and status are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("payments")
    .insert({
      tenant_id,
      landlord_id,
      amount: Number(amount),
      paid_date: paid_date || null,
      due_date: due_date || null,
      notes: notes || null,
      status,
    })
    .select("*, tenants(full_name, property_id, properties(name))")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create notification for payment received
  if (data) {
    const tenantName = data.tenants?.full_name || "Unknown";
    const propertyName = data.tenants?.properties?.name || "";
    await createNotification(
      adminClient,
      landlord_id,
      "payment_received",
      "Payment Received",
      `KES ${Number(amount).toLocaleString()} from ${tenantName} — ${propertyName}`,
      { payment_id: data.id, tenant_id, amount: Number(amount) }
    );
  }

  return NextResponse.json({ payment: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { payment_id, status, paid_date } = body;

  if (!payment_id || !status) {
    return NextResponse.json({ error: "payment_id and status are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const updateData: Record<string, string | null> = { status };
  if (status === "paid" && paid_date) {
    updateData.paid_date = paid_date;
  }

  const { data, error } = await adminClient
    .schema("landyke")
    .from("payments")
    .update(updateData)
    .eq("id", payment_id)
    .select("*, tenants(full_name, property_id, properties(name))")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create notification if payment marked overdue
  if (data && status === "overdue") {
    const tenantName = data.tenants?.full_name || "Unknown";
    const propertyName = data.tenants?.properties?.name || "";
    await createNotification(
      adminClient,
      data.landlord_id,
      "payment_overdue",
      "Payment Overdue",
      `${tenantName} — ${propertyName} payment is now overdue`,
      { payment_id: data.id, tenant_id: data.tenant_id }
    );
  }

  return NextResponse.json({ payment: data });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { payment_id } = await request.json();
  if (!payment_id) return NextResponse.json({ error: "payment_id required" }, { status: 400 });

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .schema("landyke")
    .from("payments")
    .delete()
    .eq("id", payment_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
