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
    .select("*")
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
    .eq("status", "active");
  return data || [];
}

export async function getPayments(supabase: SupabaseClient, landlordId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("payments")
    .select("*, tenants(full_name, property_id, properties(name))")
    .eq("landlord_id", landlordId)
    .order("paid_date", { ascending: false });
  return data || [];
}

// --- WiFi queries ---

export async function getWifiPlans(supabase: SupabaseClient) {
  const { data } = await supabase
    .schema("landyke")
    .from("wifi_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getPropertyWifiPlans(supabase: SupabaseClient, propertyId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("property_wifi_plans")
    .select("*, wifi_plans(*)")
    .eq("property_id", propertyId)
    .order("wifi_plans(sort_order)", { ascending: true });
  return data || [];
}

export async function getWifiSubscriptions(supabase: SupabaseClient, propertyId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("wifi_subscriptions")
    .select("*, property_wifi_plans(*, wifi_plans(*)), tenants(full_name, unit_number, property_id, properties(name))")
    .eq("tenants.property_id", propertyId)
    .order("created_at", { ascending: false });
  return data || [];
}

// --- Paginated queries ---

const PAGE_SIZE = 20;

export async function getTenantsPaginated(
  supabase: SupabaseClient,
  propertyIds: string[],
  page: number
) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("*, properties(name, location)", { count: "exact" })
    .in("property_id", propertyIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    tenants: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  };
}

export async function getPaymentsPaginated(
  supabase: SupabaseClient,
  landlordId: string,
  page: number
) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .schema("landyke")
    .from("payments")
    .select("*, tenants(full_name, property_id, properties(name))", { count: "exact" })
    .eq("landlord_id", landlordId)
    .order("paid_date", { ascending: false })
    .range(from, to);

  return {
    payments: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  };
}

// --- Aggregation helpers ---

/** Platform launch month — month selectors and charts start here */
export const LAUNCH_MONTH = "2026-03";

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
    // Don't include months before launch
    if (key >= LAUNCH_MONTH) {
      months.push(key);
    }
  }
  return months;
}

/**
 * Generate list of months from LAUNCH_MONTH to the current month (inclusive).
 * Returns newest first for use in dropdowns.
 */
export function getAvailableMonths() {
  const [launchY, launchM] = LAUNCH_MONTH.split("-").map(Number);
  const now = new Date();
  const nowY = now.getFullYear();
  const nowM = now.getMonth() + 1;
  const months: { value: string; label: string }[] = [];

  let y = launchY;
  let m = launchM;
  while (y < nowY || (y === nowY && m <= nowM)) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    const label = `${MONTH_FULL[m - 1]} ${y}`;
    months.push({ value: key, label });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return months.reverse();
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
 * Bucket a payment to its rent period. Prefers explicit `rent_period`;
 * falls back to the YYYY-MM of `paid_date` for legacy rows.
 */
export function periodOf(p: { rent_period?: string | null; paid_date: string | null }): string | null {
  if (p.rent_period) return p.rent_period;
  if (p.paid_date) return p.paid_date.slice(0, 7);
  return null;
}

/**
 * Group payments by rent period for the given months, computing collected vs expected.
 * Uses `rent_period` (the month rent applies to), falling back to `paid_date`.
 */
export function computeIncomeByMonth(
  payments: Array<{ amount: number; paid_date: string | null; rent_period?: string | null; status: string; payment_type?: string | null }>,
  monthlyExpected: number,
  months: string[]
) {
  return months.map((key) => {
    const monthPayments = payments.filter((p) => {
      if (p.status !== "paid") return false;
      if (p.payment_type && p.payment_type !== "rent") return false;
      return periodOf(p) === key;
    });
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
 * Payments are linked through tenants, not directly to properties.
 */
export function computePropertyBreakdown(
  properties: Array<{ id: string; name: string; location: string | null; total_units: number }>,
  tenants: Array<{ property_id: string; status: string }>,
  payments: Array<{ amount: number; paid_date: string | null; rent_period?: string | null; status: string; payment_type?: string | null; tenants?: { property_id: string } }>,
  monthKey: string
) {
  return properties.map((prop) => {
    const monthPayments = payments.filter((p) => {
      if (p.status !== "paid") return false;
      if (p.payment_type && p.payment_type !== "rent") return false;
      if (p.tenants?.property_id !== prop.id) return false;
      return periodOf(p) === monthKey;
    });
    const income = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
    const activeTenants = tenants.filter((t) => t.property_id === prop.id && t.status === "active").length;
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
 * Uses `rent_amount` and `status` from actual DB schema.
 */
const AVATAR_COLORS = ["#4a5c4e", "#8b3a2a", "#c8963e", "#2d6a4f", "#6b3d8a", "#3d6b8a", "#1a5296", "#8b6914"];

export function computeTenantStatus(
  tenants: Array<{ id: string; full_name: string; rent_amount: number; property_id: string; unit_number?: string | null; created_at?: string; properties?: { name: string; location: string | null } }>,
  payments: Array<{ tenant_id: string; amount: number; paid_date: string | null; rent_period?: string | null; status: string; payment_type?: string | null; notes?: string | null }>,
  monthKey: string
) {
  // Include tenants created during or before the selected month
  const eligibleTenants = tenants.filter((t) => !t.created_at || t.created_at.slice(0, 7) <= monthKey);

  // If viewing the current month and today is before the 5th, rent is not yet due
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const rentNotYetDue = monthKey === currentMonthKey && today.getDate() < 5;

  return eligibleTenants.map((t, i) => {
    const names = t.full_name.split(" ");
    const initials = names.length >= 2
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : t.full_name.substring(0, 2).toUpperCase();

    const tenantPayments = payments.filter((p) => {
      if (p.tenant_id !== t.id) return false;
      if (p.payment_type && p.payment_type !== "rent") return false;
      return periodOf(p) === monthKey;
    });
    const paidSum = tenantPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + Number(p.amount), 0);
    const pendingPayment = tenantPayments.find((p) => p.status === "pending");
    const vacatedPayment = tenantPayments.find((p) => p.status === "vacated_unpaid");
    const lastPaidDate = tenantPayments
      .filter((p) => p.status === "paid" && p.paid_date)
      .map((p) => p.paid_date as string)
      .sort()
      .pop();

    const paidEvents = tenantPayments.filter((p) => p.status === "paid");

    const rent = Number(t.rent_amount);
    let status: "paid" | "pending" | "overdue" | "vacated_unpaid" | "partial" = rentNotYetDue ? "pending" : "overdue";
    let date = rentNotYetDue ? "Due 5th" : "No payment";
    let notes = "";

    if (vacatedPayment) {
      status = "vacated_unpaid";
      date = "Vacated";
      notes = vacatedPayment.notes || "";
    } else if (paidSum >= rent && rent > 0) {
      status = "paid";
      if (lastPaidDate) {
        date = new Date(lastPaidDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
      }
      notes = paidEvents[0]?.notes || "";
    } else if (paidSum > 0) {
      status = "partial";
      const owed = rent - paidSum;
      date = `KES ${owed.toLocaleString("en-KE")} owed`;
      notes = paidEvents[0]?.notes || "";
    } else if (pendingPayment) {
      status = "pending";
      date = pendingPayment.paid_date
        ? `Due ${new Date(pendingPayment.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}`
        : "Pending";
      notes = pendingPayment.notes || "";
    }

    return {
      initials,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      name: t.full_name,
      property: t.properties?.name || "",
      unit: t.unit_number || "",
      amount: Number(t.rent_amount),
      paidThisMonth: paidSum,
      date,
      status,
      notes,
    };
  });
}

/**
 * Count tenants whose rent for the period is *fully* covered. A partial payer
 * is deliberately not counted — the "X of Y paid" figure must not be inflated
 * by someone who still owes a balance.
 */
export function countTenantsFullyPaid(
  tenants: Array<{ id: string; rent_amount: number }>,
  payments: Array<{ tenant_id: string; amount: number; paid_date: string | null; rent_period?: string | null; status: string; payment_type?: string | null }>,
  monthKey: string
) {
  return tenants.filter((t) => {
    const rent = Number(t.rent_amount);
    if (rent <= 0) return false;
    const paidSum = payments
      .filter((p) => {
        if (p.tenant_id !== t.id) return false;
        if (p.status !== "paid") return false;
        if (p.payment_type && p.payment_type !== "rent") return false;
        return periodOf(p) === monthKey;
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    return paidSum >= rent;
  }).length;
}

/**
 * Build recent transactions list from payments.
 * Uses `paid_date` and `notes` (for method) from actual DB schema.
 */
export function computeRecentTransactions(
  payments: Array<{ amount: number; paid_date: string | null; notes: string | null; status: string; tenants?: { full_name: string; properties?: { name: string } } }>,
  limit = 6
) {
  return payments.slice(0, limit).map((p) => {
    const method = p.notes || "Payment";
    const d = p.paid_date ? new Date(p.paid_date) : new Date();
    const dateStr = d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
    return {
      title: `${method} · ${p.tenants?.full_name || "Unknown"}`,
      detail: `${p.tenants?.properties?.name || ""} · ${dateStr}`,
      amount: `+${Number(p.amount).toLocaleString()}`,
    };
  });
}

/**
 * Compute arrears: active tenants whose paid total for the selected period
 * is less than their rent. Includes both partial (paid < rent) and zero-paid.
 */
export function computeArrears(
  tenants: Array<{ id: string; full_name: string; rent_amount: number; property_id: string; unit_number?: string | null; created_at?: string; properties?: { name: string } }>,
  payments: Array<{ tenant_id: string; amount: number; paid_date: string | null; rent_period?: string | null; status: string; payment_type?: string | null }>,
  monthKey: string
) {
  const start = getMonthStart(monthKey);
  const today = new Date();

  return tenants
    .filter((t) => !t.created_at || t.created_at.slice(0, 7) <= monthKey)
    .map((t) => {
      const rent = Number(t.rent_amount);
      const periodPayments = payments.filter((p) => {
        if (p.tenant_id !== t.id) return false;
        if (p.payment_type && p.payment_type !== "rent") return false;
        return periodOf(p) === monthKey;
      });
      const isVacated = periodPayments.some((p) => p.status === "vacated_unpaid");
      const paidSum = periodPayments
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + Number(p.amount), 0);
      const balance = rent - paidSum;
      return { t, rent, paidSum, balance, isVacated };
    })
    .filter(({ balance, isVacated, rent }) => !isVacated && rent > 0 && balance > 0)
    .map(({ t, rent, paidSum, balance }) => {
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
      return {
        tenant: t.full_name,
        property: t.properties?.name || "",
        unit: t.unit_number || "",
        amount: balance,
        rentTotal: rent,
        paid: paidSum,
        days: daysOverdue,
      };
    });
}

/**
 * Compute collection rates for each month.
 */
export function computeCollectionRates(
  payments: Array<{ amount: number; paid_date: string | null; rent_period?: string | null; status: string; payment_type?: string | null }>,
  monthlyExpected: number,
  months: string[]
) {
  return months.map((key) => {
    const collected = payments
      .filter((p) => {
        if (p.status !== "paid") return false;
        if (p.payment_type && p.payment_type !== "rent") return false;
        return periodOf(p) === key;
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    const rate = monthlyExpected > 0 ? Math.round((collected / monthlyExpected) * 100) : 0;
    return { month: formatMonthKey(key).split(" ")[0], rate };
  });
}

/**
 * Compute occupancy data per property.
 */
export function computeOccupancyData(
  properties: Array<{ id: string; name: string; total_units: number }>,
  tenants: Array<{ property_id: string; status: string }>
) {
  return properties.map((prop) => {
    const occupied = tenants.filter((t) => t.property_id === prop.id && t.status === "active").length;
    const rate = prop.total_units > 0 ? Math.round((occupied / prop.total_units) * 100) : 0;
    return {
      name: prop.name,
      total: prop.total_units,
      occupied,
      rate,
    };
  });
}
