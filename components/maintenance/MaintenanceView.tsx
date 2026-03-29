"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Wrench, AlertTriangle, CheckCircle, Clock, Plus, X } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";

interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string | null;
  unit_number: string | null;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "completed";
  date_submitted: string;
  date_resolved: string | null;
  notes: string | null;
  properties: { name: string };
  tenants: { full_name: string } | null;
}

interface MaintenanceViewProps {
  requests: MaintenanceRequest[];
  properties: Array<{ id: string; name: string }>;
  tenants: Array<{ id: string; full_name: string; property_id: string; unit_number: string | null }>;
  landlordId: string;
}

const selectStyle = {
  background: "var(--white)",
  border: "1px solid var(--warm)",
  padding: "0.6rem 1.2rem",
  fontFamily: "var(--font-sans), sans-serif",
  fontSize: "0.8rem",
  color: "var(--ink)",
  borderRadius: "4px",
  cursor: "pointer",
  outline: "none",
} as const;

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--warm)",
  borderRadius: "6px",
  fontSize: "0.85rem",
  fontFamily: "var(--font-sans), sans-serif",
  background: "var(--white)",
  color: "var(--ink)",
  outline: "none",
} as const;

const labelStyle = {
  fontSize: "0.65rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
  fontWeight: 500,
  display: "block",
};

export default function MaintenanceView({ requests, properties, tenants, landlordId }: MaintenanceViewProps) {
  const router = useRouter();
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formPropertyId, setFormPropertyId] = useState("");
  const [formTenantId, setFormTenantId] = useState("");
  const [formUnitNumber, setFormUnitNumber] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState("medium");

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (propertyFilter !== "all" && r.property_id !== propertyFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      return true;
    });
  }, [requests, propertyFilter, statusFilter, priorityFilter]);

  const openCount = requests.filter((r) => r.status === "open").length;
  const inProgressCount = requests.filter((r) => r.status === "in-progress").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;

  const filteredTenants = formPropertyId
    ? tenants.filter((t) => t.property_id === formPropertyId)
    : tenants;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formPropertyId || !formDescription || !formPriority) return;
    setSubmitting(true);

    const selectedTenant = tenants.find((t) => t.id === formTenantId);

    await fetch("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        landlord_id: landlordId,
        property_id: formPropertyId,
        tenant_id: formTenantId || null,
        unit_number: formUnitNumber || selectedTenant?.unit_number || null,
        description: formDescription,
        priority: formPriority,
      }),
    });

    setShowForm(false);
    setFormPropertyId("");
    setFormTenantId("");
    setFormUnitNumber("");
    setFormDescription("");
    setFormPriority("medium");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-between items-start" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
            Maintenance
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            Track and manage maintenance requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center"
          style={{
            gap: "0.4rem",
            background: "var(--ink)",
            color: "var(--cream)",
            border: "none",
            padding: "0.6rem 1.2rem",
            fontSize: "0.8rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "var(--font-sans), sans-serif",
          }}
        >
          <Plus size={14} />
          New Request
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: "1rem" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>New Maintenance Request</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={18} style={{ color: "var(--muted)" }} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Property *</label>
                <select value={formPropertyId} onChange={(e) => setFormPropertyId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} required>
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tenant (optional)</label>
                <select value={formTenantId} onChange={(e) => setFormTenantId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select tenant</option>
                  {filteredTenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Unit Number (optional)</label>
                <input type="text" value={formUnitNumber} onChange={(e) => setFormUnitNumber(e.target.value)} placeholder="e.g., 3" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Priority *</label>
                <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the maintenance issue..."
                required
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                border: "none",
                padding: "0.7rem 1.5rem",
                fontSize: "0.8rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-sans), sans-serif",
                alignSelf: "flex-start",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center" style={{ gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="maintenance-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Open Requests", value: openCount, color: "var(--rust)", Icon: AlertTriangle },
          { label: "In Progress", value: inProgressCount, color: "#1a5296", Icon: Clock },
          { label: "Completed", value: completedCount, color: "var(--green)", Icon: CheckCircle },
          { label: "Total Requests", value: requests.length, color: "var(--muted)", Icon: Wrench },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "var(--white)",
              borderRadius: "8px",
              border: "1px solid rgba(200,150,62,0.08)",
              padding: "1rem 1.2rem",
            }}
          >
            <div className="flex items-center" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <kpi.Icon size={14} style={{ color: kpi.color }} />
              <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: kpi.color }}>
                {kpi.label}
              </span>
            </div>
            <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, color: kpi.color }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Request list */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
            No maintenance requests found for the selected filters.
          </div>
        ) : (
          <div>
            {filtered.map((request, i) => (
              <div
                key={request.id}
                className="items-center row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--warm)" : "none",
                  transition: "background 0.15s",
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: request.priority === "urgent" ? "var(--red-light)" : request.priority === "high" ? "#fde8e8" : "var(--warm)",
                  }}
                >
                  <Wrench size={16} style={{ color: request.priority === "urgent" ? "var(--red-soft)" : "var(--muted)" }} />
                </div>

                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                    {request.description}
                  </h4>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {request.tenants?.full_name || "—"} · {request.properties?.name}{request.unit_number ? ` · Unit ${request.unit_number}` : ""}
                  </span>
                </div>

                <StatusPill status={request.priority} />
                <StatusPill status={request.status} />

                <span style={{ fontSize: "0.72rem", color: "var(--muted)", minWidth: "80px" }}>
                  {new Date(request.date_submitted).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
