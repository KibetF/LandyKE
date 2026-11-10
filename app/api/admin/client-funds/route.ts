import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Client funds: non-rent money held for a client (e.g. a lump sum awaiting a
// fixed-deposit placement). Stored apart from payments so rent totals stay
// rent-only — see supabase/migrations/022_client_funds.sql.

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (v: unknown): v is string => typeof v === "string" && DATE_RE.test(v);

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const landlordId = request.nextUrl.searchParams.get("landlord_id");
  if (!landlordId) return NextResponse.json({ error: "landlord_id required" }, { status: 400 });

  const { data, error } = await createAdminClient()
    .schema("landyke")
    .from("client_funds")
    .select("*")
    .eq("landlord_id", landlordId)
    .order("received_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ funds: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { landlord_id, amount, received_date, purpose, notes } = await request.json();
  const n = Number(amount);
  if (!landlord_id || !Number.isFinite(n) || n <= 0 || !isDate(received_date)) {
    return NextResponse.json({ error: "landlord_id, a positive amount and received_date (YYYY-MM-DD) are required" }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .schema("landyke")
    .from("client_funds")
    .insert({
      landlord_id,
      amount: n,
      received_date,
      purpose: (typeof purpose === "string" && purpose.trim()) || "Fixed deposit",
      notes: (typeof notes === "string" && notes.trim()) || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ fund: data }, { status: 201 });
}

// Mark funds as sent on (or back to held).
export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, sent_date, sent_to } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let updates: { status: string; sent_date: string | null; sent_to: string | null };
  if (status === "sent") {
    if (!isDate(sent_date)) return NextResponse.json({ error: "sent_date (YYYY-MM-DD) required" }, { status: 400 });
    updates = { status: "sent", sent_date, sent_to: (typeof sent_to === "string" && sent_to.trim()) || null };
  } else if (status === "held") {
    updates = { status: "held", sent_date: null, sent_to: null };
  } else {
    return NextResponse.json({ error: "status must be 'held' or 'sent'" }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .schema("landyke")
    .from("client_funds")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ fund: data });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await createAdminClient().schema("landyke").from("client_funds").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
