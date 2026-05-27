"use client";

import { useState } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";
import Pagination from "@/components/ui/Pagination";
import { normalizePhone } from "@/lib/sms/phone";

interface TenantData {
  id: string;
  property_id: string;
  unit_number: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  rent_amount: number;
  status: string;
  user_id: string | null;
  properties: { name: string; location: string | null };
}

interface TenantTableProps {
  tenants: TenantData[];
  properties: Array<{ id: string; name: string }>;
  currentPage?: number;
  totalPages?: number;
}

const avatarColors = [
  "#4a5c4e",
  "#8b3a2a",
  "#c8963e",
  "#2d6a4f",
  "#6b3d8a",
  "#3d6b8a",
  "#8a6b3d",
  "#5c4a6b",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TenantTable({ tenants, properties, currentPage = 1, totalPages = 1 }: TenantTableProps) {
  const [filter, setFilter] = useState("all");
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  // WhatsApp modal state
  const [waTarget, setWaTarget] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [waBody, setWaBody] = useState("");
  const [waSending, setWaSending] = useState(false);
  const [waMsg, setWaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function openWhatsApp(tenant: TenantData) {
    if (!tenant.phone) return;
    setWaTarget({ id: tenant.id, name: tenant.full_name, phone: tenant.phone });
    setWaBody("");
    setWaMsg(null);
  }

  function closeWhatsApp() {
    setWaTarget(null);
    setWaBody("");
    setWaMsg(null);
    setWaSending(false);
  }

  async function sendWhatsAppToTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!waTarget || !waBody.trim()) return;
    setWaSending(true);
    setWaMsg(null);
    try {
      const res = await fetch("/api/twilio/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: waTarget.phone, body: waBody }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWaMsg({ type: "error", text: data.error || "Failed to send" });
      } else {
        setWaMsg({ type: "success", text: `Sent to ${data.to || waTarget.phone}` });
        setWaBody("");
        setTimeout(() => closeWhatsApp(), 1500);
      }
    } catch {
      setWaMsg({ type: "error", text: "Network error" });
    }
    setWaSending(false);
  }

  async function handleInvite(tenantId: string) {
    if (!inviteEmail.trim()) return;
    setInviting(tenantId);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/tenants/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer token" },
        body: JSON.stringify({ tenantId, email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteMsg({ id: tenantId, msg: data.error || "Failed to invite", ok: false });
      } else {
        setInviteMsg({ id: tenantId, msg: "Invite sent!", ok: true });
        setInviteEmail("");
      }
    } catch {
      setInviteMsg({ id: tenantId, msg: "Network error", ok: false });
    }
    setInviting(null);
  }

  const filtered =
    filter === "all"
      ? tenants
      : tenants.filter((t) => t.property_id === filter);

  const totalCount = tenants.length;
  const activeCount = tenants.filter((t) => t.status === "active").length;
  const inactiveCount = totalCount - activeCount;

  return (
    <>
      {/* Header */}
      <div
        className="flex justify-between items-start dashboard-header"
        style={{ marginBottom: "2rem" }}
      >
        <div>
          <h1
            className="font-serif"
            style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}
          >
            Tenants
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              marginTop: "0.2rem",
            }}
          >
            View all tenants across your properties
          </p>
        </div>

        {/* Property filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
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
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary stats */}
      <div
        className="flex"
        style={{
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.5rem",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Total
          </span>
          <div
            className="font-serif"
            style={{ fontSize: "1.5rem", fontWeight: 600 }}
          >
            {totalCount}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.5rem",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--green)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Active
          </span>
          <div
            className="font-serif"
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--green)" }}
          >
            {activeCount}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.5rem",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--red-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Inactive
          </span>
          <div
            className="font-serif"
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--red-soft)",
            }}
          >
            {inactiveCount}
          </div>
        </div>
      </div>

      {/* Tenant list */}
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
            No tenants found.
          </div>
        ) : (
          <div>
            {filtered.map((tenant, i) => {
              const initials = getInitials(tenant.full_name);
              const color = avatarColors[i % avatarColors.length];

              return (
                <div
                  key={tenant.id}
                  className="tenant-row items-center row-hover"
                  style={{
                    display: "grid",
                    gap: "1rem",
                    padding: "1rem 1.5rem",
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--warm)"
                        : "none",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: color,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--white)",
                    }}
                  >
                    {initials}
                  </div>

                  {/* Name + property */}
                  <div>
                    <h4
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: "0.15rem",
                      }}
                    >
                      {tenant.full_name}
                    </h4>
                    <span
                      style={{ fontSize: "0.7rem", color: "var(--muted)" }}
                    >
                      {tenant.properties?.name}
                      {tenant.unit_number ? ` · Unit ${tenant.unit_number}` : ""}
                    </span>
                  </div>

                  {/* Rent */}
                  <div className="text-right">
                    <span
                      className="font-serif"
                      style={{ fontSize: "0.95rem", fontWeight: 600 }}
                    >
                      KES {Number(tenant.rent_amount).toLocaleString()}
                    </span>
                    <small
                      className="block"
                      style={{
                        fontSize: "0.6rem",
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      /month
                    </small>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center" style={{ minWidth: "100px", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {tenant.phone || "—"}
                    </span>
                    {tenant.phone && (
                      <button
                        onClick={() => openWhatsApp(tenant)}
                        title={`Send WhatsApp to ${tenant.full_name}`}
                        style={{
                          background: "#25D366",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "3px",
                          padding: "0.3rem 0.4rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MessageCircle size={11} />
                      </button>
                    )}
                  </div>

                  {/* Status + Portal */}
                  <div className="flex items-center" style={{ gap: "0.5rem" }}>
                    <StatusPill
                      status={tenant.status === "active" ? "active" : tenant.status === "moved" ? "moved" : "inactive"}
                    />
                    {tenant.user_id ? (
                      <span
                        className="status-pill"
                        style={{
                          background: "var(--green-light)",
                          color: "var(--green)",
                        }}
                      >
                        Portal
                      </span>
                    ) : tenant.status === "active" ? (
                      <div className="flex items-center" style={{ gap: "0.3rem" }}>
                        {inviteMsg?.id === tenant.id && (
                          <span style={{ fontSize: "0.65rem", color: inviteMsg.ok ? "var(--green)" : "var(--red-soft)" }}>
                            {inviteMsg.msg}
                          </span>
                        )}
                        <input
                          type="email"
                          placeholder={tenant.email || "Email"}
                          value={inviting === tenant.id ? inviteEmail : (inviteEmail && inviteMsg?.id === tenant.id ? inviteEmail : "")}
                          onChange={(e) => { setInviteEmail(e.target.value); setInviteMsg(null); }}
                          onFocus={() => { if (tenant.email && !inviteEmail) setInviteEmail(tenant.email); }}
                          style={{
                            width: "140px",
                            padding: "0.3rem 0.5rem",
                            fontSize: "0.7rem",
                            border: "1px solid var(--warm)",
                            borderRadius: "3px",
                            outline: "none",
                            background: "var(--cream)",
                            fontFamily: "var(--font-sans), sans-serif",
                          }}
                        />
                        <button
                          onClick={() => handleInvite(tenant.id)}
                          disabled={inviting === tenant.id}
                          title="Invite to Tenant Portal"
                          style={{
                            background: "var(--ink)",
                            color: "var(--cream)",
                            border: "none",
                            borderRadius: "3px",
                            padding: "0.3rem 0.5rem",
                            cursor: inviting === tenant.id ? "not-allowed" : "pointer",
                            opacity: inviting === tenant.id ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem",
                            fontSize: "0.65rem",
                          }}
                        >
                          <Send size={11} />
                          Invite
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />

      {/* === WHATSAPP MODAL === */}
      {waTarget && (
        <div
          onClick={closeWhatsApp}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--white)",
              borderRadius: "8px",
              padding: "1.5rem",
              width: "calc(100% - 2rem)",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              margin: "1rem",
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: "1rem" }}>
              <div className="flex items-center" style={{ gap: "0.5rem" }}>
                <MessageCircle size={18} style={{ color: "#25D366" }} />
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  Send WhatsApp to {waTarget.name}
                </h3>
              </div>
              <button onClick={closeWhatsApp} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} style={{ color: "var(--muted)" }} />
              </button>
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
              To: <span style={{ color: "var(--ink)", fontFamily: "monospace" }}>{normalizePhone(waTarget.phone)}</span>
            </div>

            <form onSubmit={sendWhatsAppToTenant}>
              {waMsg && (
                <div
                  className="flex items-center"
                  style={{
                    gap: "0.5rem",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "4px",
                    marginBottom: "1rem",
                    fontSize: "0.75rem",
                    background: waMsg.type === "success" ? "var(--green-light)" : "var(--red-light)",
                    color: waMsg.type === "success" ? "var(--green)" : "var(--red-soft)",
                  }}
                >
                  {waMsg.text}
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <textarea
                  required
                  value={waBody}
                  onChange={(e) => setWaBody(e.target.value)}
                  rows={5}
                  maxLength={1600}
                  placeholder={`Hi ${waTarget.name.split(" ")[0]}, ...`}
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    border: "1px solid var(--warm)",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans), sans-serif",
                    color: "var(--ink)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.3rem", textAlign: "right" }}>
                  {waBody.length}/1600
                </div>
              </div>

              <div className="flex" style={{ gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={closeWhatsApp}
                  style={{
                    flex: 1,
                    background: "var(--cream)",
                    color: "var(--ink)",
                    border: "1px solid var(--warm)",
                    padding: "0.7rem",
                    fontSize: "0.85rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans), sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={waSending || !waBody.trim()}
                  className="flex items-center justify-center"
                  style={{
                    flex: 1,
                    gap: "0.4rem",
                    background: "#25D366",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.7rem",
                    fontSize: "0.85rem",
                    borderRadius: "4px",
                    cursor: (waSending || !waBody.trim()) ? "not-allowed" : "pointer",
                    opacity: (waSending || !waBody.trim()) ? 0.6 : 1,
                    fontFamily: "var(--font-sans), sans-serif",
                    fontWeight: 500,
                  }}
                >
                  <Send size={14} />
                  {waSending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
