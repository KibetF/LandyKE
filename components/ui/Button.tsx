"use client";

import { Loader2 } from "lucide-react";

type Variant = "primary" | "gold" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--ink)", color: "var(--cream)", border: "1px solid var(--ink)" },
  gold: { background: "var(--gold)", color: "var(--white)", border: "1px solid var(--gold)" },
  outline: { background: "transparent", color: "var(--ink)", border: "1px solid var(--warm)" },
  ghost: { background: "transparent", color: "var(--muted)", border: "1px solid transparent" },
  danger: { background: "var(--rust)", color: "var(--white)", border: "1px solid var(--rust)" },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "0.45rem 0.9rem", fontSize: "0.75rem" },
  md: { padding: "0.75rem 1.25rem", fontSize: "0.85rem" },
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  style,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        borderRadius: "var(--radius-sm)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        fontFamily: "var(--font-sans), sans-serif",
        fontWeight: 500,
        opacity: disabled && !loading ? 0.55 : 1,
        transition: "opacity 0.15s, transform 0.15s, box-shadow 0.15s",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {loading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
      {children}
    </button>
  );
}
