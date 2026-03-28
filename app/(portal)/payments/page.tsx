import { createClient } from "@/lib/supabase/server";
import { getLandlord, getProperties, getActiveTenants, getPayments } from "@/lib/queries";
import PaymentsView from "@/components/payments/PaymentsView";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let payments: Array<{
    id: string;
    tenant_id: string;
    landlord_id: string;
    amount: number;
    paid_date: string | null;
    due_date: string | null;
    notes: string | null;
    status: string;
    tenants: { full_name: string; property_id: string; properties: { name: string } };
  }> = [];

  let expectedRent = 0;
  let properties: Array<{ id: string; name: string }> = [];

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      const dbProperties = await getProperties(supabase, landlord.id);
      properties = dbProperties.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }));

      if (properties.length > 0) {
        const propertyIds = properties.map((p) => p.id);
        payments = await getPayments(supabase, landlord.id);

        const activeTenants = await getActiveTenants(supabase, propertyIds);
        expectedRent = activeTenants.reduce(
          (sum: number, t: { rent_amount: number }) => sum + Number(t.rent_amount),
          0
        );
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
