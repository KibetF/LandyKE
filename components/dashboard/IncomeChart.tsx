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
import { BarChart3 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import type { MonthlyIncome } from "@/types";

interface IncomeChartProps {
  data: MonthlyIncome[];
}

export default function IncomeChart({ data }: IncomeChartProps) {
  const isEmpty = data.length === 0;

  return (
    <div className="overflow-hidden rounded-lg border border-gold/8 bg-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between border-b border-warm px-6 py-4">
        <h3 className="font-serif text-[1.1rem] font-semibold">
          Monthly Income
        </h3>
        <Link
          href="/payments"
          className="text-[0.7rem] uppercase tracking-[0.08em] text-gold no-underline"
        >
          Full Report →
        </Link>
      </div>
      <div className="h-[220px] p-6">
        {isEmpty ? (
          <EmptyState
            icon={BarChart3}
            title="No income data yet"
            description="Payments will appear here once recorded"
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}
