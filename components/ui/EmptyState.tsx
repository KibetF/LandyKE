import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-warm/60 p-4">
        <Icon size={28} className="text-muted" />
      </div>
      <h4 className="text-[0.9rem] font-medium text-ink">{title}</h4>
      {description && (
        <p className="mt-1 max-w-[280px] text-[0.78rem] text-muted">{description}</p>
      )}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="mt-4 inline-block rounded-lg bg-ink px-5 py-2 text-[0.78rem] font-medium text-cream no-underline transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-4 rounded-lg bg-ink px-5 py-2 text-[0.78rem] font-medium text-cream transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
