"use client";

interface TenantHeaderProps {
  tenantName: string;
  propertyName: string;
}

export default function TenantHeader({ tenantName, propertyName }: TenantHeaderProps) {
  return (
    <header
      className="tenant-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2rem",
      }}
    >
      <div>
        <h1
          className="font-serif"
          style={{
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          Hello, {tenantName.split(" ")[0]}
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>
          {propertyName}
        </p>
      </div>
    </header>
  );
}
