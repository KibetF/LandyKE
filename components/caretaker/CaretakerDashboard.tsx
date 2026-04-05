"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Banknote, Users } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import type { UnitStatus } from "@/lib/queries-caretaker";

interface CaretakerDashboardProps {
  units: UnitStatus[];
  selectedMonth: string;
  monthLabel: string;
}

const inputClasses = "w-full rounded border border-warm bg-white px-4 py-2.5 font-sans text-[0.85rem] text-ink outline-none transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20";

export default function CaretakerDashboard({
  units,
  selectedMonth,
  monthLabel,
}: CaretakerDashboardProps) {
  const router = useRouter();
  const [modalUnit, setModalUnit] = useState<UnitStatus | null>(null);
  const [amount, setAmount] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [method, setMethod] = useState("M-Pesa");
  const [mpesaRef, setMpesaRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paidCount = units.filter((u) => u.isPaid).length;
  const totalCount = units.length;

  function navigateMonth(direction: -1 | 1) {
    const [year, month] = selectedMonth.split("-").map(Number);
    const d = new Date(year, month - 1 + direction, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    router.push(`/caretaker/dashboard?month=${key}`);
  }

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonth = selectedMonth === currentMonthKey;

  function openModal(unit: UnitStatus) {
    setModalUnit(unit);
    setAmount(unit.expectedRent.toString());
    setPaidDate(new Date().toISOString().slice(0, 10));
    setMethod("M-Pesa");
    setMpesaRef("");
    setError("");
  }

  function closeModal() {
    setModalUnit(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modalUnit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/caretaker/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: modalUnit.tenantId,
          amount: Number(amount),
          paid_date: paidDate,
          method,
          mpesa_reference: method === "M-Pesa" ? mpesaRef : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record payment");
      }

      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-light text-ink">
          Payment Tracker
        </h1>

        {/* Month selector */}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
            className="flex items-center rounded border border-warm bg-white p-1.5 cursor-pointer transition-colors hover:bg-warm/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ChevronLeft size={18} className="text-muted" />
          </button>
          <span className="min-w-[140px] text-center text-[0.9rem] font-medium text-ink">
            {monthLabel}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="flex items-center rounded border border-warm bg-white p-1.5 cursor-pointer transition-colors hover:bg-warm/30 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>

        {/* Summary */}
        <div className="card flex items-center gap-3">
          <div
            className={`flex h-[42px] w-[42px] items-center justify-center rounded-full ${
              paidCount === totalCount ? "bg-green-light" : "bg-gold/10"
            }`}
          >
            <Banknote size={20} className={paidCount === totalCount ? "text-green" : "text-gold"} />
          </div>
          <div>
            <div className="font-serif text-[1.4rem] font-semibold text-ink">
              {paidCount} <span className="text-[0.9rem] font-light text-muted">of {totalCount} units paid</span>
            </div>
            <div className="text-[0.75rem] text-muted">
              {totalCount - paidCount === 0 ? "All payments collected" : `${totalCount - paidCount} remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Unit list */}
      <div className="flex flex-col gap-3">
        {units.map((unit) => (
          <div
            key={unit.tenantId}
            className="card flex flex-wrap items-center justify-between gap-4"
          >
            <div className="min-w-[150px] flex-1">
              <div className="mb-0.5 text-[0.9rem] font-medium text-ink">
                {unit.tenantName}
              </div>
              <div className="text-[0.75rem] text-muted">
                {unit.propertyName}{unit.unitNumber ? ` · Unit ${unit.unitNumber}` : ""}
              </div>
            </div>

            <div className="min-w-[100px] text-right">
              <div className="font-serif text-base font-semibold text-ink">
                KES {unit.expectedRent.toLocaleString()}
              </div>
            </div>

            <div className="min-w-[120px] text-right">
              {unit.isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-[20px] bg-green-light px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.06em] text-green">
                  <Check size={14} />
                  Paid
                </span>
              ) : (
                <button
                  onClick={() => openModal(unit)}
                  className="whitespace-nowrap rounded bg-ink px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.06em] text-cream border-none cursor-pointer transition-all hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        ))}

        {units.length === 0 && (
          <EmptyState
            icon={Users}
            title="No active tenants found"
            description="No active tenants found for this property."
          />
        )}
      </div>

      {/* Mark as Paid Modal */}
      {modalUnit && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-1 font-serif text-xl font-semibold">
              Record Payment
            </h3>
            <p className="mb-6 text-[0.8rem] text-muted">
              {modalUnit.tenantName} — {modalUnit.propertyName}
              {modalUnit.unitNumber ? ` · Unit ${modalUnit.unitNumber}` : ""}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="label-upper mb-1.5 block">Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  className={inputClasses}
                />
              </div>

              <div className="mb-4">
                <label className="label-upper mb-1.5 block">Payment Date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>

              <div className="mb-4">
                <label className="label-upper mb-1.5 block">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  required
                  className={`${inputClasses} cursor-pointer`}
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {method === "M-Pesa" && (
                <div className="mb-4">
                  <label className="label-upper mb-1.5 block">M-Pesa Reference (optional)</label>
                  <input
                    type="text"
                    value={mpesaRef}
                    onChange={(e) => setMpesaRef(e.target.value)}
                    placeholder="e.g. QHK7ABC123"
                    className={inputClasses}
                  />
                </div>
              )}

              {error && (
                <div className="mb-4 rounded bg-red-light px-4 py-3 text-[0.8rem] text-red-soft">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded border border-warm bg-cream py-3 text-[0.8rem] font-medium text-muted cursor-pointer transition-colors hover:bg-warm/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded bg-ink py-3 text-[0.8rem] font-medium tracking-[0.05em] text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  {loading ? "Saving..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
