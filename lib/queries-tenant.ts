import type { SupabaseClient } from "@supabase/supabase-js";

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

/**
 * Compute the tenant's current month balance/status.
 */
export function computeTenantBalance(
  payments: Array<{ amount: number; paid_date: string | null; status: string }>,
  rentAmount: number
) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = `${monthKey}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEnd = `${monthKey}-${String(lastDay).padStart(2, "0")}`;

  const monthPayments = payments.filter(
    (p) => p.paid_date && p.paid_date >= monthStart && p.paid_date <= monthEnd
  );

  const paidPayment = monthPayments.find((p) => p.status === "paid");
  const pendingPayment = monthPayments.find((p) => p.status === "pending");

  let currentMonthStatus: "paid" | "pending" | "overdue" = "overdue";
  if (paidPayment) {
    currentMonthStatus = "paid";
  } else if (pendingPayment) {
    currentMonthStatus = "pending";
  }

  const paidThisMonth = monthPayments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);
  const balance = rentAmount - paidThisMonth;

  const lastPaid = payments.find((p) => p.status === "paid");

  return {
    currentMonthStatus,
    balance: Math.max(0, balance),
    lastPaymentDate: lastPaid?.paid_date || null,
    lastPaymentAmount: lastPaid ? Number(lastPaid.amount) : null,
  };
}
