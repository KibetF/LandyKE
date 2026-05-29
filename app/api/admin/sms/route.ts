import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReceiptNumber, type ReceiptData } from "@/lib/pdf/generate-receipt";
import { uploadReceiptPdf } from "@/lib/receipts/upload";
import { sendTenantReceiptSMS, sendTenantReminderWhatsApp } from "@/lib/sms/send-sms";
import { getWhatsAppSender, type SendWhatsAppResult } from "@/lib/sms/twilio-client";

// jsPDF + Buffer (server-side receipt PDF generation) require the Node runtime.
export const runtime = "nodejs";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

/** Best-effort audit log of an outbound WhatsApp send to landyke.whatsapp_messages. */
async function logOutbound(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  result: SendWhatsAppResult,
  to: string,
  body: string,
  raw: Record<string, unknown>,
  mediaUrls: string[] = []
) {
  try {
    const { error } = await admin
      .schema("landyke")
      .from("whatsapp_messages")
      .insert({
        message_sid: result.messageSid ?? null,
        direction: "outbound",
        status: result.success ? result.status || "sent" : "failed",
        error_message: result.error ?? null,
        from_number: getWhatsAppSender() || "",
        to_number: result.normalizedTo ?? to,
        body,
        num_media: mediaUrls.length,
        media_urls: mediaUrls,
        media_content_types: mediaUrls.map(() => "application/pdf"),
        sent_by_user_id: userId,
        raw_payload: raw,
      });
    if (error) console.error("[admin/sms] audit insert failed", error.message);
  } catch (e) {
    console.error("[admin/sms] audit log error", (e as { message?: string })?.message);
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { type, paymentId, tenantId, chargeType, amount, month } = body as {
    type: string;
    paymentId?: string;
    tenantId?: string;
    chargeType?: string;
    amount?: number;
    month?: string; // "YYYY-MM"
  };

  const adminClient = createAdminClient();

  // ── RECEIPT SMS ───────────────────────────────────────────────────
  if (type === "receipt") {
    if (!paymentId) return NextResponse.json({ error: "paymentId required" }, { status: 400 });

    const { data: payment, error } = await adminClient
      .schema("landyke")
      .from("payments")
      .select("*, tenants(full_name, phone, unit_number, properties(name, location))")
      .eq("id", paymentId)
      .single();

    if (error || !payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const tenant = payment.tenants as {
      full_name: string;
      phone: string | null;
      unit_number: string | null;
      properties: { name: string; location: string | null } | null;
    } | null;

    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    if (!tenant.phone) return NextResponse.json({ error: "Tenant has no phone number on file" }, { status: 400 });

    const paidDate = payment.paid_date || new Date().toISOString().slice(0, 10);
    const propertyName = tenant.properties?.name || "your property";
    const receiptNumber = generateReceiptNumber(payment.id, paidDate);

    // Generate + upload the PDF, then attach it as {{7}}. Non-fatal: if the
    // upload fails we still send a text-only receipt.
    const receiptData: ReceiptData = {
      receiptNumber,
      tenantName: tenant.full_name,
      propertyName,
      propertyLocation: tenant.properties?.location ?? null,
      unitNumber: tenant.unit_number,
      amount: Number(payment.amount),
      paidDate,
      dueDate: payment.due_date ?? null,
      paymentMethod: payment.method ?? null,
      notes: payment.notes ?? null,
    };
    const uploaded = await uploadReceiptPdf(adminClient, receiptNumber, receiptData);

    const result = await sendTenantReceiptSMS(
      tenant.full_name,
      tenant.phone,
      Number(payment.amount),
      paidDate,
      propertyName,
      tenant.unit_number,
      receiptNumber,
      uploaded?.path ?? null
    );

    await logOutbound(
      adminClient,
      user.id,
      result,
      tenant.phone,
      `Receipt ${receiptNumber} · KES ${Number(payment.amount).toLocaleString("en-KE")}`,
      {
        kind: "receipt",
        initiated_by: user.email,
        content_sid: process.env.TWILIO_RECEIPT_TEMPLATE_SID ?? null,
        receipt_number: receiptNumber,
        media_url: uploaded?.publicUrl ?? null,
      },
      uploaded ? [uploaded.publicUrl] : []
    );

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({
      success: true,
      message: `WhatsApp sent to ${tenant.phone}`,
      messageSid: result.messageSid,
      status: result.status,
    });
  }

  // ── PAYMENT REMINDER ──────────────────────────────────────────────
  if (type === "reminder") {
    if (!tenantId) return NextResponse.json({ error: "tenantId required" }, { status: 400 });
    const amt = Number(amount);
    if (!amt || amt <= 0) return NextResponse.json({ error: "A valid amount is required" }, { status: 400 });
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "A valid month is required" }, { status: 400 });
    }
    const charge = (chargeType || "").trim() || "Rent";

    const { data: tenant, error } = await adminClient
      .schema("landyke")
      .from("tenants")
      .select("full_name, phone, unit_number, properties(name, location)")
      .eq("id", tenantId)
      .single();

    if (error || !tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const t = tenant as unknown as {
      full_name: string;
      phone: string | null;
      unit_number: string | null;
      properties:
        | { name: string; location: string | null }
        | { name: string; location: string | null }[]
        | null;
    };
    if (!t.phone) return NextResponse.json({ error: "Tenant has no phone number on file" }, { status: 400 });

    const property = Array.isArray(t.properties) ? t.properties[0] : t.properties;
    const [y, m] = month.split("-").map(Number);
    const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-KE", { month: "long", year: "numeric" });

    const result = await sendTenantReminderWhatsApp(
      t.full_name,
      t.phone,
      charge,
      amt,
      monthLabel,
      property?.name || "your property",
      t.unit_number
    );

    await logOutbound(
      adminClient,
      user.id,
      result,
      t.phone,
      `Reminder · ${charge} KES ${amt.toLocaleString("en-KE")} · ${monthLabel}`,
      {
        kind: "reminder",
        initiated_by: user.email,
        content_sid: process.env.TWILIO_REMINDER_TEMPLATE_SID ?? null,
        charge_type: charge,
        amount: amt,
        month: monthLabel,
      }
    );

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({
      success: true,
      message: `Reminder sent to ${t.phone}`,
      messageSid: result.messageSid,
      status: result.status,
    });
  }

  return NextResponse.json({ error: "Invalid type. Use 'receipt' or 'reminder'" }, { status: 400 });
}
