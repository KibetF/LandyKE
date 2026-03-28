"use client";

import { useState, useMemo } from "react";
import { Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";
import type { MaintenanceRequest } from "@/types";

const mockRequests: MaintenanceRequest[] = [
  { id: "1", property_id: "p1", unit_number: "3", tenant_name: "James Waweru", property_name: "Plot A — Langas", description: "Leaking kitchen faucet, water pooling on floor", priority: "high", status: "open", date_submitted: "2026-03-18" },
  { id: "2", property_id: "p2", unit_number: "2", tenant_name: "Grace Akinyi", property_name: "Kapsoya Block", description: "Bathroom door handle broken, won't lock", priority: "medium", status: "in-progress", date_submitted: "2026-03-15" },
  { id: "3", property_id: "p1", unit_number: "1", tenant_name: "Faith Kiprotich", property_name: "Plot A — Langas", description: "Power outlet in bedroom not working", priority: "high", status: "open", date_submitted: "2026-03-17" },
  { id: "4", property_id: "p3", unit_number: "7", tenant_name: "Daniel Otieno", property_name: "Plot B — Pioneer", description: "Window glass cracked from storm damage", priority: "urgent", status: "open", date_submitted: "2026-03-19" },
  { id: "5", property_id: "p4", unit_number: "1", tenant_name: "Samuel Mutua", property_name: "Annex — Huruma", description: "Ceiling paint peeling in living room", priority: "low", status: "completed", date_submitted: "2026-03-05" },
  { id: "6", property_id: "p2", unit_number: "4", tenant_name: "Ruth Njeri", property_name: "Kapsoya Block", description: "Blocked kitchen sink drain", priority: "medium", status: "completed", date_submitted: "2026-03-08" },
  { id: "7", property_id: "p1", unit_number: "5", tenant_name: "Peter Kamau", property_name: "Plot A — Langas", description: "Main door lock is jammed", priority: "high", status: "in-progress", date_submitted: "2026-03-14" },
  { id: "8", property_id: "p3", unit_number: "2", tenant_name: "Mary Wanjiku", property_name: "Plot B — Pioneer", description: "Hot water heater not working", priority: "urgent", status: "in-progress", date_submitted: "2026-03-16" },
  { id: "9", property_id: "p4", unit_number: "2", tenant_name: "Joseph Kipchoge", property_name: "Annex — Huruma", description: "Toilet running continuously", priority: "medium", status: "open", date_submitted: "2026-03-19" },
  { id: "10", property_id: "p1", unit_number: "6", tenant_name: "Anne Chebet", property_name: "Plot A — Langas", description: "Broken curtain rail in master bedroom", priority: "low", status: "completed", date_submitted: "2026-03-02" },
  { id: "11", property_id: "p2", unit_number: "1", tenant_name: "David Maina", property_name: "Kapsoya Block", description: "Wall crack near window expanding", priority: "high", status: "open", date_submitted: "2026-03-20" },
  { id: "12", property_id: "p3", unit_number: "5", tenant_name: "Lucy Achieng", property_name: "Plot B — Pioneer", description: "Gate padlock replacement needed", priority: "low", status: "completed", date_submitted: "2026-03-01" },
];

const properties = [
  { id: "p1", name: "Plot A — Langas" },
  { id: "p2", name: "Kapsoya Block" },
  { id: "p3", name: "Plot B — Pioneer" },
  { id: "p4", name: "Annex — Huruma" },
];

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

export default function MaintenanceView() {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = useMemo(() => {
    return mockRequests.filter((r) => {
      if (propertyFilter !== "all" && r.property_id !== propertyFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      return true;
    });
  }, [propertyFilter, statusFilter, priorityFilter]);

  const openCount = mockRequests.filter((r) => r.status === "open").length;
  const inProgressCount = mockRequests.filter((r) => r.status === "in-progress").length;
  const completedCount = mockRequests.filter((r) => r.status === "completed").length;

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
          Maintenance
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          Track and manage maintenance requests
        </p>
      </div>

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
          { label: "Completed This Month", value: completedCount, color: "var(--green)", Icon: CheckCircle },
          { label: "Avg Resolution Time", value: "3.2 days", color: "var(--muted)", Icon: Wrench },
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
                    {request.tenant_name} · {request.property_name} · Unit {request.unit_number}
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
