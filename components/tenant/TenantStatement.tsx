"use client";

import { useState } from "react";
import { FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { generateTenantRentStatement } from "@/lib/pdf/generate-tenant-statement";
import StatusPill from "@/components/ui/StatusPill";
import { periodOf } from "@/lib/queries";
import type { TenantPaymentSummary } from "@/types";

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
  rent_period: string | null;
  method: string;
  status: string;
  payment_type?: string | null;
}

interface Props {
  tenant: TenantInfo;
  payments: PaymentRow[];
  summary: TenantPaymentSummary;
}

export default function TenantStatement({ tenant, payments, summary }: Props) {
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  function handleDownload() {
    generateTenantRentStatement(tenant, payments, summary);
  }

  // Newest period first
  const ledgerRows = [...summary.perMonth].sort((a, b) => (a.period < b.period ? 1 : -1));

  const balanceLabel = summary.netPosition >= 0 ? "Credit Balance" : "Amount Owed";
  const balanceAmount = Math.abs(summary.netPosition);
  const balanceColor = summary.netPosition >= 0 ? "var(--green)" : "var(--rust)";

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

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            position: "relative",
            background: "var(--white)",
            borderRadius: "8px",
            border: `1px solid ${summary.netPosition >= 0 ? "rgba(45,106,79,0.15)" : "rgba(139,58,42,0.15)"}`,
            padding: "1.2rem",
          }}
        >
          <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.3rem" }}>
            {balanceLabel}
          </p>
          <p className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, color: balanceColor }}>
            KES {balanceAmount.toLocaleString("en-KE")}
          </p>
          <p style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: "0.3rem" }}>
            {summary.netPosition >= 0 ? "You are paid up" : "Past-due across periods"}
          </p>
        </div>

        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.2rem",
          }}
        >
          <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.3rem" }}>
            Outstanding
          </p>
          <p className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600 }}>
            KES {summary.totalOutstanding.toLocaleString("en-KE")}
          </p>
        </div>

        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.2rem",
          }}
        >
          <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.3rem" }}>
            Credit / Advance
          </p>
          <p className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, color: summary.carriedCredit > 0 ? "var(--green)" : "var(--ink)" }}>
            KES {summary.carriedCredit.toLocaleString("en-KE")}
          </p>
        </div>

        <div
          style={{
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

      {/* Ledger */}
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
            Month-by-Month Ledger
          </h3>
        </div>

        {ledgerRows.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No rent activity yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "20px 1.6fr 1fr 1fr 1fr 110px",
                gap: "0.75rem",
                padding: "0.6rem 0",
                borderBottom: "1px solid var(--warm)",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--muted)",
              }}
            >
              <span></span>
              <span>Period</span>
              <span>Expected</span>
              <span>Paid</span>
              <span>Balance</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {ledgerRows.map((row, i) => {
              const isExpanded = expandedPeriod === row.period;
              const periodEvents = payments.filter(
                (p) => (!p.payment_type || p.payment_type === "rent") && periodOf(p) === row.period
              );
              const balanceColor = row.balance > 0 ? "var(--rust)" : row.balance < 0 ? "var(--green)" : "var(--ink)";
              const balanceText = row.balance > 0
                ? `KES ${row.balance.toLocaleString("en-KE")}`
                : row.balance < 0
                  ? `+KES ${(-row.balance).toLocaleString("en-KE")}`
                  : "—";
              return (
                <div key={row.period} style={{ borderBottom: i < ledgerRows.length - 1 ? "1px solid var(--warm)" : "none" }}>
                  <div
                    onClick={() => setExpandedPeriod(isExpanded ? null : row.period)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "20px 1.6fr 1fr 1fr 1fr 110px",
                      gap: "0.75rem",
                      padding: "0.8rem 0",
                      fontSize: "0.82rem",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>
                      {periodEvents.length > 0 ? (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : ""}
                    </span>
                    <span style={{ fontWeight: 500 }}>{row.periodLabel}</span>
                    <span style={{ color: "var(--muted)" }}>KES {row.expected.toLocaleString("en-KE")}</span>
                    <span>KES {row.paid.toLocaleString("en-KE")}</span>
                    <span style={{ color: balanceColor, fontWeight: 500 }}>{balanceText}</span>
                    <StatusPill status={row.status} />
                  </div>
                  {isExpanded && periodEvents.length > 0 && (
                    <div style={{ padding: "0.5rem 0 0.8rem 2rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                      {periodEvents.map((ev) => (
                        <div key={ev.id} style={{ padding: "0.3rem 0", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                          <span>
                            {ev.paid_date
                              ? new Date(ev.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                            {" · "}{ev.method}
                          </span>
                          <span style={{ fontWeight: 500, color: "var(--ink)" }}>
                            KES {ev.amount.toLocaleString("en-KE")} · {ev.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
