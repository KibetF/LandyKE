// eslint-disable-next-line @typescript-eslint/no-require-imports
const AfricasTalking = require("africastalking");

function getAT() {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!apiKey || !username) throw new Error("Africa's Talking not configured (AT_API_KEY, AT_USERNAME)");
  return AfricasTalking({ apiKey, username });
}

/** Normalize Kenyan numbers to E.164 (+2547xxxxxxxx) */
function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254")) return `+${d}`;
  if (d.startsWith("0")) return `+254${d.slice(1)}`;
  if (d.startsWith("7") || d.startsWith("1")) return `+254${d}`;
  return `+${d}`;
}

/**
 * Send a payment receipt SMS to a tenant.
 * Message stays under 160 chars for standard Safaricom delivery.
 */
export async function sendTenantReceiptSMS(
  tenantName: string,
  phone: string | null,
  amount: number,
  propertyName: string,
  unitNumber: string | null,
  receiptNumber: string
): Promise<{ success: boolean; error?: string }> {
  if (!phone) return { success: false, error: "Tenant has no phone number" };

  const firstName = tenantName.split(" ")[0];
  const unit = unitNumber ? ` unit ${unitNumber}` : "";
  const msg = `Hi ${firstName}, rent of KES ${amount.toLocaleString()} for ${propertyName}${unit} received. Receipt: ${receiptNumber}. -LandyKE`;

  try {
    const at = getAT();
    const to = normalizePhone(phone);
    console.log("[SMS] Sending receipt SMS to:", to, "| username:", process.env.AT_USERNAME);
    const response = await at.SMS.send({ to: [to], message: msg, from: process.env.AT_SENDER_ID || undefined });
    console.log("[SMS] AT response:", JSON.stringify(response));

    // Check individual recipient status
    const recipients = response?.SMSMessageData?.Recipients;
    if (recipients && recipients.length > 0) {
      const r = recipients[0];
      if (r.statusCode === 101 || r.status === "Success") {
        return { success: true };
      }
      return { success: false, error: `AT status: ${r.status} (code ${r.statusCode}) - ${r.number}` };
    }

    // If no recipients in response, check for error message
    const atMessage = response?.SMSMessageData?.Message;
    if (atMessage && atMessage.toLowerCase().includes("error")) {
      return { success: false, error: `AT error: ${atMessage}` };
    }

    return { success: true };
  } catch (err) {
    console.error("[SMS] Error sending SMS:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Send a daily payment summary SMS to a landlord.
 * Only call this when payments.length > 0.
 * Multi-part SMS (>160 chars) is handled transparently by Africa's Talking.
 */
export async function sendDailySummary(
  landlordPhone: string,
  landlordName: string,
  payments: Array<{
    tenantName: string;
    amount: number;
    propertyName: string;
    unitNumber: string | null;
  }>
): Promise<{ success: boolean; error?: string }> {
  if (!payments.length) return { success: false, error: "No payments today" };

  const firstName = landlordName.split(" ")[0];
  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const today = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  const lines = payments.map((p) => {
    const unit = p.unitNumber ? ` U${p.unitNumber}` : "";
    return `${p.tenantName}${unit}: KES ${p.amount.toLocaleString()}`;
  });

  const msg = [
    `LandyKE Daily Summary - ${today}`,
    `Hi ${firstName}, ${payments.length} payment(s) received today.`,
    ...lines,
    `Total: KES ${total.toLocaleString()}`,
  ].join("\n");

  try {
    const at = getAT();
    const to = normalizePhone(landlordPhone);
    console.log("[SMS] Sending daily summary to:", to, "| username:", process.env.AT_USERNAME);
    const response = await at.SMS.send({ to: [to], message: msg, from: process.env.AT_SENDER_ID || undefined });
    console.log("[SMS] AT response:", JSON.stringify(response));

    const recipients = response?.SMSMessageData?.Recipients;
    if (recipients && recipients.length > 0) {
      const r = recipients[0];
      if (r.statusCode === 101 || r.status === "Success") {
        return { success: true };
      }
      return { success: false, error: `AT status: ${r.status} (code ${r.statusCode}) - ${r.number}` };
    }

    const atMessage = response?.SMSMessageData?.Message;
    if (atMessage && atMessage.toLowerCase().includes("error")) {
      return { success: false, error: `AT error: ${atMessage}` };
    }

    return { success: true };
  } catch (err) {
    console.error("[SMS] Error sending SMS:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
