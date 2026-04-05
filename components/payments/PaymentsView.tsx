"use client";

import { useState, useMemo } from "react";
import {
  Smartphone,
  Building2,
  Banknote,
  Download,
  CreditCard,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

interface PaymentData {
  id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  paid_date: string | null;
  due_date: string | null;
  notes: string | null;
  status: string;
  tenants: { full_name: string; property_id: string; properties: { name: string } };
}

interface PaymentsViewProps {
  payments: PaymentData[];
  expectedRent: number;
  properties: Array<{ id: string; name: string }>;
  currentPage?: number;
  totalPages?: number;
}

function getMethodIcon(notes: string | null) {
  const m = (notes || "").toLowerCase();
  if (m.includes("mpesa") || m.includes("m-pesa")) return Smartphone;
  if (m.includes("bank")) return Building2;
  return Banknote;
}

function getMonthOptions(payments: PaymentData[]) {
  const months = new Set<string>();
  payments.forEach((p) => {
    const dateStr = p.paid_date || p.due_date;
    if (!dateStr) return;
    const d = new Date(dateStr);
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

const selectClasses = "rounded border border-warm bg-white px-5 py-2.5 font-sans text-[0.8rem] text-ink outline-none cursor-pointer transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20";

export default function PaymentsView({
  payments,
  expectedRent,
  properties,
  currentPage = 1,
  totalPages = 1,
}: PaymentsViewProps) {
  const monthOptions = useMemo(() => getMonthOptions(payments), [payments]);
  const [monthFilter, setMonthFilter] = useState(monthOptions[0] || "all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (monthFilter !== "all") {
        const dateStr = p.paid_date || p.due_date;
        if (!dateStr) return false;
        const d = new Date(dateStr);
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
    const header = "Date,Tenant,Property,Amount,Method,Status\n";
    const rows = filtered
      .map(
        (p) =>
          `${p.paid_date || p.due_date || ""},${p.tenants?.full_name},${p.tenants?.properties?.name || ""},${p.amount},${p.notes || ""},${p.status}`
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
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-light text-ink">Payments</h1>
        <p className="mt-0.5 text-[0.8rem] text-muted">
          Track rent payments and transactions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className={selectClasses}>
          <option value="all">All Months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClasses}>
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>

        <button
          onClick={exportCsv}
          aria-label="Export payments as CSV"
          className="ml-auto flex items-center gap-2 rounded bg-ink px-5 py-2.5 text-[0.8rem] font-sans text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 payments-kpi-grid">
        <div className="card py-4 px-5">
          <span className="label-upper text-green">Collected</span>
          <div className="font-serif text-xl font-semibold text-green">KES {collected.toLocaleString()}</div>
        </div>
        <div className="card py-4 px-5">
          <span className="label-upper">Expected</span>
          <div className="font-serif text-xl font-semibold">KES {expectedRent.toLocaleString()}</div>
        </div>
        <div className="card py-4 px-5">
          <span className={`label-upper ${outstanding > 0 ? "text-rust" : ""}`}>Outstanding</span>
          <div className={`font-serif text-xl font-semibold ${outstanding > 0 ? "text-rust" : ""}`}>KES {Math.max(0, outstanding).toLocaleString()}</div>
        </div>
        <div className="card py-4 px-5">
          <span className="label-upper">Payments</span>
          <div className="font-serif text-xl font-semibold">{filtered.length}</div>
        </div>
      </div>

      {/* Payment list */}
      <div className="overflow-hidden rounded-lg border border-gold/8 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="No payments match the selected filters."
          />
        ) : (
          <div>
            {filtered.map((payment, i) => {
              const MethodIcon = getMethodIcon(payment.notes);
              const amountColorClass =
                payment.status === "paid"
                  ? "text-green"
                  : payment.status === "overdue"
                    ? "text-red-soft"
                    : "text-ink";

              const displayDate = payment.paid_date || payment.due_date;

              return (
                <div
                  key={payment.id}
                  className={`payment-row row-hover grid items-center gap-4 px-6 py-4 transition-colors ${
                    i < filtered.length - 1 ? "border-b border-warm" : ""
                  }`}
                >
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-warm">
                    <MethodIcon size={16} className="text-muted" />
                  </div>
                  <div>
                    <h4 className="mb-0.5 text-[0.85rem] font-medium">
                      {payment.tenants?.full_name || "—"}
                    </h4>
                    <span className="text-[0.7rem] text-muted">
                      {payment.tenants?.properties?.name || ""}
                      {payment.notes ? ` · ${payment.notes}` : ""}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-serif text-base font-semibold ${amountColorClass}`}>
                      KES {Number(payment.amount).toLocaleString()}
                    </span>
                  </div>
                  <span className="min-w-[80px] text-[0.72rem] text-muted">
                    {displayDate
                      ? new Date(displayDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </span>
                  <StatusBadge status={payment.status as "paid" | "pending" | "overdue"} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}
