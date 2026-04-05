// Deprecated: Use StatusBadge instead
import StatusBadge from "./StatusBadge";

interface StatusPillProps {
  status: "paid" | "pending" | "overdue" | "vacated_unpaid" | "active" | "inactive" | "moved" | "open" | "in-progress" | "completed" | "low" | "medium" | "high" | "urgent";
}

export default function StatusPill({ status }: StatusPillProps) {
  return <StatusBadge status={status} />;
}
