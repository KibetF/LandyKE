"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Wrench, AlertTriangle, CheckCircle, Clock, Plus, X } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

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

const selectClasses = "rounded border border-warm bg-white px-5 py-2.5 font-sans text-[0.8rem] text-ink outline-none cursor-pointer transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20";
const inputClasses = "w-full rounded-md border border-warm bg-white px-3.5 py-2.5 font-sans text-[0.85rem] text-ink outline-none transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20";

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

  const kpis = [
    { label: "Open Requests", value: openCount, colorClass: "text-rust", Icon: AlertTriangle },
    { label: "In Progress", value: inProgressCount, colorClass: "text-[#1a5296]", Icon: Clock },
    { label: "Completed", value: completedCount, colorClass: "text-green", Icon: CheckCircle },
    { label: "Total Requests", value: requests.length, colorClass: "text-muted", Icon: Wrench },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[2rem] font-light text-ink">Maintenance</h1>
          <p className="mt-0.5 text-[0.8rem] text-muted">
            Track and manage maintenance requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded bg-ink px-5 py-2.5 text-[0.8rem] font-sans text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <Plus size={14} />
          New Request
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-[1.1rem] font-semibold">New Maintenance Request</h3>
            <button
              onClick={() => setShowForm(false)}
              aria-label="Close form"
              className="border-none bg-transparent cursor-pointer"
            >
              <X size={18} className="text-muted" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-upper mb-1.5 block font-medium">Property *</label>
                <select value={formPropertyId} onChange={(e) => setFormPropertyId(e.target.value)} className={`${inputClasses} cursor-pointer`} required>
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-upper mb-1.5 block font-medium">Tenant (optional)</label>
                <select value={formTenantId} onChange={(e) => setFormTenantId(e.target.value)} className={`${inputClasses} cursor-pointer`}>
                  <option value="">Select tenant</option>
                  {filteredTenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-upper mb-1.5 block font-medium">Unit Number (optional)</label>
                <input type="text" value={formUnitNumber} onChange={(e) => setFormUnitNumber(e.target.value)} placeholder="e.g., 3" className={inputClasses} />
              </div>
              <div>
                <label className="label-upper mb-1.5 block font-medium">Priority *</label>
                <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} className={`${inputClasses} cursor-pointer`} required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-upper mb-1.5 block font-medium">Description *</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the maintenance issue..."
                required
                rows={3}
                className={`${inputClasses} resize-y`}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="self-start rounded bg-ink px-6 py-2.5 text-[0.8rem] font-sans text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)} className={selectClasses}>
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClasses}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={selectClasses}>
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 maintenance-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card py-4 px-5">
            <div className="mb-2 flex items-center gap-2">
              <kpi.Icon size={14} className={kpi.colorClass} />
              <span className={`label-upper ${kpi.colorClass}`}>{kpi.label}</span>
            </div>
            <div className={`font-serif text-xl font-semibold ${kpi.colorClass}`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Request list */}
      <div className="overflow-hidden rounded-lg border border-gold/8 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No maintenance requests found"
            description="No requests match the selected filters."
          />
        ) : (
          <div>
            {filtered.map((request, i) => (
              <div
                key={request.id}
                className={`row-hover grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-6 py-4 transition-colors ${
                  i < filtered.length - 1 ? "border-b border-warm" : ""
                }`}
              >
                <div
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-full ${
                    request.priority === "urgent" || request.priority === "high"
                      ? "bg-red-light"
                      : "bg-warm"
                  }`}
                >
                  <Wrench
                    size={16}
                    className={
                      request.priority === "urgent" ? "text-red-soft" : "text-muted"
                    }
                  />
                </div>

                <div>
                  <h4 className="mb-0.5 text-[0.85rem] font-medium">
                    {request.description}
                  </h4>
                  <span className="text-[0.7rem] text-muted">
                    {request.tenants?.full_name || "—"} · {request.properties?.name}{request.unit_number ? ` · Unit ${request.unit_number}` : ""}
                  </span>
                </div>

                <StatusBadge status={request.priority} />
                <StatusBadge status={request.status} />

                <span className="min-w-[80px] text-[0.72rem] text-muted">
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
