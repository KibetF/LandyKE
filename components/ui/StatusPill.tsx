interface StatusPillProps {
  status: "paid" | "pending" | "overdue" | "active" | "inactive" | "open" | "in-progress" | "completed" | "low" | "medium" | "high" | "urgent";
}

const statusStyles: Record<string, { background: string; color: string }> = {
  paid: { background: "var(--green-light)", color: "var(--green)" },
  pending: { background: "var(--amber-light)", color: "#7a5c00" },
  overdue: { background: "var(--red-light)", color: "var(--red-soft)" },
  active: { background: "var(--green-light)", color: "var(--green)" },
  inactive: { background: "var(--red-light)", color: "var(--red-soft)" },
  open: { background: "var(--amber-light)", color: "#7a5c00" },
  "in-progress": { background: "#e8f0fd", color: "#1a5296" },
  completed: { background: "var(--green-light)", color: "var(--green)" },
  low: { background: "var(--green-light)", color: "var(--green)" },
  medium: { background: "var(--amber-light)", color: "#7a5c00" },
  high: { background: "#fde8e8", color: "var(--rust)" },
  urgent: { background: "var(--red-light)", color: "var(--red-soft)" },
};

export default function StatusPill({ status }: StatusPillProps) {
  const style = statusStyles[status];
  return (
    <span
      className="status-pill"
      style={{
        background: style.background,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
}
