"use client";

import { useState } from "react";

interface AudienceTabsProps {
  tenantContent: React.ReactNode;
  ownerContent: React.ReactNode;
}

export default function AudienceTabs({ tenantContent, ownerContent }: AudienceTabsProps) {
  const [active, setActive] = useState<"tenants" | "owners">("tenants");

  const tabStyle = (isActive: boolean) => ({
    height: "44px",
    padding: "0 1.8rem",
    fontSize: "0.8rem",
    fontWeight: 500 as const,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    border: "none",
    borderRadius: "26px",
    cursor: "pointer" as const,
    transition: "all 0.25s",
    fontFamily: "var(--font-sans), sans-serif",
    background: isActive ? "var(--ink)" : "transparent",
    color: isActive ? "var(--cream)" : "var(--muted)",
  });

  return (
    <div className="marketing-section" style={{ paddingBottom: 0 }}>
      <div
        className="flex justify-center"
        style={{ marginBottom: "3rem" }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: "4px",
            padding: "4px",
            borderRadius: "26px",
            background: "var(--warm)",
            border: "1px solid rgba(200,150,62,0.15)",
          }}
        >
          <button
            onClick={() => setActive("tenants")}
            style={tabStyle(active === "tenants")}
          >
            Tenants
          </button>
          <button
            onClick={() => setActive("owners")}
            style={tabStyle(active === "owners")}
          >
            Property Owners
          </button>
        </div>
      </div>

      <div style={{ display: active === "tenants" ? "block" : "none" }}>
        {tenantContent}
      </div>
      <div style={{ display: active === "owners" ? "block" : "none" }}>
        {ownerContent}
      </div>
    </div>
  );
}
