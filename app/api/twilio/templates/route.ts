import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listApprovedTemplates } from "@/lib/sms/twilio-client";

export const runtime = "nodejs";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const templates = await listApprovedTemplates();
    return NextResponse.json({ templates });
  } catch (e) {
    const err = e as { message?: string };
    console.error("[twilio-templates] list failed", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to load templates" }, { status: 500 });
  }
}
