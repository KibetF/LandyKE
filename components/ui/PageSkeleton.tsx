import Skeleton from "@/components/ui/Skeleton";

// Generic route-segment loading state: page header + KPI cards + a list card.
export default function PageSkeleton({ kpis = 4, rows = 5 }: { kpis?: number; rows?: number }) {
  return (
    <>
      <div style={{ marginBottom: "2.5rem" }}>
        <Skeleton width="280px" height="2rem" style={{ marginBottom: "0.5rem" }} />
        <Skeleton width="220px" height="0.8rem" />
      </div>

      {kpis > 0 && (
        <div
          className="kpi-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${kpis}, 1fr)`,
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[...Array(kpis)].map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--white)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                border: "1px solid rgba(200,150,62,0.08)",
              }}
            >
              <Skeleton width="100px" height="0.6rem" style={{ marginBottom: "0.8rem" }} />
              <Skeleton width="80px" height="1.6rem" />
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius-md)",
          border: "1px solid rgba(200,150,62,0.08)",
        }}
      >
        <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
          <Skeleton width="180px" height="1rem" />
        </div>
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            style={{
              padding: "0.9rem 1.5rem",
              borderBottom: i < rows - 1 ? "1px solid var(--warm)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Skeleton width="34px" height="34px" radius="50%" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Skeleton width="140px" height="0.75rem" style={{ marginBottom: "0.3rem" }} />
              <Skeleton width="90px" height="0.6rem" />
            </div>
            <Skeleton width="70px" height="0.8rem" />
          </div>
        ))}
      </div>
    </>
  );
}
