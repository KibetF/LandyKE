import { Settings } from "lucide-react";

export default function SettingsPage() {
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
        <Settings size={28} style={{ color: "var(--gold)" }} />
      </div>
      <h1
        className="font-serif"
        style={{ fontSize: "1.8rem", fontWeight: 300, marginBottom: "0.5rem" }}
      >
        Settings
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)", maxWidth: "320px" }}>
        Account settings and preferences are coming soon.
      </p>
    </div>
  );
}
