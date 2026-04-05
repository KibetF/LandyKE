"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

interface MaintenanceItem {
  id: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "completed";
  date_submitted: string;
  date_resolved: string | null;
  notes: string | null;
}

interface Props {
  tenantId: string;
  propertyId: string;
  unitNumber: string | null;
  requests: MaintenanceItem[];
}

export default function TenantMaintenance({ tenantId, propertyId, unitNumber, requests }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/tenant/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        propertyId,
        unitNumber,
        description: description.trim(),
        priority,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit request");
      setSubmitting(false);
      return;
    }

    setDescription("");
    setPriority("medium");
    setShowForm(false);
    setSubmitting(false);
    router.refresh();
  }, [description, priority, tenantId, propertyId, unitNumber, router]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-normal tracking-tight">
            Maintenance
          </h1>
          <p className="mt-0.5 text-[0.78rem] text-muted">
            Report issues and track your requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded bg-ink px-5 py-2.5 text-[0.78rem] font-medium tracking-[0.05em] text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <Plus size={16} />
          Report a Problem
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <div className="card mb-6 border-gold/15">
          <h3 className="mb-4 font-serif text-base font-medium">
            New Maintenance Request
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="label-upper mb-1.5 block">
                Describe the issue
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full resize-y rounded border border-warm bg-cream px-4 py-3 font-sans text-[0.85rem] text-ink outline-none transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20"
                placeholder="e.g., The kitchen sink is leaking under the counter..."
              />
            </div>

            <div className="mb-5">
              <label className="label-upper mb-1.5 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full rounded border border-warm bg-cream px-4 py-3 font-sans text-[0.85rem] text-ink outline-none transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20"
              >
                <option value="low">Low — not urgent</option>
                <option value="medium">Medium — needs attention soon</option>
                <option value="high">High — affecting daily life</option>
                <option value="urgent">Urgent — emergency (e.g., flooding, no water)</option>
              </select>
            </div>

            {error && (
              <div className="mb-4 rounded bg-red-light px-4 py-3 text-[0.8rem] text-red-soft">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-ink px-6 py-2.5 text-[0.78rem] font-medium text-cream border-none cursor-pointer transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded border border-warm bg-transparent px-6 py-2.5 text-[0.78rem] text-muted cursor-pointer transition-colors hover:bg-warm/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests list */}
      <div className="card">
        <h3 className="mb-4 font-serif text-[1.1rem] font-medium">
          My Requests
        </h3>

        {requests.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No maintenance requests yet"
            description='Click "Report a Problem" to submit one.'
          />
        ) : (
          <div>
            {requests.map((r, i) => {
              const isExpanded = expanded === r.id;

              return (
                <div
                  key={r.id}
                  className={`py-3.5 ${i < requests.length - 1 ? "border-b border-warm" : ""}`}
                >
                  <button
                    className="flex w-full cursor-pointer flex-wrap items-center gap-3 border-none bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                    aria-expanded={isExpanded}
                    aria-label={`Toggle details for: ${r.description.slice(0, 50)}`}
                  >
                    <div className="min-w-[150px] flex-1">
                      <p className="mb-0.5 text-[0.82rem] font-medium">
                        {r.description.length > 80 ? r.description.slice(0, 80) + "..." : r.description}
                      </p>
                      <p className="text-[0.7rem] text-muted">
                        Submitted {new Date(r.date_submitted).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <StatusBadge status={r.priority} />
                    <StatusBadge status={r.status} />
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-muted" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pl-2 text-[0.8rem] text-ink">
                      <p className="mb-2">{r.description}</p>
                      {r.date_resolved && (
                        <p className="text-[0.7rem] text-green">
                          Resolved on {new Date(r.date_resolved).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {r.notes && (
                        <div className="mt-2 rounded bg-cream p-3 text-[0.78rem]">
                          <strong className="label-upper">Notes:</strong>
                          <p className="mt-1">{r.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
