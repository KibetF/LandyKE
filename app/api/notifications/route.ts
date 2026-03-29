import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get landlord id
  const { data: landlord } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!landlord) return NextResponse.json({ error: "Landlord not found" }, { status: 404 });

  const { data, error } = await supabase
    .schema("landyke")
    .from("notifications")
    .select("*")
    .eq("landlord_id", landlord.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data || [] });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: landlord } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!landlord) return NextResponse.json({ error: "Landlord not found" }, { status: 404 });

  const body = await request.json();
  const { notification_id, mark_all } = body;

  if (mark_all) {
    const { error } = await supabase
      .schema("landyke")
      .from("notifications")
      .update({ is_read: true })
      .eq("landlord_id", landlord.id)
      .eq("is_read", false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (notification_id) {
    const { error } = await supabase
      .schema("landyke")
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification_id)
      .eq("landlord_id", landlord.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "notification_id or mark_all required" }, { status: 400 });
}
