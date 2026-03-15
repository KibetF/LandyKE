interface StatusPillProps {
  status: "paid" | "pending" | "overdue";
}

const statusStyles: Record<string, { background: string; color: string }> = {
  paid: { background: "var(--green-light)", color: "var(--green)" },
  pending: { background: "var(--amber-light)", color: "#7a5c00" },
  overdue: { background: "var(--red-light)", color: "var(--red-soft)" },
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
