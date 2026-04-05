export const revalidate = 60;

import { createClient } from "@/lib/supabase/server";
import { getLandlord, getProperties } from "@/lib/queries";
import { Home } from "lucide-react";
import PropertyCard from "@/components/ui/PropertyCard";
import EmptyState from "@/components/ui/EmptyState";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let properties: Array<{
    id: string;
    name: string;
    location: string | null;
    total_units: number;
    tenants: Array<{ id: string; is_active: boolean; monthly_rent: number }>;
  }> = [];

  if (user) {
    const landlord = await getLandlord(supabase, user.id);
    if (landlord) {
      properties = await getProperties(supabase, landlord.id);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-light text-ink">
          My Properties
        </h1>
        <p className="mt-0.5 text-[0.8rem] text-muted">
          {properties.length} propert{properties.length === 1 ? "y" : "ies"} in
          your portfolio
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Home}
            title="No properties found"
            description="Contact your LandyKe admin to add properties."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 properties-grid">
          {properties.map((property) => {
            const activeTenants = property.tenants?.filter(
              (t) => t.is_active
            ) || [];
            const monthlyIncome = activeTenants.reduce(
              (sum, t) => sum + Number(t.monthly_rent),
              0
            );

            return (
              <PropertyCard
                key={property.id}
                name={property.name}
                location={property.location}
                occupiedUnits={activeTenants.length}
                totalUnits={property.total_units}
                monthlyIncome={monthlyIncome}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
