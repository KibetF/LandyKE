import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsApp, getWhatsAppSender } from "@/lib/sms/twilio-client";

export const runtime = "nodejs";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let payload: { to?: unknown; body?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const to = typeof payload.to === "string" ? payload.to.trim() : "";
  const body = typeof payload.body === "string" ? payload.body : "";

  if (!to) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  if (!body.trim()) return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  if (body.length > 1600) return NextResponse.json({ error: "Message exceeds 1600 characters" }, { status: 400 });

  const result = await sendWhatsApp(to, body);

  try {
    const admin = createAdminClient();
    const sender = getWhatsAppSender() || "";
    await admin
      .schema("landyke")
      .from("whatsapp_messages")
      .insert({
        message_sid: result.messageSid ?? null,
        direction: "outbound",
        status: result.success ? (result.status || "sent") : "failed",
        error_message: result.error ?? null,
        from_number: sender,
        to_number: result.normalizedTo ?? to,
        body,
        num_media: 0,
        media_urls: [],
        media_content_types: [],
        sent_by_user_id: user.id,
        raw_payload: { initiated_by: user.email },
      });
  } catch (e) {
    console.error("[twilio-send] failed to log outbound message", e);
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Send failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    messageSid: result.messageSid,
    status: result.status,
    to: result.normalizedTo,
  });
}
