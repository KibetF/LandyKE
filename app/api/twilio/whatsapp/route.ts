import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
      console.error("[twilio-webhook] TWILIO_AUTH_TOKEN missing in production");
      return new NextResponse("Server misconfigured", { status: 500 });
    }
    const signature = request.headers.get("x-twilio-signature") || "";
    const url = `${process.env.PUBLIC_APP_URL}/api/twilio/whatsapp`;
    const ok = twilio.validateRequest(authToken, signature, url, payload);
    if (!ok) {
      console.warn("[twilio-webhook] invalid signature", { url });
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const messageSid = payload.MessageSid;
  const from = (payload.From || "").replace(/^whatsapp:/, "");
  const to = (payload.To || "").replace(/^whatsapp:/, "");
  const body = payload.Body || "";
  const numMedia = parseInt(payload.NumMedia || "0", 10);
  const mediaUrls: string[] = [];
  const mediaTypes: string[] = [];
  for (let i = 0; i < numMedia; i++) {
    if (payload[`MediaUrl${i}`]) mediaUrls.push(payload[`MediaUrl${i}`]);
    if (payload[`MediaContentType${i}`]) mediaTypes.push(payload[`MediaContentType${i}`]);
  }

  console.log("[whatsapp-in]", {
    from,
    to,
    body,
    numMedia,
    mediaUrls,
    profileName: payload.ProfileName,
    sid: messageSid,
  });

  if (messageSid) {
    const admin = createAdminClient();
    const { error } = await admin
      .schema("landyke")
      .from("whatsapp_messages")
      .insert({
        message_sid: messageSid,
        from_number: from,
        to_number: to,
        body,
        num_media: numMedia,
        media_urls: mediaUrls,
        media_content_types: mediaTypes,
        profile_name: payload.ProfileName ?? null,
        wa_id: payload.WaId ?? null,
        raw_payload: payload,
      });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      console.error("[whatsapp-in] insert failed", error);
    }
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message("Thanks, we received your message — LandyKE.");
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
