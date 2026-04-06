"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Banknote } from "lucide-react";
import type { UnitStatus } from "@/lib/queries-caretaker";

interface CaretakerDashboardProps {
  units: UnitStatus[];
  selectedMonth: string;
  monthLabel: string;
}

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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--muted)",
    marginBottom: "0.4rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    border: "1px solid var(--warm)",
    borderRadius: "4px",
    fontSize: "0.85rem",
    outline: "none",
    background: "var(--white)",
    fontFamily: "var(--font-sans), sans-serif",
    color: "var(--ink)",
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="font-serif"
          style={{ fontSize: "1.8rem", fontWeight: 300, color: "var(--ink)", marginBottom: "0.5rem" }}
        >
          Payment Tracker
        </h1>

        {/* Month selector */}
        <div className="flex items-center" style={{ gap: "0.75rem", marginBottom: "1rem" }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              background: "var(--white)",
              border: "1px solid var(--warm)",
              borderRadius: "4px",
              padding: "0.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={18} color="var(--muted)" />
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--ink)", minWidth: "140px", textAlign: "center" }}>
            {monthLabel}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            disabled={isCurrentMonth}
            style={{
              background: "var(--white)",
              border: "1px solid var(--warm)",
              borderRadius: "4px",
              padding: "0.4rem",
              cursor: isCurrentMonth ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              opacity: isCurrentMonth ? 0.4 : 1,
            }}
          >
            <ChevronRight size={18} color="var(--muted)" />
          </button>
        </div>

        {/* Summary */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            padding: "1.2rem 1.5rem",
            border: "1px solid rgba(200,150,62,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: paidCount === totalCount ? "var(--green-light)" : "rgba(200,150,62,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Banknote size={20} color={paidCount === totalCount ? "var(--green)" : "var(--gold)"} />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--ink)" }}>
              {paidCount} <span style={{ fontSize: "0.9rem", fontWeight: 300, color: "var(--muted)" }}>of {totalCount} units paid</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              {totalCount - paidCount === 0 ? "All payments collected" : `${totalCount - paidCount} remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Unit list */}
      <div className="flex flex-col" style={{ gap: "0.75rem" }}>
        {units.map((unit) => (
          <div
            key={unit.tenantId}
            style={{
              background: "var(--white)",
              borderRadius: "8px",
              padding: "1.2rem 1.5rem",
              border: "1px solid rgba(200,150,62,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "150px" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--ink)", marginBottom: "0.2rem" }}>
                {unit.tenantName}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {unit.propertyName}{unit.unitNumber ? ` · Unit ${unit.unitNumber}` : ""}
              </div>
            </div>

            <div style={{ textAlign: "right", minWidth: "100px" }}>
              <div className="font-serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
                KES {unit.expectedRent.toLocaleString()}
              </div>
            </div>

            <div style={{ minWidth: "120px", textAlign: "right" }}>
              {unit.isPaid ? (
                <span
                  className="inline-flex items-center"
                  style={{
                    gap: "0.3rem",
                    background: "var(--green-light)",
                    color: "var(--green)",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "20px",
                  }}
                >
                  <Check size={14} />
                  Paid
                </span>
              ) : (
                <button
                  onClick={() => openModal(unit)}
                  style={{
                    background: "var(--ink)",
                    color: "var(--cream)",
                    border: "none",
                    padding: "0.5rem 1rem",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        ))}

        {units.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--muted)",
              fontSize: "0.85rem",
            }}
          >
            No active tenants found for this property.
          </div>
        )}
      </div>

      {/* Mark as Paid Modal */}
      {modalUnit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              background: "var(--white)",
              borderRadius: "8px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "440px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3
              className="font-serif"
              style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.3rem" }}
            >
              Record Payment
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
              {modalUnit.tenantName} — {modalUnit.propertyName}
              {modalUnit.unitNumber ? ` · Unit ${modalUnit.unitNumber}` : ""}
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Payment Date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  required
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {method === "M-Pesa" && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>M-Pesa Reference (optional)</label>
                  <input
                    type="text"
                    value={mpesaRef}
                    onChange={(e) => setMpesaRef(e.target.value)}
                    placeholder="e.g. QHK7ABC123"
                    style={inputStyle}
                  />
                </div>
              )}

              {error && (
                <div
                  style={{
                    background: "var(--red-light)",
                    color: "var(--red-soft)",
                    padding: "0.75rem 1rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    marginBottom: "1rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex" style={{ gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "var(--cream)",
                    color: "var(--muted)",
                    border: "1px solid var(--warm)",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "var(--ink)",
                    color: "var(--cream)",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    letterSpacing: "0.05em",
                  }}
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
