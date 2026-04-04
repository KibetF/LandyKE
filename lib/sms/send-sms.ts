/** Normalize Kenyan numbers to E.164 (+2547xxxxxxxx) */
function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254")) return `+${d}`;
  if (d.startsWith("0")) return `+254${d.slice(1)}`;
  if (d.startsWith("7") || d.startsWith("1")) return `+254${d}`;
  return `+${d}`;
}

/**
 * Send a payment receipt message to a tenant.
 * TODO: Re-enable once Twilio/WhatsApp verification is complete.
 */
export async function sendTenantReceiptSMS(
  tenantName: string,
  phone: string | null,
  amount: number,
  propertyName: string,
  unitNumber: string | null,
  receiptNumber: string,
  _channel: "whatsapp" | "sms" = "whatsapp"
): Promise<{ success: boolean; error?: string }> {
  if (!phone) return { success: false, error: "Tenant has no phone number" };

  const to = normalizePhone(phone);
  console.log(`[MSG] Would send receipt to ${to} for ${receiptNumber} (messaging disabled pending provider setup)`);

  return { success: false, error: "Messaging temporarily disabled — provider setup in progress" };
}

/**
 * Send a daily payment summary to a landlord.
 * TODO: Re-enable once Twilio/WhatsApp verification is complete.
 */
export async function sendDailySummary(
  landlordPhone: string,
  landlordName: string,
  payments: Array<{
    tenantName: string;
    amount: number;
    propertyName: string;
    unitNumber: string | null;
  }>,
  _channel: "whatsapp" | "sms" = "whatsapp"
): Promise<{ success: boolean; error?: string }> {
  if (!payments.length) return { success: false, error: "No payments today" };

  const to = normalizePhone(landlordPhone);
  console.log(`[MSG] Would send daily summary to ${to} for ${landlordName} (messaging disabled pending provider setup)`);

  return { success: false, error: "Messaging temporarily disabled — provider setup in progress" };
}
