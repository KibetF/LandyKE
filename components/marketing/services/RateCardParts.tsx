// Shared building blocks for the /services rate cards (tenant + landlord panels).

export const sectionTagStyle = {
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  color: "var(--gold)",
  fontWeight: 500,
  marginBottom: "1rem",
  gap: "0.6rem",
} as const;

export const cardDescStyle = {
  fontSize: "0.85rem",
  color: "var(--muted)",
  lineHeight: 1.7,
  fontWeight: 300,
} as const;

export const ctaLinkStyle = {
  display: "inline-block",
  marginTop: "1.5rem",
  fontSize: "0.75rem",
  color: "var(--gold)",
  fontWeight: 500,
  letterSpacing: "0.06em",
} as const;

export const noteStyle = {
  fontSize: "0.75rem",
  color: "var(--muted)",
  fontStyle: "italic",
  marginTop: "1rem",
  fontWeight: 300,
} as const;

export function CardHeader({ code, title }: { code: string; title: string }) {
  return (
    <div className="flex items-baseline" style={{ gap: "0.85rem", marginBottom: "0.8rem" }}>
      <span className="code-chip">{code}</span>
      <h3 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600 }}>
        {title}
      </h3>
    </div>
  );
}

export function PriceRow({ label, desc, value }: { label: string; desc?: string; value: string }) {
  return (
    <div style={{ padding: "0.55rem 0", borderBottom: "1px solid var(--warm)" }}>
      <div className="ledger-row" style={{ padding: 0 }}>
        <span className="ledger-row-label" style={{ color: "var(--ink)", fontWeight: 500 }}>
          {label}
        </span>
        <span className="ledger-dots" aria-hidden="true" />
        <span className="ledger-row-value" style={{ fontSize: "0.9rem", color: "var(--gold)" }}>
          {value}
        </span>
      </div>
      {desc && (
        <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 300, marginTop: "2px" }}>
          {desc}
        </p>
      )}
    </div>
  );
}

export function GoldDot() {
  return (
    <div
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "var(--gold)",
        flexShrink: 0,
        marginTop: "7px",
      }}
    />
  );
}
