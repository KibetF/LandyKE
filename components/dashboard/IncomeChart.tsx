"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import type { MonthlyIncome } from "@/types";

const IncomeBarChart = dynamic(
  () => import("@/components/ui/charts").then((m) => m.IncomeBarChart),
  { ssr: false, loading: () => <Skeleton height="100%" /> }
);

interface IncomeChartProps {
  data: MonthlyIncome[];
}

export default function IncomeChart({ data }: IncomeChartProps) {
  const isEmpty = data.length === 0;

  return (
    <div
      className="card-hover"
      style={{
        background: "var(--white)",
        borderRadius: "8px",
        border: "1px solid rgba(200,150,62,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex justify-between items-center"
        style={{
          padding: "1.2rem 1.5rem",
          borderBottom: "1px solid var(--warm)",
        }}
      >
        <h3
          className="font-serif"
          style={{ fontSize: "1.1rem", fontWeight: 600 }}
        >
          Monthly Income
        </h3>
        <Link
          href="/payments"
          className="uppercase cursor-pointer"
          style={{
            fontSize: "0.7rem",
            color: "var(--gold)",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          Full Report →
        </Link>
      </div>
      <div style={{ padding: "1.5rem", height: "220px" }}>
        {isEmpty ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ height: "100%", color: "var(--muted)" }}
          >
            <BarChart3 size={32} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
            <span style={{ fontSize: "0.85rem" }}>No income data yet</span>
            <span style={{ fontSize: "0.7rem", marginTop: "0.25rem" }}>
              Payments will appear here once recorded
            </span>
          </div>
        ) : (
          <IncomeBarChart data={data} />
        )}
      </div>
    </div>
  );
}
