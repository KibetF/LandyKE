import type { PortfolioProperty } from "./portfolioData";

export default function PropertyCard({ p }: { p: PortfolioProperty }) {
  return (
    <div className="property-card portfolio-card">
      <div
        className="uppercase"
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.14em",
          color: "var(--gold)",
          fontWeight: 500,
          marginBottom: "0.5rem",
        }}
      >
        {p.type}
      </div>
      <h3
        className="font-serif"
        style={{
          fontSize: "1.3rem",
          fontWeight: 600,
          marginBottom: "1rem",
          paddingBottom: "0.9rem",
          borderBottom: "1px solid var(--warm)",
        }}
      >
        {p.name}
      </h3>
      <div className="ledger-row" style={{ padding: "0.4rem 0" }}>
        <span className="ledger-row-label">Location</span>
        <span className="ledger-dots" aria-hidden="true" />
        <span className="ledger-row-value" style={{ fontSize: "0.85rem" }}>
          {p.area}, Eldoret
        </span>
      </div>
      <div className="ledger-row" style={{ padding: "0.4rem 0" }}>
        <span className="ledger-row-label">Units</span>
        <span className="ledger-dots" aria-hidden="true" />
        <span className="ledger-row-value" style={{ fontSize: "0.85rem" }}>
          {p.units}
        </span>
      </div>
    </div>
  );
}
