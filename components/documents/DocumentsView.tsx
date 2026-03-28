"use client";

import { useState, useMemo } from "react";
import { FileText, Receipt, File, Scale, BarChart3 } from "lucide-react";
import type { Document } from "@/types";

const mockDocuments: Document[] = [
  { id: "1", name: "Lease Agreement — Unit 3", type: "lease", property_name: "Plot A — Langas", property_id: "p1", date_uploaded: "2026-01-15", file_size: "245 KB" },
  { id: "2", name: "January 2026 Invoice", type: "invoice", property_name: "Kapsoya Block", property_id: "p2", date_uploaded: "2026-01-31", file_size: "89 KB" },
  { id: "3", name: "Rent Receipt — Feb 2026", type: "receipt", property_name: "Plot A — Langas", property_id: "p1", date_uploaded: "2026-02-05", file_size: "42 KB" },
  { id: "4", name: "Q4 2025 Financial Report", type: "report", property_name: "All Properties", property_id: "all", date_uploaded: "2026-01-10", file_size: "1.2 MB" },
  { id: "5", name: "Tenancy Agreement — Unit 7", type: "lease", property_name: "Plot B — Pioneer", property_id: "p3", date_uploaded: "2025-11-20", file_size: "312 KB" },
  { id: "6", name: "Property Insurance Certificate", type: "legal", property_name: "Plot A — Langas", property_id: "p1", date_uploaded: "2025-12-01", file_size: "520 KB" },
  { id: "7", name: "February 2026 Invoice", type: "invoice", property_name: "Plot A — Langas", property_id: "p1", date_uploaded: "2026-02-28", file_size: "91 KB" },
  { id: "8", name: "Maintenance Receipt — Plumbing", type: "receipt", property_name: "Annex — Huruma", property_id: "p4", date_uploaded: "2026-03-10", file_size: "38 KB" },
  { id: "9", name: "Annual Property Report 2025", type: "report", property_name: "All Properties", property_id: "all", date_uploaded: "2026-01-05", file_size: "2.4 MB" },
  { id: "10", name: "NEMA Compliance Certificate", type: "legal", property_name: "Kapsoya Block", property_id: "p2", date_uploaded: "2025-10-15", file_size: "180 KB" },
];

const properties = [
  { id: "p1", name: "Plot A — Langas" },
  { id: "p2", name: "Kapsoya Block" },
  { id: "p3", name: "Plot B — Pioneer" },
  { id: "p4", name: "Annex — Huruma" },
];

function getTypeIcon(type: Document["type"]) {
  switch (type) {
    case "lease": return FileText;
    case "invoice": return File;
    case "receipt": return Receipt;
    case "report": return BarChart3;
    case "legal": return Scale;
  }
}

const typeColors: Record<Document["type"], { bg: string; color: string }> = {
  lease: { bg: "#e8f0fd", color: "#1a5296" },
  invoice: { bg: "var(--amber-light)", color: "#7a5c00" },
  receipt: { bg: "var(--green-light)", color: "var(--green)" },
  report: { bg: "#f3e8fd", color: "#6b3d8a" },
  legal: { bg: "var(--red-light)", color: "var(--red-soft)" },
};

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

export default function DocumentsView() {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return mockDocuments.filter((d) => {
      if (propertyFilter !== "all" && d.property_id !== propertyFilter) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      return true;
    });
  }, [propertyFilter, typeFilter]);

  const leaseCount = mockDocuments.filter((d) => d.type === "lease").length;
  const invoiceCount = mockDocuments.filter((d) => d.type === "invoice").length;
  const receiptCount = mockDocuments.filter((d) => d.type === "receipt").length;
  const reportCount = mockDocuments.filter((d) => d.type === "report").length;

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
          Documents
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          Manage leases, invoices, receipts, and reports
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
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Types</option>
          <option value="lease">Leases</option>
          <option value="invoice">Invoices</option>
          <option value="receipt">Receipts</option>
          <option value="report">Reports</option>
          <option value="legal">Legal</option>
        </select>
      </div>

      {/* Summary stats */}
      <div className="documents-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Documents", value: mockDocuments.length, color: "var(--ink)" },
          { label: "Leases", value: leaseCount, color: "#1a5296" },
          { label: "Invoices", value: invoiceCount, color: "#7a5c00" },
          { label: "Receipts & Reports", value: receiptCount + reportCount, color: "var(--green)" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--white)",
              borderRadius: "8px",
              border: "1px solid rgba(200,150,62,0.08)",
              padding: "1rem 1.2rem",
            }}
          >
            <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
              {stat.label}
            </span>
            <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Document list */}
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
            No documents found for the selected filters.
          </div>
        ) : (
          <div>
            {filtered.map((doc, i) => {
              const Icon = getTypeIcon(doc.type);
              const colors = typeColors[doc.type];
              return (
                <div
                  key={doc.id}
                  className="items-center row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto auto",
                    gap: "1rem",
                    padding: "1rem 1.5rem",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--warm)" : "none",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: colors.bg,
                    }}
                  >
                    <Icon size={16} style={{ color: colors.color }} />
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                      {doc.name}
                    </h4>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {doc.property_name}
                    </span>
                  </div>

                  <span
                    className="status-pill"
                    style={{
                      background: colors.bg,
                      color: colors.color,
                    }}
                  >
                    {doc.type}
                  </span>

                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", minWidth: "80px" }}>
                    {new Date(doc.date_uploaded).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>

                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", minWidth: "60px", textAlign: "right" }}>
                    {doc.file_size}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
