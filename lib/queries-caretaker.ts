import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCaretakerAssignments(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("caretaker_assignments")
    .select("*, properties(id, name, location, total_units, landlord_id)")
    .eq("caretaker_id", userId);
  return data || [];
}

export async function getCaretakerTenants(supabase: SupabaseClient, propertyIds: string[]) {
  const { data } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("id, full_name, unit_number, unit_type, rent_amount, property_id, status, properties(name)")
    .in("property_id", propertyIds)
    .eq("status", "active")
    .order("unit_number", { ascending: true });
  return data || [];
}

export async function getCaretakerPayments(
  supabase: SupabaseClient,
  tenantIds: string[],
  monthStart: string,
  monthEnd: string
) {
  if (tenantIds.length === 0) return [];
  const { data } = await supabase
    .schema("landyke")
    .from("payments")
    .select("id, tenant_id, amount, paid_date, status, marked_by, notes")
    .in("tenant_id", tenantIds)
    .gte("paid_date", monthStart)
    .lte("paid_date", monthEnd)
    .eq("status", "paid");
  return data || [];
}

export interface UnitStatus {
  tenantId: string;
  tenantName: string;
  unitNumber: string | null;
  propertyName: string;
  expectedRent: number;
  isPaid: boolean;
  paymentId: string | null;
}

interface CaretakerTenantRow {
  id: string;
  full_name: string;
  unit_number: string | null;
  rent_amount: number | string | null;
  // Supabase may return the joined properties as object or array
  properties?: { name: string } | { name: string }[] | null;
}

export function computeUnitStatus(
  tenants: CaretakerTenantRow[],
  payments: { id: string; tenant_id: string; status: string }[]
): UnitStatus[] {
  const paidTenantIds = new Set(payments.map((p) => p.tenant_id));
  const paymentByTenant = new Map(payments.map((p) => [p.tenant_id, p.id]));

  return tenants.map((t) => {
    // Supabase may return properties as object or array depending on join type
    const props = Array.isArray(t.properties) ? t.properties[0] : t.properties;
    return {
      tenantId: t.id,
      tenantName: t.full_name,
      unitNumber: t.unit_number,
      propertyName: props?.name || "Property",
      expectedRent: Number(t.rent_amount) || 0,
      isPaid: paidTenantIds.has(t.id),
      paymentId: paymentByTenant.get(t.id) || null,
    };
  });
}
