import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  compact = false,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ padding: compact ? "2rem 1rem" : "4rem 1.5rem", textAlign: "center", color: "var(--muted)" }}
    >
      {Icon && <Icon size={compact ? 28 : 40} strokeWidth={1.5} style={{ marginBottom: "0.9rem", opacity: 0.35 }} />}
      <span className="font-serif" style={{ fontSize: compact ? "0.95rem" : "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
        {title}
      </span>
      {hint && <span style={{ fontSize: "0.78rem", marginTop: "0.35rem", maxWidth: "320px" }}>{hint}</span>}
      {action && <div style={{ marginTop: "1rem" }}>{action}</div>}
    </div>
  );
}
