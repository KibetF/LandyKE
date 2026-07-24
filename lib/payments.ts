import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve the rent period a payment applies to. Prefers an explicit
 * `rent_period`; falls back to the YYYY-MM of `paid_date` (mirrors periodOf
 * in lib/queries.ts, which reads back the same convention).
 */
export function resolveRentPeriod(rentPeriod: string | null | undefined, paidDate: string | null | undefined): string | null {
  if (rentPeriod) return rentPeriod;
  if (paidDate) return String(paidDate).slice(0, 7);
  return null;
}

/**
 * Reject recording a rent payment once the tenant's rent for that period is
 * already fully covered by prior `paid` rows. Partial installments remain
 * allowed up until the period is fully paid. Returns an error message string
 * when the payment should be blocked, or null when it's fine to proceed.
 */
export async function assertRentPeriodNotFullyPaid(
  adminClient: SupabaseClient,
  {
    tenantId,
    rentPeriod,
    paymentType,
    excludePaymentId,
  }: {
    tenantId: string;
    rentPeriod: string | null;
    paymentType: string | null | undefined;
    excludePaymentId?: string;
  }
): Promise<string | null> {
  if ((paymentType || "rent") !== "rent" || !rentPeriod) return null;

  const { data: tenant } = await adminClient
    .schema("landyke")
    .from("tenants")
    .select("full_name, rent_amount")
    .eq("id", tenantId)
    .single();

  const rentAmount = Number(tenant?.rent_amount);
  if (!rentAmount || rentAmount <= 0) return null;

  let query = adminClient
    .schema("landyke")
    .from("payments")
    .select("amount, payment_type")
    .eq("tenant_id", tenantId)
    .eq("rent_period", rentPeriod)
    .eq("status", "paid");
  if (excludePaymentId) query = query.neq("id", excludePaymentId);

  const { data: existing } = await query;
  const alreadyPaid = (existing || [])
    .filter((p) => (p.payment_type || "rent") === "rent")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (alreadyPaid >= rentAmount) {
    return `Rent for ${rentPeriod} is already fully paid for ${tenant?.full_name || "this tenant"} (KES ${alreadyPaid.toLocaleString("en-KE")} of KES ${rentAmount.toLocaleString("en-KE")} recorded).`;
  }
  return null;
}
