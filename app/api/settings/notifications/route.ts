import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("notification_preferences")
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: data?.notification_preferences });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { notification_preferences } = body;

  if (!notification_preferences) {
    return NextResponse.json({ error: "notification_preferences is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .schema("landyke")
    .from("landlords")
    .update({ notification_preferences })
    .eq("user_id", user.id)
    .select("notification_preferences")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: data?.notification_preferences });
}
