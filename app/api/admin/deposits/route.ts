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
    .from("deposits")
    .select("*, tenants(full_name, property_id, unit_number, phone, properties(name, location))")
    .eq("landlord_id", landlordId)
    .order("deposit_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deposits: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { tenant_id, landlord_id, property_id, amount, deposit_date, notes } = body;

  if (!tenant_id || !landlord_id || !property_id || !amount) {
    return NextResponse.json({ error: "tenant_id, landlord_id, property_id, and amount are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("deposits")
    .insert({
      tenant_id,
      landlord_id,
      property_id,
      amount: Number(amount),
      deposit_date: deposit_date || new Date().toISOString().split("T")[0],
      notes: notes || null,
    })
    .select("*, tenants(full_name, property_id, unit_number, phone, properties(name, location))")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deposit: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { deposit_id, status, return_date, amount_returned, deductions, return_reason, amount, deposit_date, notes } = body;

  if (!deposit_id) {
    return NextResponse.json({ error: "deposit_id is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // If processing a return/refund/forfeit
  if (status && status !== "held") {
    const updateData: Record<string, unknown> = {
      status,
      return_date: return_date || new Date().toISOString().split("T")[0],
      amount_returned: Number(amount_returned || 0),
      deductions: Number(deductions || 0),
      return_reason: return_reason || null,
    };

    const { data, error } = await adminClient
      .schema("landyke")
      .from("deposits")
      .update(updateData)
      .eq("id", deposit_id)
      .eq("status", "held") // Only allow processing held deposits
      .select("*, tenants(full_name, property_id, unit_number, phone, properties(name, location))")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ deposit: data });
  }

  // Otherwise, edit a held deposit's basic fields
  const updateData: Record<string, unknown> = {};
  if (amount !== undefined) updateData.amount = Number(amount);
  if (deposit_date) updateData.deposit_date = deposit_date;
  if (notes !== undefined) updateData.notes = notes || null;

  const { data, error } = await adminClient
    .schema("landyke")
    .from("deposits")
    .update(updateData)
    .eq("id", deposit_id)
    .eq("status", "held")
    .select("*, tenants(full_name, property_id, unit_number, phone, properties(name, location))")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deposit: data });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { deposit_id } = await request.json();
  if (!deposit_id) return NextResponse.json({ error: "deposit_id required" }, { status: 400 });

  const adminClient = createAdminClient();

  // Only allow deleting held deposits
  const { error } = await adminClient
    .schema("landyke")
    .from("deposits")
    .delete()
    .eq("id", deposit_id)
    .eq("status", "held");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
