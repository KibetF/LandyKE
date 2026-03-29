"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText, Receipt, File, Scale, BarChart3, Upload, X } from "lucide-react";

interface DocumentData {
  id: string;
  property_id: string | null;
  name: string;
  type: "lease" | "invoice" | "receipt" | "report" | "legal";
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  properties: { name: string } | null;
}

interface DocumentsViewProps {
  documents: DocumentData[];
  properties: Array<{ id: string; name: string }>;
  landlordId: string;
}

function getTypeIcon(type: DocumentData["type"]) {
  switch (type) {
    case "lease": return FileText;
    case "invoice": return File;
    case "receipt": return Receipt;
    case "report": return BarChart3;
    case "legal": return Scale;
  }
}

const typeColors: Record<DocumentData["type"], { bg: string; color: string }> = {
  lease: { bg: "#e8f0fd", color: "#1a5296" },
  invoice: { bg: "var(--amber-light)", color: "#7a5c00" },
  receipt: { bg: "var(--green-light)", color: "var(--green)" },
  report: { bg: "#f3e8fd", color: "#6b3d8a" },
  legal: { bg: "var(--red-light)", color: "var(--red-soft)" },
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export default function DocumentsView({ documents, properties, landlordId }: DocumentsViewProps) {
  const router = useRouter();
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("lease");
  const [uploadPropertyId, setUploadPropertyId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (propertyFilter !== "all" && d.property_id !== propertyFilter) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      return true;
    });
  }, [documents, propertyFilter, typeFilter]);

  const leaseCount = documents.filter((d) => d.type === "lease").length;
  const invoiceCount = documents.filter((d) => d.type === "invoice").length;
  const receiptCount = documents.filter((d) => d.type === "receipt").length;
  const reportCount = documents.filter((d) => d.type === "report").length;

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadName || !uploadType) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("landlord_id", landlordId);
    formData.append("name", uploadName);
    formData.append("type", uploadType);
    if (uploadPropertyId) formData.append("property_id", uploadPropertyId);

    await fetch("/api/admin/documents", {
      method: "POST",
      body: formData,
    });

    setShowUpload(false);
    setUploadName("");
    setUploadType("lease");
    setUploadPropertyId("");
    setUploadFile(null);
    setUploading(false);
    router.refresh();
  }

  async function handleDownload(doc: DocumentData) {
    const res = await fetch(`/api/documents/download?id=${doc.id}`);
    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank");
    }
  }

  return (
    <>
      <div className="flex justify-between items-start" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
            Documents
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            Manage leases, invoices, receipts, and reports
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
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
          <Upload size={14} />
          Upload Document
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
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
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Upload Document</h3>
            <button onClick={() => setShowUpload(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={18} style={{ color: "var(--muted)" }} />
            </button>
          </div>
          <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Document Name *</label>
                <input type="text" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="e.g., Lease Agreement — Unit 3" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Type *</label>
                <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} required>
                  <option value="lease">Lease</option>
                  <option value="invoice">Invoice</option>
                  <option value="receipt">Receipt</option>
                  <option value="report">Report</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Property (optional)</label>
                <select value={uploadPropertyId} onChange={(e) => setUploadPropertyId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">All Properties</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>File *</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{ ...inputStyle, padding: "8px 14px" }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
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
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
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
          { label: "Total Documents", value: documents.length, color: "var(--ink)" },
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
                  onClick={() => handleDownload(doc)}
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
                      {doc.properties?.name || "All Properties"}
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
                    {new Date(doc.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>

                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", minWidth: "60px", textAlign: "right" }}>
                    {formatFileSize(doc.file_size)}
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
