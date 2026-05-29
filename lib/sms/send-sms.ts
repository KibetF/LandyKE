import { sendWhatsApp, type SendWhatsAppResult } from "./twilio-client";
import { formatDate } from "@/lib/pdf/generate-receipt";

/**
 * Send a payment receipt to a tenant over WhatsApp.
 *
 * Receipts go to tenants who usually haven't messaged us in the last 24h, so
 * this must use an approved WhatsApp template (free-form would fail with error
 * 63016). Set TWILIO_RECEIPT_TEMPLATE_SID to the approved template's content
 * SID. The template body must use these variables in order:
 *   {{1}} tenant name · {{2}} amount (KES) · {{3}} paid date · {{4}} property ·
 *   {{5}} unit · {{6}} receipt no.
 *
 * When `mediaPath` is supplied it is passed as {{7}} — the media URL path for
 * the twilio/media template (everything after /public/, e.g.
 * "receipts/LK-RCP-….pdf"). This attaches the PDF at the top of the message.
 */
export async function sendTenantReceiptSMS(
  tenantName: string,
  phone: string | null,
  amount: number,
  paidDate: string,
  propertyName: string,
  unitNumber: string | null,
  receiptNumber: string,
  mediaPath?: string | null
): Promise<SendWhatsAppResult> {
  if (!phone) return { success: false, error: "Tenant has no phone number" };

  const contentSid = process.env.TWILIO_RECEIPT_TEMPLATE_SID;
  if (!contentSid) {
    return {
      success: false,
      error: "Receipt WhatsApp template not configured (TWILIO_RECEIPT_TEMPLATE_SID)",
    };
  }

  const contentVariables: Record<string, string> = {
    "1": tenantName,
    "2": amount.toLocaleString("en-KE"),
    "3": formatDate(paidDate),
    "4": propertyName,
    "5": unitNumber ?? "—",
    "6": receiptNumber,
  };
  // {{7}} = media URL path for the twilio/media template. Harmless on the legacy
  // text template (Twilio ignores variables the template doesn't reference);
  // once TWILIO_RECEIPT_TEMPLATE_SID points to the approved media template, this
  // renders the PDF at the top of the message.
  if (mediaPath) contentVariables["7"] = mediaPath;

  return sendWhatsApp({ to: phone, contentSid, contentVariables });
}

/**
 * Send a payment reminder to a tenant over WhatsApp.
 *
 * Business-initiated, so it requires a Meta-approved template. Set
 * TWILIO_REMINDER_TEMPLATE_SID to the approved template's content SID.
 * The template body must use these variables in order:
 *   {{1}} tenant name · {{2}} charge type · {{3}} amount (KES) · {{4}} month ·
 *   {{5}} property · {{6}} unit.
 */
export async function sendTenantReminderWhatsApp(
  tenantName: string,
  phone: string | null,
  chargeType: string,
  amount: number,
  monthLabel: string,
  propertyName: string,
  unitNumber: string | null
): Promise<SendWhatsAppResult> {
  if (!phone) return { success: false, error: "Tenant has no phone number" };

  const contentSid = process.env.TWILIO_REMINDER_TEMPLATE_SID;
  if (!contentSid) {
    return {
      success: false,
      error: "Reminder WhatsApp template not configured (TWILIO_REMINDER_TEMPLATE_SID)",
    };
  }

  return sendWhatsApp({
    to: phone,
    contentSid,
    contentVariables: {
      "1": tenantName,
      "2": chargeType,
      "3": amount.toLocaleString("en-KE"),
      "4": monthLabel,
      "5": propertyName,
      "6": unitNumber ?? "—",
    },
  });
}
