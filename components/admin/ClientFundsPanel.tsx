"use client";

import { useState } from "react";
import { useClientFunds } from "@/hooks/useAdminData";
import type { ClientFund } from "@/components/admin/types";

// Non-rent money held for a client (e.g. a lump sum to be placed in a fixed
// deposit). Kept out of rent totals; shown on the client's monthly statement
// in its own section.

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  border: "1px solid var(--warm)",
  borderRadius: "4px",
  fontSize: "0.8rem",
  fontFamily: "var(--font-sans), sans-serif",
  color: "var(--ink)",
  background: "var(--white)",
} as const;

const labelStyle = {
  display: "block" as const,
  fontSize: "0.65rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--muted)",
  marginBottom: "0.3rem",
  fontWeight: 500,
};

const primaryBtn = {
  fontSize: "0.75rem",
  padding: "0.4rem 0.8rem",
  background: "var(--ink)",
  color: "var(--cream)",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
} as const;

const ghostBtn = {
  fontSize: "0.75rem",
  padding: "0.4rem 0.8rem",
  background: "transparent",
  border: "1px solid var(--warm)",
  borderRadius: "4px",
  cursor: "pointer",
} as const;

const linkBtn = {
  fontSize: "0.7rem",
  color: "var(--gold)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
} as const;

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

export default function ClientFundsPanel({ landlordId }: { landlordId: string }) {
  const { funds, revalidateFunds } = useClientFunds(landlordId);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ amount: "", received_date: today(), purpose: "Fixed deposit", notes: "" });
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendForm, setSendForm] = useState({ sent_date: today(), sent_to: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(method: string, body?: unknown, query = "") {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/client-funds${query}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      await revalidateFunds();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addFund() {
    if (await call("POST", { landlord_id: landlordId, ...form })) {
      setAdding(false);
      setForm({ amount: "", received_date: today(), purpose: "Fixed deposit", notes: "" });
    }
  }

  async function markSent(f: ClientFund) {
    if (await call("PATCH", { id: f.id, status: "sent", ...sendForm })) setSendingId(null);
  }

  return (
    <div style={{ marginTop: "0.4rem" }}>
      {funds.map((f) => (
        <div key={f.id} style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.25rem" }}>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>
            {f.purpose}: KES {Number(f.amount).toLocaleString()}
          </span>
          {" · received "}{fmt(f.received_date)}
          {f.status === "sent"
            ? ` · sent${f.sent_to ? ` to ${f.sent_to}` : ""} on ${fmt(f.sent_date!)}`
            : " · held"}
          <span style={{ marginLeft: "0.6rem", display: "inline-flex", gap: "0.6rem" }}>
            {f.status === "held" ? (
              <button type="button" style={linkBtn} onClick={() => { setSendingId(f.id); setSendForm({ sent_date: today(), sent_to: "" }); }}>
                Mark sent
              </button>
            ) : (
              <button type="button" style={linkBtn} disabled={saving} onClick={() => call("PATCH", { id: f.id, status: "held" })}>
                Undo sent
              </button>
            )}
            <button
              type="button"
              style={{ ...linkBtn, color: "var(--rust, #a33)" }}
              disabled={saving}
              onClick={() => call("DELETE", undefined, `?id=${f.id}`)}
            >
              Remove
            </button>
          </span>
          {sendingId === f.id && (
            <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "var(--cream)", borderRadius: "6px" }}>
              <div className="flex" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Sent on</label>
                  <input type="date" value={sendForm.sent_date} onChange={(e) => setSendForm((s) => ({ ...s, sent_date: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Sent to (bank / institution)</label>
                  <input value={sendForm.sent_to} onChange={(e) => setSendForm((s) => ({ ...s, sent_to: e.target.value }))} placeholder="e.g. KCB fixed deposit" style={inputStyle} />
                </div>
              </div>
              <div className="flex" style={{ gap: "0.5rem", justifyContent: "flex-end" }}>
                <button type="button" style={ghostBtn} disabled={saving} onClick={() => setSendingId(null)}>Cancel</button>
                <button type="button" style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={() => markSent(f)}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {!adding ? (
        <button type="button" style={{ ...linkBtn, marginTop: "0.3rem" }} onClick={() => setAdding(true)}>
          + Add funds held (non-rent)
        </button>
      ) : (
        <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "var(--cream)", borderRadius: "6px" }}>
          <div className="flex" style={{ gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 120px" }}>
              <label style={labelStyle}>Amount (KES)</label>
              <input type="number" min="1" step="1" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <label style={labelStyle}>Received on</label>
              <input type="date" value={form.received_date} onChange={(e) => setForm((f) => ({ ...f, received_date: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <label style={labelStyle}>Purpose</label>
              <input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={labelStyle}>Notes (internal)</label>
            <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={inputStyle} />
          </div>
          <div className="flex" style={{ gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" style={ghostBtn} disabled={saving} onClick={() => setAdding(false)}>Cancel</button>
            <button type="button" style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={addFund}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
      {error && <div style={{ fontSize: "0.7rem", color: "var(--rust, #a33)", marginTop: "0.3rem" }}>{error}</div>}
    </div>
  );
}
