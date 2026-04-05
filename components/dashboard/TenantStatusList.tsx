import Link from "next/link";
import { Users } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

interface TenantStatus {
  initials: string;
  color: string;
  name: string;
  property: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue" | "vacated_unpaid";
}

export default function TenantStatusList({
  tenants,
}: {
  tenants: TenantStatus[];
}) {
  const isEmpty = tenants.length === 0;

  return (
    <div className="overflow-hidden rounded-lg border border-gold/8 bg-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between border-b border-warm px-6 py-4">
        <h3 className="font-serif text-[1.1rem] font-semibold">
          Tenant Payment Status
        </h3>
        <Link
          href="/tenants"
          className="text-[0.7rem] uppercase tracking-[0.08em] text-gold no-underline"
        >
          All Tenants →
        </Link>
      </div>
      <div className="p-2">
        {isEmpty ? (
          <EmptyState
            icon={Users}
            title="No tenants yet"
            description="Tenant payment status will appear here"
          />
        ) : (
          tenants.map((t) => (
            <div
              key={t.name}
              className="tenant-status-row row-hover grid cursor-pointer items-center gap-4 rounded-md px-4 py-3.5 transition-colors"
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold text-white"
                style={{
                  width: "34px",
                  height: "34px",
                  background: t.color,
                }}
              >
                {t.initials}
              </div>
              <div>
                <h4 className="mb-0.5 text-[0.82rem] font-medium">{t.name}</h4>
                <span className="text-[0.68rem] text-muted">{t.property}</span>
              </div>
              <div className="text-right">
                <span className="font-serif text-base font-semibold">
                  {t.amount.toLocaleString()}
                </span>
                <small className="block font-sans text-[0.65rem] font-normal text-muted">
                  {t.date}
                </small>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
