import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLandlord(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("id, full_name, email")
    .eq("user_id", userId)
    .single();
  return data as { id: string; full_name: string; email: string } | null;
}

export async function getProperties(supabase: SupabaseClient, landlordId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("properties")
    .select("*, tenants(id, is_active, monthly_rent)")
    .eq("landlord_id", landlordId);
  return data || [];
}

export async function getTenants(supabase: SupabaseClient, propertyIds: string[]) {
  const { data } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("*, properties(name, location)")
    .in("property_id", propertyIds);
  return data || [];
}

export async function getActiveTenants(supabase: SupabaseClient, propertyIds: string[]) {
  const { data } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("*, properties(name, location)")
    .in("property_id", propertyIds)
    .eq("is_active", true);
  return data || [];
}

export async function getPayments(supabase: SupabaseClient, propertyIds: string[]) {
  const { data } = await supabase
    .schema("landyke")
    .from("payments")
    .select("*, tenants(full_name, unit_number, monthly_rent, property_id), properties(name)")
    .in("property_id", propertyIds)
    .order("payment_date", { ascending: false });
  return data || [];
}

// --- Aggregation helpers ---

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatMonthKey(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_FULL[Number(month) - 1]} ${year}`;
}

export function getMonthRange(selectedMonth: string, count: number) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(key);
  }
  return months;
}

export function getMonthStart(key: string) {
  return `${key}-01`;
}

export function getMonthEnd(key: string) {
  const [year, month] = key.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${key}-${String(lastDay).padStart(2, "0")}`;
}

export function getShortMonth(key: string) {
  const month = Number(key.split("-")[1]);
  return MONTH_NAMES[month - 1];
}

/**
 * Group payments by month for last N months, computing collected vs expected.
 */
export function computeIncomeByMonth(
  payments: Array<{ amount: number; payment_date: string; status: string }>,
  monthlyExpected: number,
  months: string[]
) {
  return months.map((key) => {
    const start = getMonthStart(key);
    const end = getMonthEnd(key);
    const monthPayments = payments.filter(
      (p) => p.payment_date >= start && p.payment_date <= end && p.status === "paid"
    );
    const collected = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
    return {
      month: getShortMonth(key),
      collected,
      expected: monthlyExpected,
    };
  });
}

/**
 * Compute per-property breakdown: income this month and occupancy.
 */
export function computePropertyBreakdown(
  properties: Array<{ id: string; name: string; location: string | null; total_units: number; tenants?: Array<{ is_active: boolean }> }>,
  payments: Array<{ property_id: string; amount: number; payment_date: string; status: string }>,
  monthKey: string
) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);
  return properties.map((prop) => {
    const monthPayments = payments.filter(
      (p) => p.property_id === prop.id && p.payment_date >= start && p.payment_date <= end && p.status === "paid"
    );
    const income = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
    const activeTenants = prop.tenants?.filter((t) => t.is_active).length || 0;
    const occupancy = prop.total_units > 0 ? Math.round((activeTenants / prop.total_units) * 100) : 0;
    return {
      name: prop.name,
      location: prop.location || "",
      units: prop.total_units,
      income,
      occupancy: `${occupancy}% occupied`,
    };
  });
}

/**
 * Build tenant status list for the selected month.
 */
const AVATAR_COLORS = ["#4a5c4e", "#8b3a2a", "#c8963e", "#2d6a4f", "#6b3d8a", "#3d6b8a", "#1a5296", "#8b6914"];

export function computeTenantStatus(
  tenants: Array<{ id: string; full_name: string; monthly_rent: number; property_id: string; properties?: { name: string; location: string | null } }>,
  payments: Array<{ tenant_id: string; amount: number; payment_date: string; status: string }>,
  monthKey: string
) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);

  return tenants.map((t, i) => {
    const names = t.full_name.split(" ");
    const initials = names.length >= 2
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : t.full_name.substring(0, 2).toUpperCase();

    const tenantPayments = payments.filter(
      (p) => p.tenant_id === t.id && p.payment_date >= start && p.payment_date <= end
    );
    const paidPayment = tenantPayments.find((p) => p.status === "paid");
    const pendingPayment = tenantPayments.find((p) => p.status === "pending");

    let status: "paid" | "pending" | "overdue" = "overdue";
    let date = "No payment";
    if (paidPayment) {
      status = "paid";
      date = new Date(paidPayment.payment_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
    } else if (pendingPayment) {
      status = "pending";
      date = `Due ${new Date(pendingPayment.payment_date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}`;
    }

    return {
      initials,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      name: t.full_name,
      property: `${t.properties?.name || ""} · Unit ${t.id.slice(-2)}`,
      amount: Number(t.monthly_rent),
      date,
      status,
    };
  });
}

/**
 * Build recent transactions list from payments.
 */
export function computeRecentTransactions(
  payments: Array<{ amount: number; payment_date: string; method: string; status: string; tenants?: { full_name: string; unit_number: string | null }; properties?: { name: string } }>,
  limit = 6
) {
  return payments.slice(0, limit).map((p) => {
    const method = (p.method || "").toLowerCase().includes("mpesa") || (p.method || "").toLowerCase().includes("m-pesa")
      ? "M-Pesa"
      : (p.method || "").toLowerCase().includes("bank")
        ? "Bank Transfer"
        : p.method || "Payment";
    const d = new Date(p.payment_date);
    const dateStr = d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
    return {
      title: `${method} · ${p.tenants?.full_name || "Unknown"}`,
      detail: `${p.properties?.name || ""} · ${dateStr}`,
      amount: `+${Number(p.amount).toLocaleString()}`,
    };
  });
}

/**
 * Compute arrears: active tenants who have no paid payment for the selected month.
 */
export function computeArrears(
  tenants: Array<{ id: string; full_name: string; monthly_rent: number; unit_number: string | null; property_id: string; properties?: { name: string } }>,
  payments: Array<{ tenant_id: string; payment_date: string; status: string }>,
  monthKey: string
) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);
  const today = new Date();
  const monthEnd = new Date(end);

  return tenants
    .filter((t) => {
      const hasPaid = payments.some(
        (p) => p.tenant_id === t.id && p.payment_date >= start && p.payment_date <= end && p.status === "paid"
      );
      return !hasPaid;
    })
    .map((t) => {
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
      return {
        tenant: t.full_name,
        property: t.properties?.name || "",
        unit: t.unit_number || "",
        amount: Number(t.monthly_rent),
        days: Math.min(daysOverdue, Math.floor((today.getTime() - monthEnd.getTime()) / (1000 * 60 * 60 * 24)) > 0 ? daysOverdue : daysOverdue),
      };
    });
}

/**
 * Compute collection rates for each month.
 */
export function computeCollectionRates(
  payments: Array<{ amount: number; payment_date: string; status: string }>,
  monthlyExpected: number,
  months: string[]
) {
  return months.map((key) => {
    const start = getMonthStart(key);
    const end = getMonthEnd(key);
    const collected = payments
      .filter((p) => p.payment_date >= start && p.payment_date <= end && p.status === "paid")
      .reduce((s, p) => s + Number(p.amount), 0);
    const rate = monthlyExpected > 0 ? Math.round((collected / monthlyExpected) * 100) : 0;
    return { month: formatMonthKey(key).split(" ")[0], rate };
  });
}

/**
 * Compute occupancy data per property.
 */
export function computeOccupancyData(
  properties: Array<{ id: string; name: string; total_units: number; tenants?: Array<{ is_active: boolean }> }>
) {
  return properties.map((prop) => {
    const occupied = prop.tenants?.filter((t) => t.is_active).length || 0;
    const rate = prop.total_units > 0 ? Math.round((occupied / prop.total_units) * 100) : 0;
    return {
      name: prop.name,
      total: prop.total_units,
      occupied,
      rate,
    };
  });
}
