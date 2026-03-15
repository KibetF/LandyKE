import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: "60vh", textAlign: "center" }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--warm)",
          marginBottom: "1.5rem",
        }}
      >
        <FileText size={28} style={{ color: "var(--gold)" }} />
      </div>
      <h1
        className="font-serif"
        style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "0.5rem" }}
      >
        Reports
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)", maxWidth: "320px" }}>
        Detailed financial reports and analytics are coming soon.
      </p>
    </div>
  );
}
