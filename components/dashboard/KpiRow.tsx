interface KpiData {
  totalCollected: number;
  totalExpected: number;
  tenantsPaid: number;
  totalTenants: number;
  outstanding: number;
  outstandingCount: number;
  propertyCount: number;
  totalUnits: number;
  occupancyRate: number;
  monthLabel?: string;
}

export default function KpiRow({ data }: { data: KpiData }) {
  const monthLabel = data.monthLabel || "This Month";
  const shortMonth = monthLabel.split(" ")[0];

  const kpis = [
    {
      label: `Total Collected — ${shortMonth}`,
      value: data.totalCollected.toLocaleString(),
      sub: `KES · of ${data.totalExpected.toLocaleString()} expected`,
      icon: "💰",
      color: "kpi-gold",
    },
    {
      label: "Tenants Paid",
      value: `${data.tenantsPaid} / ${data.totalTenants}`,
      sub: `${Math.max(0, data.totalTenants - data.tenantsPaid)} outstanding`,
      icon: "✅",
      color: "kpi-green",
    },
    {
      label: "Outstanding Rent",
      value: data.outstanding.toLocaleString(),
      sub: `KES · ${data.outstandingCount} tenants`,
      icon: "⚠️",
      color: "kpi-rust",
    },
    {
      label: "Properties",
      value: data.propertyCount.toString(),
      sub: `${data.totalUnits} units · ${data.occupancyRate}% occupied`,
      icon: "🏠",
      color: "kpi-sage",
    },
  ];

  return (
    <div
      className="kpi-grid"
      style={{
        marginBottom: "2rem",
      }}
    >
      {kpis.map((k) => (
        <div
          key={k.label}
          className={`kpi ${k.color} relative overflow-hidden card-hover`}
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            padding: "1.5rem",
            border: "1px solid rgba(200,150,62,0.08)",
          }}
        >
          <span
            style={{
              position: "absolute",
              right: "1.2rem",
              top: "1.2rem",
              fontSize: "1.3rem",
              opacity: 0.2,
            }}
          >
            {k.icon}
          </span>
          <label
            className="block uppercase"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              color: "var(--muted)",
              marginBottom: "0.6rem",
            }}
          >
            {k.label}
          </label>
          <div
            className="font-serif"
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: "0.4rem",
            }}
          >
            {k.value}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
            {k.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
