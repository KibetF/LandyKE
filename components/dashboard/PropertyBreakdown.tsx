interface PropertyData {
  name: string;
  location: string;
  units: number;
  income: number;
  occupancy: string;
}

export default function PropertyBreakdown({
  properties,
}: {
  properties: PropertyData[];
}) {
  return (
    <div
      className="card-hover"
      style={{
        background: "var(--white)",
        borderRadius: "8px",
        border: "1px solid rgba(200,150,62,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex justify-between items-center"
        style={{
          padding: "1.2rem 1.5rem",
          borderBottom: "1px solid var(--warm)",
        }}
      >
        <h3
          className="font-serif"
          style={{ fontSize: "1.1rem", fontWeight: 600 }}
        >
          By Property
        </h3>
        <a
          className="uppercase cursor-pointer"
          style={{
            fontSize: "0.7rem",
            color: "var(--gold)",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          Manage →
        </a>
      </div>
      <div style={{ padding: "0.5rem" }}>
        {properties.map((p, i) => (
          <div
            key={p.name}
            className="flex justify-between items-center cursor-pointer row-hover"
            style={{
              padding: "0.9rem 1rem",
              borderRadius: "6px",
              transition: "background 0.15s",
              borderBottom:
                i < properties.length - 1
                  ? "1px solid var(--warm)"
                  : "none",
            }}
          >
            <div>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                {p.name}
              </h4>
              <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                {p.units} units · {p.location}
              </span>
            </div>
            <div className="text-right">
              <div
                className="font-serif"
                style={{ fontSize: "1rem", fontWeight: 600 }}
              >
                {p.income.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--green)" }}>
                {p.occupancy}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
