import { createClient } from "@/lib/supabase/server";
import { getLandlord, getProperties } from "@/lib/queries";

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
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="font-serif"
          style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}
        >
          My Properties
        </h1>
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--muted)",
            marginTop: "0.2rem",
          }}
        >
          {properties.length} propert{properties.length === 1 ? "y" : "ies"} in
          your portfolio
        </p>
      </div>

      {properties.length === 0 ? (
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            No properties found. Contact your LandyKe admin to add properties.
          </p>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => {
            const activeTenants = property.tenants?.filter(
              (t) => t.is_active
            ) || [];
            const occupied = activeTenants.length;
            const total = property.total_units;
            const occupancyPct =
              total > 0 ? Math.round((occupied / total) * 100) : 0;
            const monthlyIncome = activeTenants.reduce(
              (sum, t) => sum + Number(t.monthly_rent),
              0
            );
            const vacant = total - occupied;

            return (
              <div
                key={property.id}
                className="card-hover"
                style={{
                  background: "var(--white)",
                  borderRadius: "8px",
                  border: "1px solid rgba(200,150,62,0.08)",
                  padding: "1.5rem",
                }}
              >
                {/* Name + location */}
                <h3
                  className="font-serif"
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    marginBottom: "0.2rem",
                  }}
                >
                  {property.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                    marginBottom: "1.2rem",
                  }}
                >
                  {property.location || "—"}
                </p>

                {/* Stats row */}
                <div
                  className="flex justify-between"
                  style={{ marginBottom: "1rem" }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Units
                    </span>
                    <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                      {occupied} / {total}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Monthly Income
                    </span>
                    <div
                      className="font-serif"
                      style={{ fontSize: "1rem", fontWeight: 600 }}
                    >
                      KES {monthlyIncome.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div
                  style={{
                    background: "var(--warm)",
                    borderRadius: "4px",
                    height: "6px",
                    marginBottom: "0.8rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "var(--gold)",
                      width: `${occupancyPct}%`,
                      height: "100%",
                      borderRadius: "4px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {/* Status badge */}
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {occupancyPct}% occupied
                  </span>
                  {vacant === 0 ? (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        background: "var(--green-light)",
                        color: "var(--green)",
                        fontWeight: 500,
                      }}
                    >
                      Fully Occupied
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        background: "var(--amber-light)",
                        color: "#7a5c00",
                        fontWeight: 500,
                      }}
                    >
                      {vacant} Vacant
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
