import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsApp, getWhatsAppSender } from "@/lib/sms/twilio-client";
import twilio from "twilio";

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

  let payload: { to?: unknown; body?: unknown; contentSid?: unknown; contentVariables?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const to = typeof payload.to === "string" ? payload.to.trim() : "";
  const body = typeof payload.body === "string" ? payload.body : "";
  const contentSid = typeof payload.contentSid === "string" ? payload.contentSid.trim() : "";
  const contentVariables =
    payload.contentVariables && typeof payload.contentVariables === "object"
      ? (payload.contentVariables as Record<string, string>)
      : undefined;

  if (!to) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

  const isTemplate = contentSid.length > 0;
  if (!isTemplate) {
    if (!body.trim()) return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    if (body.length > 1600) return NextResponse.json({ error: "Message exceeds 1600 characters" }, { status: 400 });
  }

  const result = isTemplate
    ? await sendWhatsApp({ to, contentSid, contentVariables })
    : await sendWhatsApp({ to, body });

  if (!result.success && result.error === "Invalid phone number") {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Poll Twilio once after a short delay to see if status advanced
  let finalStatus = result.status;
  let twilioErrorCode: number | null = null;
  let twilioErrorMessage: string | null = null;
  if (result.success && result.messageSid) {
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      if (sid && token) {
        const client = twilio(sid, token);
        const fetched = await client.messages(result.messageSid).fetch();
        finalStatus = fetched.status;
        twilioErrorCode = fetched.errorCode ?? null;
        twilioErrorMessage = fetched.errorMessage ?? null;
      }
    } catch (e) {
      console.error("[twilio-send] fetch follow-up failed", e);
    }
  }

  // Audit log — service-role insert
  try {
    const admin = createAdminClient();
    const sender = getWhatsAppSender() || "";
    const insertPayload = {
      message_sid: result.messageSid ?? null,
      direction: "outbound",
      status: result.success ? (finalStatus || "sent") : "failed",
      error_message: twilioErrorMessage || result.error || null,
      from_number: sender,
      to_number: result.normalizedTo ?? to,
      body: isTemplate ? `[template ${contentSid}]` : body,
      num_media: 0,
      media_urls: [],
      media_content_types: [],
      sent_by_user_id: user.id,
      raw_payload: {
        initiated_by: user.email,
        kind: isTemplate ? "template" : "freeform",
        content_sid: isTemplate ? contentSid : null,
        content_variables: isTemplate ? (contentVariables ?? null) : null,
        twilio_error_code: twilioErrorCode,
        initial_status: result.status,
        final_status: finalStatus,
      },
    };
    const { error: logError } = await admin
      .schema("landyke")
      .from("whatsapp_messages")
      .insert(insertPayload);
    if (logError) {
      console.error("[twilio-send] audit insert failed", logError.message);
    }
  } catch (e) {
    const err = e as { message?: string; stack?: string };
    console.error("[twilio-send] unexpected log error", err?.message, err?.stack);
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Send failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    messageSid: result.messageSid,
    status: finalStatus,
    initialStatus: result.status,
    twilioErrorCode,
    twilioErrorMessage,
    to: result.normalizedTo,
  });
}
