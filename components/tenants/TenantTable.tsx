"use client";

import { useState } from "react";
import { Send, Users } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

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
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[2rem] font-light text-ink">Tenants</h1>
          <p className="mt-0.5 text-[0.8rem] text-muted">
            View all tenants across your properties
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded border border-warm bg-white px-5 py-2.5 font-sans text-[0.8rem] text-ink outline-none cursor-pointer transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20"
        >
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Summary stats */}
      <div className="mb-6 flex gap-6">
        <div className="card flex-1 py-4 px-6">
          <span className="label-upper">Total</span>
          <div className="font-serif text-2xl font-semibold">{totalCount}</div>
        </div>
        <div className="card flex-1 py-4 px-6">
          <span className="label-upper text-green">Active</span>
          <div className="font-serif text-2xl font-semibold text-green">{activeCount}</div>
        </div>
        <div className="card flex-1 py-4 px-6">
          <span className="label-upper text-red-soft">Inactive</span>
          <div className="font-serif text-2xl font-semibold text-red-soft">{inactiveCount}</div>
        </div>
      </div>

      {/* Tenant list */}
      <div className="overflow-hidden rounded-lg border border-gold/8 bg-white">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No tenants found" />
        ) : (
          <div>
            {filtered.map((tenant, i) => {
              const initials = getInitials(tenant.full_name);
              const color = avatarColors[i % avatarColors.length];

              return (
                <div
                  key={tenant.id}
                  className={`tenant-row row-hover grid items-center gap-4 px-6 py-4 transition-colors ${
                    i < filtered.length - 1 ? "border-b border-warm" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold text-white"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>

                  {/* Name + property */}
                  <div>
                    <h4 className="mb-0.5 text-[0.85rem] font-medium">{tenant.full_name}</h4>
                    <span className="text-[0.7rem] text-muted">
                      {tenant.properties?.name}
                      {tenant.unit_number ? ` · Unit ${tenant.unit_number}` : ""}
                    </span>
                  </div>

                  {/* Rent */}
                  <div className="text-right">
                    <span className="font-serif text-[0.95rem] font-semibold">
                      KES {Number(tenant.rent_amount).toLocaleString()}
                    </span>
                    <small className="block label-upper text-[0.6rem]">/month</small>
                  </div>

                  {/* Phone */}
                  <span className="min-w-[100px] text-[0.75rem] text-muted">
                    {tenant.phone || "—"}
                  </span>

                  {/* Status + Portal */}
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={tenant.status === "active" ? "active" : tenant.status === "moved" ? "moved" : "inactive"}
                    />
                    {tenant.user_id ? (
                      <StatusBadge status="completed" label="Portal" />
                    ) : tenant.status === "active" ? (
                      <div className="flex items-center gap-1">
                        {inviteMsg?.id === tenant.id && (
                          <span className={`text-[0.65rem] ${inviteMsg.ok ? "text-green" : "text-red-soft"}`}>
                            {inviteMsg.msg}
                          </span>
                        )}
                        <input
                          type="email"
                          placeholder={tenant.email || "Email"}
                          value={inviting === tenant.id ? inviteEmail : (inviteEmail && inviteMsg?.id === tenant.id ? inviteEmail : "")}
                          onChange={(e) => { setInviteEmail(e.target.value); setInviteMsg(null); }}
                          onFocus={() => { if (tenant.email && !inviteEmail) setInviteEmail(tenant.email); }}
                          className="w-[140px] rounded border border-warm bg-cream px-2 py-1 font-sans text-[0.7rem] outline-none focus:border-gold/30"
                        />
                        <button
                          onClick={() => handleInvite(tenant.id)}
                          disabled={inviting === tenant.id}
                          title="Invite to Tenant Portal"
                          className="flex items-center gap-0.5 rounded bg-ink px-2 py-1 text-[0.65rem] text-cream border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
    </>
  );
}
