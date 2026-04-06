"use client";

import { FileText, Download } from "lucide-react";
import { generateTenantRentStatement } from "@/lib/pdf/generate-tenant-statement";

interface TenantInfo {
  full_name: string;
  unit_number: string | null;
  rent_amount: number;
  property_name: string;
  property_location: string | null;
}

interface PaymentRow {
  id: string;
  amount: number;
  paid_date: string | null;
  method: string;
  status: string;
}

interface Props {
  tenant: TenantInfo;
  payments: PaymentRow[];
}

const statusColors: Record<string, { bg: string; color: string }> = {
  paid: { bg: "var(--green-light)", color: "var(--green)" },
  pending: { bg: "var(--amber-light)", color: "var(--gold)" },
  overdue: { bg: "var(--red-light)", color: "var(--red-soft)" },
};

export default function TenantStatement({ tenant, payments }: Props) {
  function handleDownload() {
    generateTenantRentStatement(tenant, payments);
  }

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.02em" }}>
            Rent Statement
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            {tenant.property_name}{tenant.unit_number ? ` · Unit ${tenant.unit_number}` : ""}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center"
          style={{
            gap: "0.5rem",
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "0.7rem 1.2rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            letterSpacing: "0.05em",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Summary card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="kpi kpi-gold"
          style={{
            position: "relative",
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.2rem",
          }}
        >
          <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.3rem" }}>
            Total Paid
          </p>
          <p className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600 }}>
            KES {totalPaid.toLocaleString("en-KE")}
          </p>
        </div>
        <div
          className="kpi kpi-green"
          style={{
            position: "relative",
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.2rem",
          }}
        >
          <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.3rem" }}>
            Payments Made
          </p>
          <p className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600 }}>
            {payments.filter((p) => p.status === "paid").length}
          </p>
        </div>
        <div
          className="kpi kpi-sage"
          style={{
            position: "relative",
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.2rem",
          }}
        >
          <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.3rem" }}>
            Monthly Rent
          </p>
          <p className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600 }}>
            KES {tenant.rent_amount.toLocaleString("en-KE")}
          </p>
        </div>
      </div>

      {/* Payment table */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          padding: "1.5rem",
        }}
      >
        <div className="flex items-center" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
          <FileText size={18} style={{ color: "var(--gold)" }} />
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            Payment History
          </h3>
        </div>

        {payments.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No payments recorded yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {/* Header */}
            <div
              className="table-header statement-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 1fr 1fr 80px",
                gap: "0.75rem",
                padding: "0.6rem 0",
                borderBottom: "1px solid var(--warm)",
              }}
            >
              <span>#</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Method</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {payments.map((p, i) => {
              const sc = statusColors[p.status] || statusColors.pending;
              return (
                <div
                  key={p.id}
                  className="row-hover statement-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 1fr 1fr 80px",
                    gap: "0.75rem",
                    padding: "0.7rem 0",
                    fontSize: "0.8rem",
                    borderBottom: i < payments.length - 1 ? "1px solid var(--warm)" : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "var(--muted)" }}>{i + 1}</span>
                  <span>
                    {p.paid_date
                      ? new Date(p.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </span>
                  <span style={{ fontWeight: 500 }}>KES {p.amount.toLocaleString("en-KE")}</span>
                  <span style={{ color: "var(--muted)" }}>{p.method}</span>
                  <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>
                    {p.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
