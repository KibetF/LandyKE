"use client";

// Shared chart leaves. Kept in their own module so recharts
// (~100KB gzipped) is code-split out of page bundles and only loads
// when a chart is actually rendered (via next/dynamic in the consumers).

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export function IncomeBarChart({
  data,
}: {
  data: { month: string; collected: number; expected: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={2} barCategoryGap="20%">
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#7a7468" }} />
        <YAxis hide />
        <Tooltip
          formatter={(value) => `KES ${(Number(value) / 1000).toFixed(0)}k`}
          contentStyle={{ background: "var(--white)", border: "1px solid var(--warm)", borderRadius: "4px", fontSize: "0.75rem" }}
        />
        <Bar dataKey="expected" fill="#ede6d6" radius={[3, 3, 0, 0]} name="Expected" />
        <Bar dataKey="collected" fill="#c8963e" radius={[3, 3, 0, 0]} name="Collected" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  tooltipFormatter,
}: {
  data: { name: string; value: number; color: string }[];
  tooltipFormatter: (value: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => tooltipFormatter(Number(value))} contentStyle={{ fontSize: "0.75rem", borderRadius: "4px" }} />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
