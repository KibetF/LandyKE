"use client";

import Link from "next/link";
import { Wrench, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
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
  paid: { colorClass: "text-green", borderClass: "border-t-green", label: "Paid", Icon: CheckCircle },
  pending: { colorClass: "text-gold", borderClass: "border-t-gold", label: "Pending", Icon: Clock },
  overdue: { colorClass: "text-red-soft", borderClass: "border-t-red-soft", label: "Overdue", Icon: AlertCircle },
  vacated_unpaid: { colorClass: "text-[#6b5e5e]", borderClass: "border-t-[#6b5e5e]", label: "Vacated - Unpaid", Icon: AlertCircle },
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
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-normal tracking-tight">
          Hello, {tenant.full_name.split(" ")[0]}
        </h1>
        <p className="mt-0.5 text-[0.78rem] text-muted">
          {tenant.property_name}{tenant.unit_number ? ` · Unit ${tenant.unit_number}` : ""}
          {tenant.property_location ? ` · ${tenant.property_location}` : ""}
        </p>
      </div>

      {/* Balance card */}
      <div className={`card mb-6 border-t-[3px] ${config.borderClass}`}>
        <div className="mb-4 flex items-center gap-2">
          <StatusIcon size={20} className={config.colorClass} />
          <span className={`label-upper font-medium ${config.colorClass}`}>
            {currentMonthLabel} — {config.label}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <p className="mb-1 text-[0.7rem] text-muted">
              {balance.currentMonthStatus === "paid" ? "Rent Paid" : "Amount Due"}
            </p>
            <p className="font-serif text-[2rem] font-semibold text-ink">
              KES {(balance.currentMonthStatus === "paid" ? tenant.rent_amount : balance.balance).toLocaleString("en-KE")}
            </p>
          </div>
          <div className="ml-auto">
            <p className="text-[0.7rem] text-muted">
              Monthly Rent: KES {tenant.rent_amount.toLocaleString("en-KE")}
            </p>
            {balance.lastPaymentDate && (
              <p className="mt-0.5 text-[0.7rem] text-muted">
                Last paid: {new Date(balance.lastPaymentDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <Link
          href="/my/maintenance"
          aria-label="Report a maintenance problem"
          className="card card-hover flex items-center gap-2.5 no-underline text-[0.8rem] font-medium text-ink"
        >
          <Wrench size={16} className="text-gold" />
          Report a Problem
        </Link>
        <Link
          href="/my/statement"
          aria-label="Download rent statement"
          className="card card-hover flex items-center gap-2.5 no-underline text-[0.8rem] font-medium text-ink"
        >
          <FileText size={16} className="text-gold" />
          Download Statement
        </Link>
      </div>

      {/* Recent payments */}
      <div className="card mb-6">
        <h3 className="mb-4 font-serif text-[1.1rem] font-medium">
          Recent Payments
        </h3>

        {recentPayments.length === 0 ? (
          <EmptyState
            title="No payments recorded yet"
            description="Your payment history will appear here once rent is paid."
          />
        ) : (
          <div>
            {recentPayments.map((p, i) => (
              <div
                key={p.id}
                className={`flex flex-wrap items-center gap-4 py-3 ${
                  i < recentPayments.length - 1 ? "border-b border-warm" : ""
                }`}
              >
                <div className="min-w-[120px] flex-1">
                  <p className="text-[0.8rem] font-medium">
                    KES {Number(p.amount).toLocaleString("en-KE")}
                  </p>
                  <p className="text-[0.7rem] text-muted">{p.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.75rem] text-muted">
                    {p.paid_date
                      ? new Date(p.paid_date).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <StatusBadge status={p.status as "paid" | "pending" | "overdue"} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lease info */}
      <div className="card">
        <h3 className="mb-4 font-serif text-[1.1rem] font-medium">
          Lease Details
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
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
      <p className="label-upper mb-1">{label}</p>
      <p className="text-[0.85rem] font-medium">{value}</p>
    </div>
  );
}
