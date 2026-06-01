import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: { carryover_amount?: number; carryover_as_of?: string | null } = {};

  if ("carryover_amount" in body) {
    const n = Number(body.carryover_amount);
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json({ error: "carryover_amount must be a non-negative number" }, { status: 400 });
    }
    updates.carryover_amount = n;
  }

  if ("carryover_as_of" in body) {
    const v = body.carryover_as_of;
    if (v !== null && (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v))) {
      return NextResponse.json({ error: "carryover_as_of must be YYYY-MM-DD or null" }, { status: 400 });
    }
    updates.carryover_as_of = v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updatable fields supplied" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: landlord, error } = await adminClient
    .schema("landyke")
    .from("landlords")
    .update(updates)
    .eq("id", id)
    .select("id, full_name, email, phone, created_at, carryover_amount, carryover_as_of")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ landlord });
}
