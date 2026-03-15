const stats = [
  { num: "47", label: "Properties Under Management" },
  { num: "312", label: "Active Tenancies" },
  { num: "96%", label: "Average Occupancy Rate" },
  { num: "18", label: "Landlord Clients" },
];

export default function StatsBelt() {
  return (
    <div
      style={{
        background: "var(--ink)",
        padding: "3rem 5rem",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="text-center"
          style={{
            padding: "1rem 2rem",
            borderRight:
              i < stats.length - 1
                ? "1px solid rgba(245,240,232,0.1)"
                : "none",
          }}
        >
          <span
            className="font-serif block"
            style={{
              fontSize: "3rem",
              fontWeight: 300,
              color: "var(--gold)",
              lineHeight: 1,
            }}
          >
            {s.num}
          </span>
          <span
            className="block uppercase"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: "rgba(245,240,232,0.5)",
              marginTop: "0.5rem",
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
