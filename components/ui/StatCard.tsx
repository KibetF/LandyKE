import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  borderColor?: "gold" | "green" | "rust" | "sage" | "muted";
}

const borderColorMap: Record<string, string> = {
  gold: "border-t-gold",
  green: "border-t-green",
  rust: "border-t-rust",
  sage: "border-t-sage",
  muted: "border-t-muted",
};

export default function StatCard({ label, value, sub, icon, borderColor = "gold" }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-gold/8 bg-white p-6 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] border-t-[3px] ${borderColorMap[borderColor]}`}
    >
      {icon && (
        <span className="absolute right-5 top-5 text-xl opacity-20">
          {icon}
        </span>
      )}
      <p className="label-upper mb-2.5">{label}</p>
      <p className="font-serif text-[2rem] font-semibold leading-none text-ink mb-1.5">
        {value}
      </p>
      {sub && (
        <p className="text-[0.7rem] text-muted">{sub}</p>
      )}
    </div>
  );
}
