interface SkeletonProps {
  variant?: "line" | "circle" | "card" | "stat";
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ variant = "line", width, height, className = "" }: SkeletonProps) {
  const base = "animate-pulse rounded bg-warm/60";

  switch (variant) {
    case "circle":
      return (
        <div
          className={`${base} rounded-full ${className}`}
          style={{ width: width ?? "40px", height: height ?? "40px" }}
        />
      );

    case "card":
      return (
        <div className={`${base} rounded-lg ${className}`} style={{ width: width ?? "100%", height: height ?? "120px" }} />
      );

    case "stat":
      return (
        <div className={`rounded-lg border border-gold/8 bg-white p-6 ${className}`}>
          <div className={`${base} mb-3 h-3 w-24`} />
          <div className={`${base} mb-2 h-8 w-20`} />
          <div className={`${base} h-3 w-32`} />
        </div>
      );

    default:
      return (
        <div
          className={`${base} ${className}`}
          style={{ width: width ?? "100%", height: height ?? "14px" }}
        />
      );
  }
}
