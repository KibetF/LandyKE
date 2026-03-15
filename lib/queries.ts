import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLandlord(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("id, full_name")
    .eq("user_id", userId)
    .single();
  return data as { id: string; full_name: string } | null;
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

export async function getPayments(supabase: SupabaseClient, propertyIds: string[]) {
  const { data } = await supabase
    .schema("landyke")
    .from("payments")
    .select("*, tenants(full_name, unit_number), properties(name)")
    .in("property_id", propertyIds)
    .order("payment_date", { ascending: false });
  return data || [];
}
