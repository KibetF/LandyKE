import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ properties: [], tenants: [], payments: [] });

  const { data: landlord } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!landlord) return NextResponse.json({ properties: [], tenants: [], payments: [] });

  // Search properties
  const { data: properties } = await supabase
    .schema("landyke")
    .from("properties")
    .select("id, name, location")
    .eq("landlord_id", landlord.id)
    .ilike("name", `%${q}%`)
    .limit(5);

  // Search tenants
  const { data: tenants } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("id, full_name, property_id, properties(name)")
    .eq("landlord_id", landlord.id)
    .ilike("full_name", `%${q}%`)
    .limit(5);

  // Search payments via tenant name
  const { data: payments } = await supabase
    .schema("landyke")
    .from("payments")
    .select("id, amount, status, paid_date, tenants!inner(full_name, properties(name))")
    .eq("landlord_id", landlord.id)
    .ilike("tenants.full_name", `%${q}%`)
    .limit(5);

  return NextResponse.json({
    properties: properties || [],
    tenants: tenants || [],
    payments: payments || [],
  });
}
