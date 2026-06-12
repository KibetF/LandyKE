export default function Skeleton({
  width = "100%",
  height = "1rem",
  radius = "6px",
  style,
}: {
  width?: string | number;
  height?: string | number;
  radius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className="skeleton-shimmer"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
