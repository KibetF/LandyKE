import twilio from "twilio";

export function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254")) return `+${d}`;
  if (d.startsWith("0")) return `+254${d.slice(1)}`;
  if (d.startsWith("7") || d.startsWith("1")) return `+254${d}`;
  return `+${d}`;
}

let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (_client) return _client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials missing");
  _client = twilio(sid, token);
  return _client;
}

export function getWhatsAppSender(): string | null {
  const fromRaw = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_PHONE_NUMBER;
  if (!fromRaw) return null;
  return fromRaw.startsWith("+") ? fromRaw : `+${fromRaw}`;
}

export type SendWhatsAppResult = {
  success: boolean;
  messageSid?: string;
  status?: string;
  error?: string;
  normalizedTo?: string;
};

export async function sendWhatsApp(to: string, body: string): Promise<SendWhatsAppResult> {
  try {
    const normalizedTo = normalizePhone(to);
    const from = getWhatsAppSender();
    if (!from) return { success: false, error: "TWILIO_WHATSAPP_FROM not configured" };

    const msg = await getClient().messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${normalizedTo}`,
      body,
    });

    return { success: true, messageSid: msg.sid, status: msg.status, normalizedTo };
  } catch (e) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Twilio send failed" };
  }
}
