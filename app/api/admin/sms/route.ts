import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReceiptNumber } from "@/lib/pdf/generate-receipt";
import { sendTenantReceiptSMS, sendTenantReminderWhatsApp } from "@/lib/sms/send-sms";

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

    const receiptNumber = generateReceiptNumber(
      payment.id,
      payment.paid_date || new Date().toISOString().slice(0, 10)
    );

    const result = await sendTenantReceiptSMS(
      tenant.full_name,
      tenant.phone,
      Number(payment.amount),
      payment.paid_date || new Date().toISOString().slice(0, 10),
      tenant.properties?.name || "your property",
      tenant.unit_number,
      receiptNumber
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
