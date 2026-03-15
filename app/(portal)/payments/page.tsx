import { createClient } from "@/lib/supabase/server";
import { getLandlord, getPayments } from "@/lib/queries";
import PaymentsView from "@/components/payments/PaymentsView";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let payments: Array<{
    id: string;
    tenant_id: string;
    property_id: string;
    amount: number;
    payment_date: string;
    method: string;
    status: "paid" | "pending" | "overdue";
    tenants: { full_name: string; unit_number: string | null };
    properties: { name: string };
  }> = [];

  let expectedRent = 0;
  let properties: Array<{ id: string; name: string }> = [];

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      const { data: dbProperties } = await supabase
        .schema("landyke")
        .from("properties")
        .select("id, name")
        .eq("landlord_id", landlord.id);

      properties = dbProperties || [];

      if (properties.length > 0) {
        const propertyIds = properties.map((p) => p.id);
        payments = await getPayments(supabase, propertyIds);

        // Get expected monthly rent from active tenants
        const { data: activeTenants } = await supabase
          .schema("landyke")
          .from("tenants")
          .select("monthly_rent")
          .in("property_id", propertyIds)
          .eq("is_active", true);

        expectedRent =
          activeTenants?.reduce(
            (sum, t) => sum + Number(t.monthly_rent),
            0
          ) || 0;
      }
    }
  }

  return (
    <PaymentsView
      payments={payments}
      expectedRent={expectedRent}
      properties={properties}
    />
  );
}
