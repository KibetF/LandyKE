import { sendWhatsApp, type SendWhatsAppResult } from "./twilio-client";

/**
 * Send a payment receipt to a tenant over WhatsApp.
 *
 * Receipts go to tenants who usually haven't messaged us in the last 24h, so
 * this must use an approved WhatsApp template (free-form would fail with error
 * 63016). Set TWILIO_RECEIPT_TEMPLATE_SID to the approved template's content
 * SID. The template body must use these variables in order:
 *   {{1}} tenant name · {{2}} amount (KES) · {{3}} property · {{4}} unit · {{5}} receipt no.
 */
export async function sendTenantReceiptSMS(
  tenantName: string,
  phone: string | null,
  amount: number,
  propertyName: string,
  unitNumber: string | null,
  receiptNumber: string
): Promise<SendWhatsAppResult> {
  if (!phone) return { success: false, error: "Tenant has no phone number" };

  const contentSid = process.env.TWILIO_RECEIPT_TEMPLATE_SID;
  if (!contentSid) {
    return {
      success: false,
      error: "Receipt WhatsApp template not configured (TWILIO_RECEIPT_TEMPLATE_SID)",
    };
  }

  return sendWhatsApp({
    to: phone,
    contentSid,
    contentVariables: {
      "1": tenantName,
      "2": amount.toLocaleString("en-KE"),
      "3": propertyName,
      "4": unitNumber ?? "—",
      "5": receiptNumber,
    },
  });
}
