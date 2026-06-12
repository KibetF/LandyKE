"use client";

import { useState } from "react";
import useSWR from "swr";
import { Banknote, Plus, X, Check, AlertCircle, Eye, Trash2, Pencil, RotateCcw } from "lucide-react";

interface Property {
  id: string;
  name: string;
  location: string | null;
  total_units: number;
  landlord_id: string;
}

interface Tenant {
  id: string;
  full_name: string;
  property_id: string;
  unit_number: string | null;
  rent_amount: number;
  status: string;
}

interface Deposit {
  id: string;
  tenant_id: string;
  landlord_id: string;
  property_id: string;
  amount: number;
  deposit_date: string;
  status: "held" | "returned" | "partially_refunded" | "forfeited";
  notes: string | null;
  return_date: string | null;
  amount_returned: number | null;
  deductions: number | null;
  return_reason: string | null;
  created_at?: string;
  tenants?: {
    full_name: string;
    property_id: string;
    unit_number: string | null;
    phone: string | null;
    properties?: { name: string; location: string | null };
  };
}

interface DepositsManagementProps {
  properties: Property[];
  tenants: Tenant[];
  selectedLandlordId: string;
}

const cardStyle = {
  background: "var(--white)",
  borderRadius: "8px",
  border: "1px solid rgba(200,150,62,0.08)",
  boxShadow: "var(--shadow-sm)",
  overflow: "hidden" as const,
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 1rem",
  border: "1px solid var(--warm)",
  borderRadius: "4px",
  fontSize: "0.85rem",
  fontFamily: "var(--font-sans), sans-serif",
  color: "var(--ink)",
  background: "var(--white)",
} as const;

const labelStyle = {
  display: "block" as const,
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
  fontWeight: 500,
};

const btnStyle = {
  gap: "0.5rem",
  background: "var(--ink)",
  color: "var(--cream)",
  border: "none",
  padding: "0.75rem",
  fontSize: "0.85rem",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "var(--font-sans), sans-serif",
  fontWeight: 500,
} as const;

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  held: { bg: "rgba(200,150,62,0.12)", color: "var(--gold)", label: "Held" },
  returned: { bg: "rgba(45,106,79,0.1)", color: "var(--green)", label: "Returned" },
  partially_refunded: { bg: "rgba(30,100,180,0.1)", color: "#1e64b4", label: "Partial Refund" },
  forfeited: { bg: "rgba(139,58,42,0.1)", color: "var(--rust)", label: "Forfeited" },
};

export default function DepositsManagement({ properties, tenants, selectedLandlordId }: DepositsManagementProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [filterProperty, setFilterProperty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Record form
  const [showForm, setShowForm] = useState(false);
  const [formProperty, setFormProperty] = useState("");
  const [formTenant, setFormTenant] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("");

  // Return modal
  const [returnDeposit, setReturnDeposit] = useState<Deposit | null>(null);
  const [returnStatus, setReturnStatus] = useState<"returned" | "partially_refunded" | "forfeited">("returned");
  const [returnAmount, setReturnAmount] = useState("");
  const [returnDeductions, setReturnDeductions] = useState("0");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [returnReason, setReturnReason] = useState("");

  // Detail view
  const [viewDeposit, setViewDeposit] = useState<Deposit | null>(null);

  // Edit
  const [editDeposit, setEditDeposit] = useState<Deposit | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: depositsData, mutate: mutateDeposits } = useSWR<{ deposits: Deposit[] }>(
    `/api/admin/deposits?landlord_id=${selectedLandlordId}`,
    (url: string) => fetch(url).then((r) => r.json()),
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  );
  const deposits = depositsData?.deposits ?? [];

  async function handleRecordDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTenant || !formAmount) return;

    setLoading(true);
    setMessage(null);

    const tenant = tenants.find((t) => t.id === formTenant);
    const res = await fetch("/api/admin/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: formTenant,
        landlord_id: selectedLandlordId,
        property_id: tenant?.property_id || formProperty,
        amount: Number(formAmount),
        deposit_date: formDate,
        notes: formNotes || null,
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "Deposit recorded successfully" });
      setShowForm(false);
      setFormProperty("");
      setFormTenant("");
      setFormAmount("");
      setFormDate(new Date().toISOString().split("T")[0]);
      setFormNotes("");
      mutateDeposits();
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.error || "Failed to record deposit" });
    }
    setLoading(false);
  }

  async function handleReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!returnDeposit) return;

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/deposits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deposit_id: returnDeposit.id,
        status: returnStatus,
        return_date: returnDate,
        amount_returned: Number(returnAmount),
        deductions: Number(returnDeductions),
        return_reason: returnReason || null,
      }),
    });

    if (res.ok) {
      const statusLabel = returnStatus === "returned" ? "returned" : returnStatus === "partially_refunded" ? "partially refunded" : "forfeited";
      setMessage({ type: "success", text: `Deposit ${statusLabel} successfully` });
      setReturnDeposit(null);
      mutateDeposits();
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.error || "Failed to process return" });
    }
    setLoading(false);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editDeposit) return;

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/deposits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deposit_id: editDeposit.id,
        amount: Number(editAmount),
        deposit_date: editDate,
        notes: editNotes || null,
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "Deposit updated" });
      setEditDeposit(null);
      mutateDeposits();
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.error || "Failed to update" });
    }
    setLoading(false);
  }

  async function handleDelete(deposit: Deposit) {
    if (!confirm(`Delete deposit of KES ${deposit.amount.toLocaleString()} for ${deposit.tenants?.full_name}?`)) return;

    setLoading(true);
    const res = await fetch("/api/admin/deposits", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deposit_id: deposit.id }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "Deposit deleted" });
      mutateDeposits();
    } else {
      setMessage({ type: "error", text: "Failed to delete deposit" });
    }
    setLoading(false);
  }

  function openReturn(deposit: Deposit) {
    setReturnDeposit(deposit);
    setReturnStatus("returned");
    setReturnAmount(String(deposit.amount));
    setReturnDeductions("0");
    setReturnDate(new Date().toISOString().split("T")[0]);
    setReturnReason("");
  }

  function openEdit(deposit: Deposit) {
    setEditDeposit(deposit);
    setEditAmount(String(deposit.amount));
    setEditDate(deposit.deposit_date);
    setEditNotes(deposit.notes || "");
  }

  // When the return action changes, pre-fill the amounts accordingly
  function handleReturnStatusChange(status: "returned" | "partially_refunded" | "forfeited") {
    setReturnStatus(status);
    if (!returnDeposit) return;
    if (status === "forfeited") {
      setReturnAmount("0");
      setReturnDeductions(String(returnDeposit.amount));
    } else if (status === "returned") {
      setReturnAmount(String(returnDeposit.amount));
      setReturnDeductions("0");
    }
  }

  // Auto-calculate deductions when return amount changes
  function handleReturnAmountChange(val: string) {
    setReturnAmount(val);
    if (returnDeposit) {
      const returned = Number(val) || 0;
      setReturnDeductions(String(Math.max(0, returnDeposit.amount - returned)));
    }
  }

  const formTenants = formProperty
    ? tenants.filter((t) => t.property_id === formProperty)
    : tenants;

  const filteredDeposits = deposits.filter((d) => {
    if (filterProperty && d.property_id !== filterProperty) return false;
    if (filterStatus && d.status !== filterStatus) return false;
    return true;
  });

  const totalHeld = deposits.filter((d) => d.status === "held").reduce((s, d) => s + d.amount, 0);
  const heldCount = deposits.filter((d) => d.status === "held").length;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div className="flex items-center" style={{ gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Deposits Held</span>
            <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--gold)" }}>
              KES {totalHeld.toLocaleString()}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{heldCount} active deposit{heldCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center"
          style={{ ...btnStyle, gap: "0.4rem" }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Record Deposit"}
        </button>
      </div>

      {message && (
        <div
          className="flex items-center"
          style={{
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.8rem",
            background: message.type === "success" ? "var(--green-light)" : "var(--red-light)",
            color: message.type === "success" ? "var(--green)" : "var(--red-soft)",
          }}
        >
          {message.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
          {message.text}
        </div>
      )}

      {/* Record Deposit Form */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1rem", fontWeight: 600 }}>Record Deposit</h3>
          </div>
          <form onSubmit={handleRecordDeposit} style={{ padding: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Property</label>
                <select
                  value={formProperty}
                  onChange={(e) => { setFormProperty(e.target.value); setFormTenant(""); }}
                  style={inputStyle}
                >
                  <option value="">— All properties —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tenant *</label>
                <select
                  required
                  value={formTenant}
                  onChange={(e) => setFormTenant(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">— Select tenant —</option>
                  {formTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}{t.unit_number ? ` · Unit ${t.unit_number}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Amount (KES) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Deposit Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Notes</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. M-Pesa ref, cash, bank transfer..."
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="flex justify-end" style={{ marginTop: "1rem", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ ...btnStyle, background: "var(--warm)", color: "var(--ink)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center"
                style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}
              >
                <Banknote size={16} />
                {loading ? "Recording..." : "Record Deposit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center" style={{ gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          style={{ ...inputStyle, width: "auto", maxWidth: "250px", fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
        >
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...inputStyle, width: "auto", maxWidth: "200px", fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
        >
          <option value="">All Statuses</option>
          <option value="held">Held</option>
          <option value="returned">Returned</option>
          <option value="partially_refunded">Partially Refunded</option>
          <option value="forfeited">Forfeited</option>
        </select>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {filteredDeposits.length} deposit{filteredDeposits.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Deposits List */}
      <div style={cardStyle}>
        {filteredDeposits.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "3rem", color: "var(--muted)" }}>
            <Banknote size={36} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
            <span style={{ fontSize: "0.9rem" }}>No deposits found</span>
            <span style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {deposits.length === 0 ? "Record your first deposit above" : "Try adjusting filters"}
            </span>
          </div>
        ) : (
          filteredDeposits.map((deposit, i) => {
            const colors = statusColors[deposit.status] || statusColors.held;
            return (
              <div
                key={deposit.id}
                className="row-hover"
                style={{
                  padding: "1rem 1.5rem",
                  borderBottom: i < filteredDeposits.length - 1 ? "1px solid var(--warm)" : "none",
                }}
              >
                <div className="flex justify-between items-center">
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                      {deposit.tenants?.full_name || "—"}
                      {deposit.tenants?.unit_number ? ` · Unit ${deposit.tenants.unit_number}` : ""}
                    </h4>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {deposit.tenants?.properties?.name || "—"}
                      {" · "}
                      {new Date(deposit.deposit_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      {deposit.notes ? ` · ${deposit.notes}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center" style={{ gap: "0.75rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <div className="font-serif" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                        KES {deposit.amount.toLocaleString()}
                      </div>
                      {deposit.status !== "held" && deposit.amount_returned != null && (
                        <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                          Returned: KES {deposit.amount_returned.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: colors.bg,
                        color: colors.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {colors.label}
                    </span>
                    {deposit.status === "held" ? (
                      <div className="flex items-center" style={{ gap: "0.25rem" }}>
                        <button
                          onClick={() => openReturn(deposit)}
                          title="Process Return"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.35rem" }}
                        >
                          <RotateCcw size={14} style={{ color: "var(--green)" }} />
                        </button>
                        <button
                          onClick={() => openEdit(deposit)}
                          title="Edit"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.35rem" }}
                        >
                          <Pencil size={14} style={{ color: "var(--gold)" }} />
                        </button>
                        <button
                          onClick={() => handleDelete(deposit)}
                          title="Delete"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.35rem" }}
                        >
                          <Trash2 size={14} style={{ color: "var(--rust)" }} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setViewDeposit(deposit)}
                        title="View Details"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0.35rem" }}
                      >
                        <Eye size={14} style={{ color: "var(--muted)" }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Return/Refund Modal */}
      {returnDeposit && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setReturnDeposit(null)}
        >
          <div
            style={{
              background: "var(--white)", borderRadius: "8px", padding: "1.5rem",
              width: "calc(100% - 2rem)", maxWidth: "480px", margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: "1rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Process Deposit Return</h3>
              <button onClick={() => setReturnDeposit(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>

            <div style={{ padding: "0.75rem 1rem", background: "var(--cream)", borderRadius: "6px", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{returnDeposit.tenants?.full_name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {returnDeposit.tenants?.properties?.name}
                {returnDeposit.tenants?.unit_number ? ` · Unit ${returnDeposit.tenants.unit_number}` : ""}
              </div>
              <div className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: "0.25rem" }}>
                Deposit: KES {returnDeposit.amount.toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleReturn}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Action *</label>
                <select
                  value={returnStatus}
                  onChange={(e) => handleReturnStatusChange(e.target.value as "returned" | "partially_refunded" | "forfeited")}
                  style={inputStyle}
                >
                  <option value="returned">Full Return</option>
                  <option value="partially_refunded">Partial Refund</option>
                  <option value="forfeited">Forfeit</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Amount Returned (KES)</label>
                  <input
                    type="number"
                    min={0}
                    max={returnDeposit.amount}
                    value={returnAmount}
                    onChange={(e) => handleReturnAmountChange(e.target.value)}
                    disabled={returnStatus === "forfeited"}
                    style={{ ...inputStyle, opacity: returnStatus === "forfeited" ? 0.5 : 1 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Deductions (KES)</label>
                  <input
                    type="number"
                    min={0}
                    value={returnDeductions}
                    readOnly
                    style={{ ...inputStyle, background: "#f5f5f3" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>
                  Reason {returnStatus !== "returned" ? "*" : ""}
                </label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required={returnStatus !== "returned"}
                  placeholder={
                    returnStatus === "forfeited"
                      ? "e.g. Property damage, lease violation..."
                      : returnStatus === "partially_refunded"
                      ? "e.g. Deducted for repairs, cleaning..."
                      : "Optional notes"
                  }
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div className="flex justify-end" style={{ gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setReturnDeposit(null)}
                  style={{ ...btnStyle, background: "var(--warm)", color: "var(--ink)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center"
                  style={{
                    ...btnStyle,
                    background: returnStatus === "forfeited" ? "var(--rust)" : "var(--green)",
                    color: "var(--white)",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Processing..." : returnStatus === "forfeited" ? "Forfeit Deposit" : "Process Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDeposit && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setViewDeposit(null)}
        >
          <div
            style={{
              background: "var(--white)", borderRadius: "8px", padding: "1.5rem",
              width: "calc(100% - 2rem)", maxWidth: "420px", margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: "1rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Deposit Details</h3>
              <button onClick={() => setViewDeposit(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Tenant</span>
                <span style={{ fontWeight: 500 }}>{viewDeposit.tenants?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Property</span>
                <span>{viewDeposit.tenants?.properties?.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Original Amount</span>
                <span className="font-serif" style={{ fontWeight: 600 }}>KES {viewDeposit.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Deposit Date</span>
                <span>{new Date(viewDeposit.deposit_date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid var(--warm)" }} />
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Status</span>
                <span style={{ color: statusColors[viewDeposit.status]?.color, fontWeight: 600 }}>
                  {statusColors[viewDeposit.status]?.label}
                </span>
              </div>
              {viewDeposit.return_date && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Return Date</span>
                  <span>{new Date(viewDeposit.return_date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              )}
              {viewDeposit.amount_returned != null && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Amount Returned</span>
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>KES {viewDeposit.amount_returned.toLocaleString()}</span>
                </div>
              )}
              {(viewDeposit.deductions || 0) > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Deductions</span>
                  <span style={{ color: "var(--rust)", fontWeight: 600 }}>KES {(viewDeposit.deductions || 0).toLocaleString()}</span>
                </div>
              )}
              {viewDeposit.return_reason && (
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>Reason</span>
                  <div style={{ marginTop: "0.25rem", padding: "0.5rem 0.75rem", background: "var(--cream)", borderRadius: "4px", fontSize: "0.8rem" }}>
                    {viewDeposit.return_reason}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end" style={{ marginTop: "1.25rem" }}>
              <button
                onClick={() => setViewDeposit(null)}
                style={{ ...btnStyle, background: "var(--warm)", color: "var(--ink)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDeposit && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setEditDeposit(null)}
        >
          <div
            style={{
              background: "var(--white)", borderRadius: "8px", padding: "1.5rem",
              width: "calc(100% - 2rem)", maxWidth: "420px", margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: "1rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Edit Deposit</h3>
              <button onClick={() => setEditDeposit(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Amount (KES)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Deposit Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="flex justify-end" style={{ gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setEditDeposit(null)}
                  style={{ ...btnStyle, background: "var(--warm)", color: "var(--ink)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center"
                  style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
