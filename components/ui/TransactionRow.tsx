import type { ReactNode } from "react";

interface TransactionRowProps {
  title: string;
  subtitle?: string;
  amount: string;
  amountColor?: "green" | "rust" | "ink" | "muted";
  trailing?: ReactNode;
  isLast?: boolean;
}

const amountColorMap: Record<string, string> = {
  green: "text-green",
  rust: "text-rust",
  ink: "text-ink",
  muted: "text-muted",
};

export default function TransactionRow({
  title,
  subtitle,
  amount,
  amountColor = "ink",
  trailing,
  isLast = false,
}: TransactionRowProps) {
  return (
    <div
      className={`flex items-center gap-4 py-3 flex-wrap ${
        !isLast ? "border-b border-warm" : ""
      }`}
    >
      <div className="min-w-[120px] flex-1">
        <p className="text-[0.8rem] font-medium">{title}</p>
        {subtitle && (
          <p className="text-[0.7rem] text-muted">{subtitle}</p>
        )}
      </div>
      <p className={`text-[0.85rem] font-semibold ${amountColorMap[amountColor]}`}>
        {amount}
      </p>
      {trailing}
    </div>
  );
}
