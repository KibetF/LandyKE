"use client";

import { FileText, FileIcon, Download } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";

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

const typeToStatus: Record<string, "pending" | "active" | "completed" | "high" | "in-progress"> = {
  lease: "pending",
  invoice: "in-progress",
  receipt: "completed",
  report: "active",
  legal: "high",
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
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-normal tracking-tight">
          Documents
        </h1>
        <p className="mt-0.5 text-[0.78rem] text-muted">
          Lease agreements, receipts, and property documents
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="No documents available yet"
            description="Your lease agreements and receipts will appear here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 documents-grid">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="card card-hover flex flex-col gap-3"
            >
              <div className="flex items-center gap-2.5">
                <FileIcon size={20} className="shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8rem] font-medium">
                    {doc.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StatusBadge
                      status={typeToStatus[doc.type] || "active"}
                      label={doc.type}
                    />
                    {doc.file_size && (
                      <span className="text-[0.65rem] text-muted">
                        {formatFileSize(doc.file_size)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] text-muted">
                  {new Date(doc.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <button
                  onClick={() => handleDownload(doc)}
                  aria-label={`Download ${doc.name}`}
                  className="flex items-center gap-1 rounded border border-warm bg-transparent px-2.5 py-1.5 text-[0.65rem] text-ink cursor-pointer transition-colors hover:bg-warm/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
