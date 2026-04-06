"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";

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

const priorityConfig = {
  low: { bg: "var(--green-light)", color: "var(--green)" },
  medium: { bg: "var(--amber-light)", color: "var(--gold)" },
  high: { bg: "var(--red-light)", color: "var(--rust)" },
  urgent: { bg: "var(--red-light)", color: "var(--red-soft)" },
};

const statusConfig = {
  open: { bg: "var(--amber-light)", color: "var(--gold)" },
  "in-progress": { bg: "#e8f0fd", color: "#1a5296" },
  completed: { bg: "var(--green-light)", color: "var(--green)" },
};

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
      <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.02em" }}>
            Maintenance
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            Report issues and track your requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center"
          style={{
            gap: "0.5rem",
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "0.7rem 1.2rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            letterSpacing: "0.05em",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Report a Problem
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.15)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h3 className="font-serif" style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "1rem" }}>
            New Maintenance Request
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                className="block uppercase"
                style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.4rem" }}
              >
                Describe the issue
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.85rem",
                  color: "var(--ink)",
                  outline: "none",
                  background: "var(--cream)",
                  resize: "vertical",
                }}
                placeholder="e.g., The kitchen sink is leaking under the counter..."
              />
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <label
                className="block uppercase"
                style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.4rem" }}
              >
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.85rem",
                  color: "var(--ink)",
                  outline: "none",
                  background: "var(--cream)",
                }}
              >
                <option value="low">Low — not urgent</option>
                <option value="medium">Medium — needs attention soon</option>
                <option value="high">High — affecting daily life</option>
                <option value="urgent">Urgent — emergency (e.g., flooding, no water)</option>
              </select>
            </div>

            {error && (
              <div style={{ background: "var(--red-light)", color: "var(--red-soft)", padding: "0.75rem 1rem", borderRadius: "4px", fontSize: "0.8rem", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <div className="flex" style={{ gap: "0.75rem" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "var(--ink)",
                  color: "var(--cream)",
                  padding: "0.7rem 1.5rem",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  border: "none",
                  borderRadius: "4px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "transparent",
                  color: "var(--muted)",
                  padding: "0.7rem 1.5rem",
                  fontSize: "0.78rem",
                  border: "1px solid var(--warm)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests list */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          padding: "1.5rem",
        }}
      >
        <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "1rem" }}>
          My Requests
        </h3>

        {requests.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            No maintenance requests yet. Click &ldquo;Report a Problem&rdquo; to submit one.
          </p>
        ) : (
          <div>
            {requests.map((r, i) => {
              const pCfg = priorityConfig[r.priority];
              const sCfg = statusConfig[r.status];
              const isExpanded = expanded === r.id;

              return (
                <div
                  key={r.id}
                  style={{
                    padding: "0.9rem 0",
                    borderBottom: i < requests.length - 1 ? "1px solid var(--warm)" : "none",
                  }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: "0.75rem", cursor: "pointer", flexWrap: "wrap" }}
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                  >
                    <div style={{ flex: 1, minWidth: "150px" }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 500, marginBottom: "0.2rem" }}>
                        {r.description.length > 80 ? r.description.slice(0, 80) + "..." : r.description}
                      </p>
                      <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                        Submitted {new Date(r.date_submitted).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="status-pill" style={{ background: pCfg.bg, color: pCfg.color }}>
                      {r.priority}
                    </span>
                    <span className="status-pill" style={{ background: sCfg.bg, color: sCfg.color }}>
                      {r.status}
                    </span>
                    {isExpanded ? <ChevronUp size={16} style={{ color: "var(--muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--muted)" }} />}
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: "0.75rem", paddingLeft: "0.5rem", fontSize: "0.8rem", color: "var(--ink)" }}>
                      <p style={{ marginBottom: "0.5rem" }}>{r.description}</p>
                      {r.date_resolved && (
                        <p style={{ fontSize: "0.7rem", color: "var(--green)" }}>
                          Resolved on {new Date(r.date_resolved).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {r.notes && (
                        <div style={{ marginTop: "0.5rem", padding: "0.6rem 0.8rem", background: "var(--cream)", borderRadius: "4px", fontSize: "0.78rem" }}>
                          <strong style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Notes:</strong>
                          <p style={{ marginTop: "0.25rem" }}>{r.notes}</p>
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
