"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import type { MonthlyIncome } from "@/types";

interface IncomeChartProps {
  data: MonthlyIncome[];
}

export default function IncomeChart({ data }: IncomeChartProps) {
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
          Monthly Income — Last 6 Months
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
                fill: "#7a7468",
                letterSpacing: "0.05em",
              }}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) =>
                `KES ${(Number(value) / 1000).toFixed(0)}k`
              }
              contentStyle={{
                background: "var(--white)",
                border: "1px solid var(--warm)",
                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            />
            <Bar
              dataKey="expected"
              fill="#ede6d6"
              radius={[3, 3, 0, 0]}
              name="Expected"
            />
            <Bar
              dataKey="collected"
              fill="#c8963e"
              radius={[3, 3, 0, 0]}
              name="Collected"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
