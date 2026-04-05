"use client";

import { FileText, Download } from "lucide-react";
import { generateTenantRentStatement } from "@/lib/pdf/generate-tenant-statement";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";

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

export default function TenantStatement({ tenant, payments }: Props) {
  function handleDownload() {
    generateTenantRentStatement(tenant, payments);
  }

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-normal tracking-tight">
            Rent Statement
          </h1>
          <p className="mt-0.5 text-[0.78rem] text-muted">
            {tenant.property_name}{tenant.unit_number ? ` · Unit ${tenant.unit_number}` : ""}
          </p>
        </div>
        <button
          onClick={handleDownload}
          aria-label="Download rent statement as PDF"
          className="flex items-center gap-2 rounded bg-ink px-5 py-2.5 text-[0.78rem] font-medium tracking-[0.05em] text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Paid"
          value={`KES ${totalPaid.toLocaleString("en-KE")}`}
          borderColor="gold"
        />
        <StatCard
          label="Payments Made"
          value={payments.filter((p) => p.status === "paid").length}
          borderColor="green"
        />
        <StatCard
          label="Monthly Rent"
          value={`KES ${tenant.rent_amount.toLocaleString("en-KE")}`}
          borderColor="sage"
        />
      </div>

      {/* Payment table */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={18} className="text-gold" />
          <h3 className="font-serif text-[1.1rem] font-medium">
            Payment History
          </h3>
        </div>

        {payments.length === 0 ? (
          <EmptyState title="No payments recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_80px] gap-3 border-b border-warm py-2.5 text-[0.65rem] uppercase tracking-[0.1em] text-muted statement-grid">
              <span>#</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Method</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {payments.map((p, i) => (
              <div
                key={p.id}
                className={`row-hover grid grid-cols-[40px_1fr_1fr_1fr_80px] items-center gap-3 py-2.5 text-[0.8rem] statement-grid ${
                  i < payments.length - 1 ? "border-b border-warm" : ""
                }`}
              >
                <span className="text-muted">{i + 1}</span>
                <span>
                  {p.paid_date
                    ? new Date(p.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </span>
                <span className="font-medium">KES {p.amount.toLocaleString("en-KE")}</span>
                <span className="text-muted">{p.method}</span>
                <StatusBadge status={p.status as "paid" | "pending" | "overdue"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
