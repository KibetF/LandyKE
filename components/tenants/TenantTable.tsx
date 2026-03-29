"use client";

import { useState } from "react";
import StatusPill from "@/components/ui/StatusPill";
import Pagination from "@/components/ui/Pagination";

interface TenantData {
  id: string;
  property_id: string;
  unit_number: string | null;
  full_name: string;
  phone: string | null;
  rent_amount: number;
  status: string;
  properties: { name: string; location: string | null };
}

interface TenantTableProps {
  tenants: TenantData[];
  properties: Array<{ id: string; name: string }>;
  currentPage?: number;
  totalPages?: number;
}

const avatarColors = [
  "#4a5c4e",
  "#8b3a2a",
  "#c8963e",
  "#2d6a4f",
  "#6b3d8a",
  "#3d6b8a",
  "#8a6b3d",
  "#5c4a6b",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TenantTable({ tenants, properties, currentPage = 1, totalPages = 1 }: TenantTableProps) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? tenants
      : tenants.filter((t) => t.property_id === filter);

  const totalCount = tenants.length;
  const activeCount = tenants.filter((t) => t.status === "active").length;
  const inactiveCount = totalCount - activeCount;

  return (
    <>
      {/* Header */}
      <div
        className="flex justify-between items-start dashboard-header"
        style={{ marginBottom: "2rem" }}
      >
        <div>
          <h1
            className="font-serif"
            style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}
          >
            Tenants
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              marginTop: "0.2rem",
            }}
          >
            View all tenants across your properties
          </p>
        </div>

        {/* Property filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: "var(--white)",
            border: "1px solid var(--warm)",
            padding: "0.6rem 1.2rem",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.8rem",
            color: "var(--ink)",
            borderRadius: "4px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary stats */}
      <div
        className="flex"
        style={{
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.5rem",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Total
          </span>
          <div
            className="font-serif"
            style={{ fontSize: "1.5rem", fontWeight: 600 }}
          >
            {totalCount}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.5rem",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--green)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Active
          </span>
          <div
            className="font-serif"
            style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--green)" }}
          >
            {activeCount}
          </div>
        </div>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "8px",
            border: "1px solid rgba(200,150,62,0.08)",
            padding: "1rem 1.5rem",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--red-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Inactive
          </span>
          <div
            className="font-serif"
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--red-soft)",
            }}
          >
            {inactiveCount}
          </div>
        </div>
      </div>

      {/* Tenant list */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          border: "1px solid rgba(200,150,62,0.08)",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.85rem",
            }}
          >
            No tenants found.
          </div>
        ) : (
          <div>
            {filtered.map((tenant, i) => {
              const initials = getInitials(tenant.full_name);
              const color = avatarColors[i % avatarColors.length];

              return (
                <div
                  key={tenant.id}
                  className="items-center row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto auto",
                    gap: "1rem",
                    padding: "1rem 1.5rem",
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--warm)"
                        : "none",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: color,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--white)",
                    }}
                  >
                    {initials}
                  </div>

                  {/* Name + property */}
                  <div>
                    <h4
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: "0.15rem",
                      }}
                    >
                      {tenant.full_name}
                    </h4>
                    <span
                      style={{ fontSize: "0.7rem", color: "var(--muted)" }}
                    >
                      {tenant.properties?.name}
                      {tenant.unit_number ? ` · Unit ${tenant.unit_number}` : ""}
                    </span>
                  </div>

                  {/* Rent */}
                  <div className="text-right">
                    <span
                      className="font-serif"
                      style={{ fontSize: "0.95rem", fontWeight: 600 }}
                    >
                      KES {Number(tenant.rent_amount).toLocaleString()}
                    </span>
                    <small
                      className="block"
                      style={{
                        fontSize: "0.6rem",
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      /month
                    </small>
                  </div>

                  {/* Phone */}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      minWidth: "100px",
                    }}
                  >
                    {tenant.phone || "—"}
                  </span>

                  {/* Status */}
                  <StatusPill
                    status={tenant.status === "active" ? "active" : tenant.status === "moved" ? "moved" : "inactive"}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}
