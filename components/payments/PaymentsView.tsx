"use client";

import { useState, useMemo } from "react";
import {
  Smartphone,
  Building2,
  Banknote,
  Download,
} from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";

interface PaymentData {
  id: string;
  tenant_id: string;
  property_id: string;
  amount: number;
  payment_date: string;
  method: string;
  status: "paid" | "pending" | "overdue";
  tenants: { full_name: string; unit_number: string | null };
  properties: { name: string };
}

interface PaymentsViewProps {
  payments: PaymentData[];
  expectedRent: number;
  properties: Array<{ id: string; name: string }>;
}

function getMethodIcon(method: string) {
  const m = method?.toLowerCase() || "";
  if (m.includes("mpesa") || m.includes("m-pesa")) return Smartphone;
  if (m.includes("bank")) return Building2;
  return Banknote;
}

function getMonthOptions(payments: PaymentData[]) {
  const months = new Set<string>();
  payments.forEach((p) => {
    const d = new Date(p.payment_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.add(key);
  });
  return Array.from(months).sort().reverse();
}

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

export default function PaymentsView({
  payments,
  expectedRent,
  properties,
}: PaymentsViewProps) {
  const monthOptions = useMemo(() => getMonthOptions(payments), [payments]);
  const [monthFilter, setMonthFilter] = useState(monthOptions[0] || "all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (monthFilter !== "all") {
        const d = new Date(p.payment_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== monthFilter) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [payments, monthFilter, statusFilter]);

  const collected = filtered
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = expectedRent - collected;

  function exportCsv() {
    const header = "Date,Tenant,Property,Unit,Amount,Method,Status\n";
    const rows = filtered
      .map(
        (p) =>
          `${p.payment_date},${p.tenants?.full_name},${p.properties?.name},${p.tenants?.unit_number || ""},${p.amount},${p.method},${p.status}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${monthFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="font-serif"
          style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}
        >
          Payments
        </h1>
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--muted)",
            marginTop: "0.2rem",
          }}
        >
          Track rent payments and transactions
        </p>
      </div>

      {/* Filters */}
      <div
        className="flex items-center"
        style={{ gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}
      >
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{
            background: "var(--white)",
            border: "1px solid var(--warm)",
            padding: "0.6rem 1.2rem",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.8rem",
            color: "var(--ink)",
            borderRadius: "4px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All Months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: "var(--white)",
            border: "1px solid var(--warm)",
            padding: "0.6rem 1.2rem",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.8rem",
            color: "var(--ink)",
            borderRadius: "4px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>

        <button
          onClick={exportCsv}
          className="flex items-center"
          style={{
            marginLeft: "auto",
            gap: "0.5rem",
            background: "var(--ink)",
            color: "var(--cream)",
            border: "none",
            padding: "0.6rem 1.2rem",
            fontSize: "0.8rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "var(--font-sans), sans-serif",
          }}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* KPI cards */}
      <div className="payments-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--green)",
            }}
          >
            Collected
          </span>
          <div
            className="font-serif"
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--green)",
            }}
          >
            KES {collected.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
            }}
          >
            Expected
          </span>
          <div
            className="font-serif"
            style={{ fontSize: "1.3rem", fontWeight: 600 }}
          >
            KES {expectedRent.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: outstanding > 0 ? "var(--rust)" : "var(--muted)",
            }}
          >
            Outstanding
          </span>
          <div
            className="font-serif"
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              color: outstanding > 0 ? "var(--rust)" : "var(--ink)",
            }}
          >
            KES {Math.max(0, outstanding).toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
            }}
          >
            Payments
          </span>
          <div
            className="font-serif"
            style={{ fontSize: "1.3rem", fontWeight: 600 }}
          >
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Payment list */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.85rem",
            }}
          >
            No payments found for the selected filters.
          </div>
        ) : (
          <div>
            {filtered.map((payment, i) => {
              const MethodIcon = getMethodIcon(payment.method);
              const amountColor =
                payment.status === "paid"
                  ? "var(--green)"
                  : payment.status === "overdue"
                    ? "var(--red-soft)"
                    : "var(--ink)";

              return (
                <div
                  key={payment.id}
                  className="items-center row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto auto",
                    gap: "1rem",
                    padding: "1rem 1.5rem",
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--warm)"
                        : "none",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Method icon */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "var(--warm)",
                    }}
                  >
                    <MethodIcon size={16} style={{ color: "var(--muted)" }} />
                  </div>

                  {/* Tenant + property */}
                  <div>
                    <h4
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: "0.15rem",
                      }}
                    >
                      {payment.tenants?.full_name || "—"}
                    </h4>
                    <span
                      style={{ fontSize: "0.7rem", color: "var(--muted)" }}
                    >
                      {payment.properties?.name}
                      {payment.tenants?.unit_number
                        ? ` · Unit ${payment.tenants.unit_number}`
                        : ""}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <span
                      className="font-serif"
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: amountColor,
                      }}
                    >
                      KES {Number(payment.amount).toLocaleString()}
                    </span>
                  </div>

                  {/* Date */}
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted)",
                      minWidth: "80px",
                    }}
                  >
                    {new Date(payment.payment_date).toLocaleDateString(
                      "en-KE",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  {/* Status */}
                  <StatusPill status={payment.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
