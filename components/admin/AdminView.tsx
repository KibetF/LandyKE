"use client";

import { useState } from "react";
import { UserPlus, Users, Check, AlertCircle } from "lucide-react";

interface Landlord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface AdminViewProps {
  landlords: Landlord[];
}

export default function AdminView({ landlords: initialLandlords }: AdminViewProps) {
  const [landlords, setLandlords] = useState(initialLandlords);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/create-landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `${form.full_name} created successfully` });
        setLandlords((prev) => [data.landlord, ...prev]);
        setForm({ full_name: "", email: "", phone: "", password: "" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "0.7rem 1rem",
    border: "1px solid var(--warm)",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontFamily: "var(--font-sans), sans-serif",
    color: "var(--ink)",
    outline: "none",
    background: "var(--white)",
  } as const;

  const labelStyle = {
    display: "block",
    fontSize: "0.7rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "var(--muted)",
    marginBottom: "0.4rem",
    fontWeight: 500,
  };

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="font-serif"
          style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}
        >
          Admin
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          Manage landlord accounts
        </p>
      </div>

      <div
        className="occupancy-grid"
        style={{ marginBottom: "1.5rem" }}
      >
        {/* Create landlord form */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center"
            style={{
              padding: "1.2rem 1.5rem",
              borderBottom: "1px solid var(--warm)",
              gap: "0.5rem",
            }}
          >
            <UserPlus size={18} style={{ color: "var(--gold)" }} />
            <h3
              className="font-serif"
              style={{ fontSize: "1.1rem", fontWeight: 600 }}
            >
              Create Landlord Account
            </h3>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
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

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="e.g. Margaret Wanjiku"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="e.g. margaret@email.com"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +254 712 345 678"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Temporary Password *</label>
              <input
                type="text"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 characters"
                minLength={8}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center"
              style={{
                width: "100%",
                gap: "0.5rem",
                background: loading ? "var(--muted)" : "var(--ink)",
                color: "var(--cream)",
                border: "none",
                padding: "0.75rem",
                fontSize: "0.85rem",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 500,
              }}
            >
              <UserPlus size={16} />
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Existing landlords list */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: "1.2rem 1.5rem",
              borderBottom: "1px solid var(--warm)",
            }}
          >
            <div className="flex items-center" style={{ gap: "0.5rem" }}>
              <Users size={18} style={{ color: "var(--gold)" }} />
              <h3
                className="font-serif"
                style={{ fontSize: "1.1rem", fontWeight: 600 }}
              >
                Landlords
              </h3>
            </div>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--muted)",
                background: "var(--cream)",
                padding: "0.25rem 0.6rem",
                borderRadius: "20px",
              }}
            >
              {landlords.length} total
            </span>
          </div>

          <div>
            {landlords.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ padding: "2rem", color: "var(--muted)" }}
              >
                <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                <span style={{ fontSize: "0.85rem" }}>No landlords yet</span>
              </div>
            ) : (
              landlords.map((l, i) => (
                <div
                  key={l.id}
                  className="row-hover"
                  style={{
                    padding: "1rem 1.5rem",
                    borderBottom: i < landlords.length - 1 ? "1px solid var(--warm)" : "none",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                        {l.full_name}
                      </h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                        {l.email}
                        {l.phone ? ` · ${l.phone}` : ""}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                      {new Date(l.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
