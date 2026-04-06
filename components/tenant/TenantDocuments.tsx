"use client";

import { FileText, FileIcon, Download } from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

interface Props {
  documents: DocumentItem[];
}

const typeColors: Record<string, { bg: string; color: string }> = {
  lease: { bg: "var(--amber-light)", color: "var(--gold)" },
  invoice: { bg: "#e8f0fd", color: "#1a5296" },
  receipt: { bg: "var(--green-light)", color: "var(--green)" },
  report: { bg: "var(--cream)", color: "var(--sage)" },
  legal: { bg: "var(--red-light)", color: "var(--rust)" },
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TenantDocuments({ documents }: Props) {
  async function handleDownload(doc: DocumentItem) {
    const res = await fetch(`/api/documents/download?path=${encodeURIComponent(doc.file_path)}&name=${encodeURIComponent(doc.name)}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.02em" }}>
          Documents
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          Lease agreements, receipts, and property documents
        </p>
      </div>

      {documents.length === 0 ? (
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <FileText size={32} style={{ color: "var(--warm)", marginBottom: "0.75rem" }} />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>No documents available yet.</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => {
            const tc = typeColors[doc.type] || typeColors.report;
            return (
              <div
                key={doc.id}
                className="card-hover"
                style={{
                  background: "var(--white)",
                  borderRadius: "8px",
                  border: "1px solid rgba(200,150,62,0.08)",
                  padding: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div className="flex items-center" style={{ gap: "0.6rem" }}>
                  <FileIcon size={20} style={{ color: "var(--gold)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.name}
                    </p>
                    <div className="flex items-center" style={{ gap: "0.5rem", marginTop: "0.2rem" }}>
                      <span className="status-pill" style={{ background: tc.bg, color: tc.color }}>
                        {doc.type}
                      </span>
                      {doc.file_size && (
                        <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                          {formatFileSize(doc.file_size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center" style={{ justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                    {new Date(doc.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex items-center"
                    style={{
                      gap: "0.3rem",
                      background: "transparent",
                      border: "1px solid var(--warm)",
                      borderRadius: "4px",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.65rem",
                      color: "var(--ink)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
