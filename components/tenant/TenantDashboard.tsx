"use client";

import Link from "next/link";
import { Wrench, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { TenantPaymentSummary } from "@/types";

interface TenantInfo {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  unit_number: string | null;
  unit_type: string | null;
  rent_amount: number;
  lease_start: string | null;
  lease_end: string | null;
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
  balance: TenantPaymentSummary;
}

const statusConfig = {
  paid: { bg: "var(--green-light)", color: "var(--green)", label: "Paid", Icon: CheckCircle },
  pending: { bg: "var(--amber-light)", color: "var(--gold)", label: "Pending", Icon: Clock },
  overdue: { bg: "var(--red-light)", color: "var(--red-soft)", label: "Overdue", Icon: AlertCircle },
  vacated_unpaid: { bg: "#f0eded", color: "#6b5e5e", label: "Vacated - Unpaid", Icon: AlertCircle },
};

export default function TenantDashboard({ tenant, payments, balance }: Props) {
  const config = statusConfig[balance.currentMonthStatus];
  const StatusIcon = config.Icon;

  const now = new Date();
  const currentMonthLabel = now.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  const recentPayments = payments.slice(0, 6);

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="font-serif"
          style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.02em" }}
        >
          Hello, {tenant.full_name.split(" ")[0]}
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          {tenant.property_name}{tenant.unit_number ? ` · Unit ${tenant.unit_number}` : ""}
          {tenant.property_location ? ` · ${tenant.property_location}` : ""}
        </p>
      </div>

      {/* Balance card */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          borderTop: `3px solid ${config.color}`,
        }}
      >
        <div className="flex items-center" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
          <StatusIcon size={20} style={{ color: config.color }} />
          <span
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: config.color,
              fontWeight: 500,
            }}
          >
            {currentMonthLabel} — {config.label}
          </span>
        </div>

        <div className="flex items-end" style={{ gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
              {balance.currentMonthStatus === "paid" ? "Rent Paid" : "Amount Due"}
            </p>
            <p className="font-serif" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--ink)" }}>
              KES {(balance.currentMonthStatus === "paid" ? tenant.rent_amount : balance.balance).toLocaleString("en-KE")}
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
              Monthly Rent: KES {tenant.rent_amount.toLocaleString("en-KE")}
            </p>
            {balance.lastPaymentDate && (
              <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                Last paid: {new Date(balance.lastPaymentDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex" style={{ gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <Link
          href="/my/maintenance"
          className="flex items-center no-underline card-hover"
          style={{
            gap: "0.6rem",
            background: "var(--white)",
            border: "1px solid rgba(200,150,62,0.08)",
            borderRadius: "8px",
            padding: "0.9rem 1.3rem",
            fontSize: "0.8rem",
            color: "var(--ink)",
            fontWeight: 500,
          }}
        >
          <Wrench size={16} style={{ color: "var(--gold)" }} />
          Report a Problem
        </Link>
        <Link
          href="/my/statement"
          className="flex items-center no-underline card-hover"
          style={{
            gap: "0.6rem",
            background: "var(--white)",
            border: "1px solid rgba(200,150,62,0.08)",
            borderRadius: "8px",
            padding: "0.9rem 1.3rem",
            fontSize: "0.8rem",
            color: "var(--ink)",
            fontWeight: 500,
          }}
        >
          <FileText size={16} style={{ color: "var(--gold)" }} />
          Download Statement
        </Link>
      </div>

      {/* Recent payments */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          className="font-serif"
          style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "1rem" }}
        >
          Recent Payments
        </h3>

        {recentPayments.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No payments recorded yet.</p>
        ) : (
          <div>
            {recentPayments.map((p, i) => {
              const pConfig = statusConfig[p.status as keyof typeof statusConfig] || statusConfig.pending;
              return (
                <div
                  key={p.id}
                  className="flex items-center"
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: i < recentPayments.length - 1 ? "1px solid var(--warm)" : "none",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      KES {Number(p.amount).toLocaleString("en-KE")}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {p.method}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {p.paid_date
                        ? new Date(p.paid_date).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span
                    className="status-pill"
                    style={{
                      background: pConfig.bg,
                      color: pConfig.color,
                    }}
                  >
                    {pConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lease info */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          padding: "1.5rem",
        }}
      >
        <h3
          className="font-serif"
          style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "1rem" }}
        >
          Lease Details
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          <InfoItem label="Property" value={tenant.property_name} />
          <InfoItem label="Unit" value={tenant.unit_number || "—"} />
          {tenant.unit_type && <InfoItem label="Type" value={tenant.unit_type} />}
          <InfoItem label="Monthly Rent" value={`KES ${tenant.rent_amount.toLocaleString("en-KE")}`} />
          <InfoItem
            label="Lease Start"
            value={
              tenant.lease_start
                ? new Date(tenant.lease_start).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
                : "—"
            }
          />
          <InfoItem
            label="Lease End"
            value={
              tenant.lease_end
                ? new Date(tenant.lease_end).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
                : "—"
            }
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
