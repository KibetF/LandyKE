import Link from "next/link";
import StatusPill from "@/components/ui/StatusPill";

interface TenantStatus {
  initials: string;
  color: string;
  name: string;
  property: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
}

export default function TenantStatusList({
  tenants,
}: {
  tenants: TenantStatus[];
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
          Tenant Payment Status
        </h3>
        <Link
          href="/tenants"
          className="uppercase cursor-pointer"
          style={{
            fontSize: "0.7rem",
            color: "var(--gold)",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          All Tenants →
        </Link>
      </div>
      <div style={{ padding: "0.5rem" }}>
        {tenants.map((t) => (
          <div
            key={t.name}
            className="items-center cursor-pointer row-hover"
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto",
              gap: "1rem",
              padding: "0.9rem 1rem",
              borderRadius: "6px",
              transition: "background 0.15s",
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: t.color,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--white)",
              }}
            >
              {t.initials}
            </div>
            <div>
              <h4
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  marginBottom: "0.15rem",
                }}
              >
                {t.name}
              </h4>
              <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                {t.property}
              </span>
            </div>
            <div className="text-right">
              <span
                className="font-serif"
                style={{ fontSize: "1rem", fontWeight: 600 }}
              >
                {t.amount.toLocaleString()}
              </span>
              <small
                className="block"
                style={{
                  fontSize: "0.65rem",
                  color: "var(--muted)",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 400,
                }}
              >
                {t.date}
              </small>
            </div>
            <StatusPill status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
