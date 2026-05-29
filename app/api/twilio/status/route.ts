import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Twilio message status callback. Twilio POSTs delivery transitions
 * (queued → sent → delivered → read, or undelivered/failed + ErrorCode) here
 * for each outbound message. We update the matching landyke.whatsapp_messages
 * row by message_sid. Always returns 200 so Twilio doesn't retry; the only
 * non-2xx is an invalid signature.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);
  const payload: Record<string, string> = {};
  params.forEach((v, k) => {
    payload[k] = v;
  });

  if (process.env.NODE_ENV === "production") {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
      console.error("[twilio-status] TWILIO_AUTH_TOKEN missing in production");
      return new NextResponse("Server misconfigured", { status: 500 });
    }
    const signature = request.headers.get("x-twilio-signature") || "";
    const url = `${process.env.PUBLIC_APP_URL}/api/twilio/status`;
    const ok = twilio.validateRequest(authToken, signature, url, payload);
    if (!ok) {
      console.warn("[twilio-status] invalid signature", { url });
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const messageSid = payload.MessageSid || payload.SmsSid;
  const status = payload.MessageStatus || payload.SmsStatus;
  const errorCode = payload.ErrorCode;

  if (messageSid && status) {
    try {
      const admin = createAdminClient();
      const update: { status: string; error_message?: string } = { status };
      // Only set an error on failure; never wipe an existing message on success.
      if (errorCode) update.error_message = `Twilio error ${errorCode}`;

      const { error } = await admin
        .schema("landyke")
        .from("whatsapp_messages")
        .update(update)
        .eq("message_sid", messageSid);
      if (error) console.error("[twilio-status] update failed", error.message);
    } catch (e) {
      console.error("[twilio-status] handler error", (e as { message?: string })?.message);
    }
  }

  return new NextResponse("", { status: 200 });
}
