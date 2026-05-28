import twilio from "twilio";
import { normalizePhone } from "./phone";

export { normalizePhone };

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

export type SendWhatsAppOptions = {
  to: string;
  body?: string;
  contentSid?: string;
  contentVariables?: Record<string, string>;
};

export async function sendWhatsApp(opts: SendWhatsAppOptions): Promise<SendWhatsAppResult> {
  try {
    const normalizedTo = normalizePhone(opts.to);
    const from = getWhatsAppSender();
    if (!from) return { success: false, error: "TWILIO_WHATSAPP_FROM not configured" };

    const params: {
      from: string;
      to: string;
      body?: string;
      contentSid?: string;
      contentVariables?: string;
    } = {
      from: `whatsapp:${from}`,
      to: `whatsapp:${normalizedTo}`,
    };

    if (opts.contentSid) {
      params.contentSid = opts.contentSid;
      if (opts.contentVariables && Object.keys(opts.contentVariables).length > 0) {
        params.contentVariables = JSON.stringify(opts.contentVariables);
      }
    } else {
      params.body = opts.body;
    }

    const msg = await getClient().messages.create(params);
    return { success: true, messageSid: msg.sid, status: msg.status, normalizedTo };
  } catch (e) {
    const err = e as { message?: string };
    return { success: false, error: err?.message || "Twilio send failed" };
  }
}

export type WhatsAppTemplate = {
  sid: string;
  name: string;
  body: string;
  variables: string[]; // ordered variable keys, e.g. ["1", "2"]
  language: string;
};

/** List WhatsApp content templates that Meta has approved. */
export async function listApprovedTemplates(): Promise<WhatsAppTemplate[]> {
  const client = getClient();
  const items = await client.content.v1.contentAndApprovals.list({ limit: 200 });

  const templates: WhatsAppTemplate[] = [];
  for (const item of items) {
    const approval = item.approvalRequests as
      | { status?: string; whatsapp?: { status?: string } }
      | undefined;
    const status = approval?.whatsapp?.status || approval?.status;
    if (status !== "approved") continue;

    const types = item.types as Record<string, { body?: string }> | undefined;
    let body = "";
    if (types) {
      const firstType = Object.values(types)[0];
      body = firstType?.body || "";
    }

    const varsObj = (item.variables as unknown as Record<string, string> | undefined) || {};
    let variables = Object.keys(varsObj).sort((a, b) => Number(a) - Number(b));
    if (variables.length === 0) {
      variables = Array.from(
        new Set([...body.matchAll(/\{\{(\d+)\}\}/g)].map((m) => m[1]))
      ).sort((a, b) => Number(a) - Number(b));
    }

    templates.push({
      sid: item.sid,
      name: item.friendlyName,
      body,
      variables,
      language: item.language,
    });
  }
  return templates;
}
