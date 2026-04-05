import type { LucideIcon } from "lucide-react";

type StatusVariant =
  | "paid"
  | "pending"
  | "overdue"
  | "vacated_unpaid"
  | "active"
  | "inactive"
  | "moved"
  | "open"
  | "in-progress"
  | "completed"
  | "low"
  | "medium"
  | "high"
  | "urgent";

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  icon?: LucideIcon;
  size?: "sm" | "md";
}

const variantStyles: Record<StatusVariant, string> = {
  paid: "bg-green-light text-green",
  pending: "bg-amber-light text-[#7a5c00]",
  overdue: "bg-red-light text-red-soft",
  vacated_unpaid: "bg-[#f0eded] text-[#6b5e5e]",
  active: "bg-green-light text-green",
  inactive: "bg-red-light text-red-soft",
  moved: "bg-amber-light text-[#7a5c00]",
  open: "bg-amber-light text-[#7a5c00]",
  "in-progress": "bg-[#e8f0fd] text-[#1a5296]",
  completed: "bg-green-light text-green",
  low: "bg-green-light text-green",
  medium: "bg-amber-light text-[#7a5c00]",
  high: "bg-[#fde8e8] text-rust",
  urgent: "bg-red-light text-red-soft",
};

const defaultLabels: Record<StatusVariant, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  vacated_unpaid: "Vacated - Unpaid",
  active: "Active",
  inactive: "Inactive",
  moved: "Moved",
  open: "Open",
  "in-progress": "In Progress",
  completed: "Completed",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export default function StatusBadge({ status, label, icon: Icon, size = "sm" }: StatusBadgeProps) {
  const sizeClasses = size === "sm"
    ? "text-[0.6rem] px-[0.6rem] py-[0.15rem]"
    : "text-[0.7rem] px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[20px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${variantStyles[status]} ${sizeClasses}`}
    >
      {Icon && <Icon size={size === "sm" ? 10 : 12} />}
      {label ?? defaultLabels[status]}
    </span>
  );
}
