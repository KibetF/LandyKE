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

  // Get properties for this landlord
  const { data: properties } = await adminClient
    .schema("landyke")
    .from("properties")
    .select("id")
    .eq("landlord_id", landlordId);

  if (!properties || properties.length === 0) {
    return NextResponse.json({ payments: [] });
  }

  const { data, error } = await adminClient
    .schema("landyke")
    .from("payments")
    .select("*, tenants(full_name, unit_number), properties(name)")
    .in("property_id", properties.map((p) => p.id))
    .order("payment_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { tenant_id, property_id, amount, payment_date, method, status } = body;

  if (!tenant_id || !property_id || !amount || !payment_date || !method || !status) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .schema("landyke")
    .from("payments")
    .insert({
      tenant_id,
      property_id,
      amount: Number(amount),
      payment_date,
      method,
      status,
    })
    .select("*, tenants(full_name, unit_number), properties(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ payment: data }, { status: 201 });
}
