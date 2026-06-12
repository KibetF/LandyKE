export default function Card({
  title,
  action,
  children,
  padded = false,
  style,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: "var(--radius-md)",
        border: "1px solid rgba(200,150,62,0.08)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid var(--warm)",
          }}
        >
          {typeof title === "string" ? (
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {title}
            </h3>
          ) : (
            title
          )}
          {action}
        </div>
      )}
      <div style={padded ? { padding: "1.5rem" } : undefined}>{children}</div>
    </div>
  );
}
