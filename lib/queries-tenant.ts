import type { SupabaseClient } from "@supabase/supabase-js";
import type { PeriodLedgerRow, PeriodStatus, TenantPaymentSummary } from "@/types";
import { formatMonthKey, periodOf } from "@/lib/queries";

export async function getTenantByUserId(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("*, properties(name, location)")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function getTenantPayments(supabase: SupabaseClient, tenantId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("payments")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("paid_date", { ascending: false });
  return data || [];
}

export async function getTenantMaintenanceRequests(supabase: SupabaseClient, tenantId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("maintenance_requests")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("date_submitted", { ascending: false });
  return data || [];
}

export async function getTenantDocuments(supabase: SupabaseClient, tenantId: string, propertyId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("documents")
    .select("*")
    .or(`tenant_id.eq.${tenantId},and(tenant_id.is.null,property_id.eq.${propertyId})`)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getTenantWifiSubscription(supabase: SupabaseClient, tenantId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("wifi_subscriptions")
    .select("*, property_wifi_plans(*, wifi_plans(*))")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .single();
  return data;
}

export async function getPropertyWifiPlansForTenant(supabase: SupabaseClient, propertyId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("property_wifi_plans")
    .select("*, wifi_plans(*)")
    .eq("property_id", propertyId)
    .eq("is_available", true)
    .order("wifi_plans(sort_order)", { ascending: true });
  return data || [];
}

type RawPayment = {
  amount: number;
  paid_date: string | null;
  rent_period?: string | null;
  status: string;
  payment_type?: string | null;
};

/**
 * Build the tenant's month-by-month rent ledger from move-in through the
 * current month (plus any future periods that already have advance payments).
 *
 * Returns per-period paid/expected/balance/status plus rolled-up totals:
 * - totalOutstanding: sum of positive balances (owed) across all periods
 * - carriedCredit: sum of negative balances (surplus) across all periods
 * - netPosition: carriedCredit - totalOutstanding (>0 = in credit, <0 = owes)
 */
export function computeTenantBalance(
  payments: RawPayment[],
  rentAmount: number
): TenantPaymentSummary {
  const rentPayments = payments.filter((p) => !p.payment_type || p.payment_type === "rent");

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Collect all distinct periods we have payments for.
  const periodSet = new Set<string>();
  for (const p of rentPayments) {
    const k = periodOf(p);
    if (k) periodSet.add(k);
  }
  periodSet.add(currentMonth);

  // Earliest period seen — walk from there through currentMonth so we don't
  // miss months with zero payments (which are the arrears we most want to flag).
  let earliest = currentMonth;
  for (const k of periodSet) {
    if (k < earliest) earliest = k;
  }

  const periods: string[] = [];
  // Walk from earliest -> currentMonth inclusive
  let [y, m] = earliest.split("-").map(Number);
  const [cy, cm] = currentMonth.split("-").map(Number);
  while (y < cy || (y === cy && m <= cm)) {
    periods.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  // Include any future periods that have payments (advances)
  for (const k of periodSet) {
    if (k > currentMonth) periods.push(k);
  }
  periods.sort();

  const perMonth: PeriodLedgerRow[] = periods.map((period) => {
    const periodPayments = rentPayments.filter((p) => periodOf(p) === period);
    const paid = periodPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + Number(p.amount), 0);
    const hasPending = periodPayments.some((p) => p.status === "pending");
    const balance = rentAmount - paid;
    let status: PeriodStatus;
    if (paid > rentAmount) status = "credit";
    else if (paid >= rentAmount && rentAmount > 0) status = "paid";
    else if (paid > 0) status = "partial";
    else if (hasPending) status = "pending";
    else status = "outstanding";

    return {
      period,
      periodLabel: formatMonthKey(period),
      expected: rentAmount,
      paid,
      balance,
      status,
    };
  });

  const totalOutstanding = perMonth.reduce(
    (s, r) => s + (r.balance > 0 && r.status !== "pending" ? r.balance : 0),
    0
  );
  const carriedCredit = perMonth.reduce(
    (s, r) => s + (r.balance < 0 ? -r.balance : 0),
    0
  );
  const netPosition = carriedCredit - totalOutstanding;

  const currentRow = perMonth.find((r) => r.period === currentMonth);
  let currentMonthStatus: TenantPaymentSummary["currentMonthStatus"] = "overdue";
  if (currentRow) {
    if (currentRow.status === "paid" || currentRow.status === "credit") currentMonthStatus = "paid";
    else if (currentRow.status === "partial") currentMonthStatus = "partial";
    else if (currentRow.status === "pending") currentMonthStatus = "pending";
    else currentMonthStatus = "overdue";
  }
  // Pre-5th of month rent isn't yet "overdue"
  if (currentMonthStatus === "overdue" && now.getDate() < 5) {
    currentMonthStatus = "pending";
  }

  const paidEvents = rentPayments
    .filter((p) => p.status === "paid" && p.paid_date)
    .sort((a, b) => (a.paid_date! < b.paid_date! ? 1 : -1));
  const lastPaid = paidEvents[0] || null;

  return {
    currentMonthStatus,
    balance: currentRow ? Math.max(0, currentRow.balance) : rentAmount,
    carriedCredit,
    totalOutstanding,
    netPosition,
    lastPaymentDate: lastPaid?.paid_date || null,
    lastPaymentAmount: lastPaid ? Number(lastPaid.amount) : null,
    perMonth,
  };
}
