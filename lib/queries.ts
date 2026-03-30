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
 * Group payments by month for last N months, computing collected vs expected.
 * Uses `paid_date` from the actual DB schema.
 */
export function computeIncomeByMonth(
  payments: Array<{ amount: number; paid_date: string | null; status: string }>,
  monthlyExpected: number,
  months: string[]
) {
  return months.map((key) => {
    const start = getMonthStart(key);
    const end = getMonthEnd(key);
    const monthPayments = payments.filter(
      (p) => p.paid_date && p.paid_date >= start && p.paid_date <= end && p.status === "paid"
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
 * Payments are linked through tenants, not directly to properties.
 */
export function computePropertyBreakdown(
  properties: Array<{ id: string; name: string; location: string | null; total_units: number }>,
  tenants: Array<{ property_id: string; status: string }>,
  payments: Array<{ amount: number; paid_date: string | null; status: string; tenants?: { property_id: string } }>,
  monthKey: string
) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);
  return properties.map((prop) => {
    // Income: payments from tenants belonging to this property
    const monthPayments = payments.filter(
      (p) => p.paid_date && p.paid_date >= start && p.paid_date <= end && p.status === "paid" &&
        p.tenants?.property_id === prop.id
    );
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
  payments: Array<{ tenant_id: string; amount: number; paid_date: string | null; status: string }>,
  monthKey: string
) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);

  // Include tenants created during or before the selected month
  const eligibleTenants = tenants.filter((t) => !t.created_at || t.created_at <= end);

  return eligibleTenants.map((t, i) => {
    const names = t.full_name.split(" ");
    const initials = names.length >= 2
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : t.full_name.substring(0, 2).toUpperCase();

    const tenantPayments = payments.filter(
      (p) => p.tenant_id === t.id && p.paid_date && p.paid_date >= start && p.paid_date <= end
    );
    const paidPayment = tenantPayments.find((p) => p.status === "paid");
    const pendingPayment = tenantPayments.find((p) => p.status === "pending");

    let status: "paid" | "pending" | "overdue" = "overdue";
    let date = "No payment";
    if (paidPayment && paidPayment.paid_date) {
      status = "paid";
      date = new Date(paidPayment.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
    } else if (pendingPayment) {
      status = "pending";
      date = pendingPayment.paid_date
        ? `Due ${new Date(pendingPayment.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}`
        : "Pending";
    }

    return {
      initials,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      name: t.full_name,
      property: t.properties?.name || "",
      unit: t.unit_number || "",
      amount: Number(t.rent_amount),
      date,
      status,
    };
  });
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
 * Compute arrears: active tenants who have no paid payment for the selected month.
 */
export function computeArrears(
  tenants: Array<{ id: string; full_name: string; rent_amount: number; property_id: string; created_at?: string; properties?: { name: string } }>,
  payments: Array<{ tenant_id: string; paid_date: string | null; status: string }>,
  monthKey: string
) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);
  const today = new Date();

  return tenants
    .filter((t) => {
      // Skip tenants created after the selected month
      if (t.created_at && t.created_at > end) return false;
      const hasPaid = payments.some(
        (p) => p.tenant_id === t.id && p.paid_date && p.paid_date >= start && p.paid_date <= end && p.status === "paid"
      );
      return !hasPaid;
    })
    .map((t) => {
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
      return {
        tenant: t.full_name,
        property: t.properties?.name || "",
        unit: "",
        amount: Number(t.rent_amount),
        days: daysOverdue,
      };
    });
}

/**
 * Compute collection rates for each month.
 */
export function computeCollectionRates(
  payments: Array<{ amount: number; paid_date: string | null; status: string }>,
  monthlyExpected: number,
  months: string[]
) {
  return months.map((key) => {
    const start = getMonthStart(key);
    const end = getMonthEnd(key);
    const collected = payments
      .filter((p) => p.paid_date && p.paid_date >= start && p.paid_date <= end && p.status === "paid")
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
