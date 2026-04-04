import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReceiptNumber } from "@/lib/pdf/generate-receipt";
import { sendTenantReceiptSMS, sendDailySummary } from "@/lib/sms/send-sms";

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
  const { type, paymentId, landlordId, channel = "whatsapp" } = body as {
    type: string;
    paymentId?: string;
    landlordId?: string;
    channel?: "whatsapp" | "sms";
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
      tenant.properties?.name || "your property",
      tenant.unit_number,
      receiptNumber,
      channel
    );

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    const label = channel === "whatsapp" ? "WhatsApp" : "SMS";
    return NextResponse.json({ success: true, message: `${label} sent to ${tenant.phone}` });
  }

  // ── DAILY SUMMARY ─────────────────────────────────────────────────
  if (type === "daily-summary") {
    if (!landlordId) return NextResponse.json({ error: "landlordId required" }, { status: 400 });

    const { data: landlord } = await adminClient
      .schema("landyke")
      .from("landlords")
      .select("full_name, phone")
      .eq("id", landlordId)
      .single();

    if (!landlord?.phone) {
      return NextResponse.json({ error: "Landlord has no phone number on file" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: payments } = await adminClient
      .schema("landyke")
      .from("payments")
      .select("amount, tenants(full_name, unit_number, properties(name))")
      .eq("landlord_id", landlordId)
      .eq("status", "paid")
      .eq("paid_date", today);

    if (!payments || payments.length === 0) {
      return NextResponse.json({ error: "No payments recorded today — nothing to send" }, { status: 400 });
    }

    const summaryPayments = payments.map((p) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tenant = p.tenants as any;
      const property = Array.isArray(tenant?.properties) ? tenant.properties[0] : tenant?.properties;
      return {
        tenantName: (tenant?.full_name as string) || "Unknown",
        amount: Number(p.amount),
        propertyName: (property?.name as string) || "",
        unitNumber: (tenant?.unit_number as string | null) || null,
      };
    });

    const result = await sendDailySummary(landlord.phone, landlord.full_name, summaryPayments, channel);

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true, count: payments.length });
  }

  return NextResponse.json({ error: "Invalid type. Use 'receipt' or 'daily-summary'" }, { status: 400 });
}
