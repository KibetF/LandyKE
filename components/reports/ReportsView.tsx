"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const incomeData = [
  { month: "Oct", collected: 176000, expected: 200000 },
  { month: "Nov", collected: 192000, expected: 200000 },
  { month: "Dec", collected: 185000, expected: 200000 },
  { month: "Jan", collected: 200000, expected: 200000 },
  { month: "Feb", collected: 196000, expected: 200000 },
  { month: "Mar", collected: 188000, expected: 200000 },
];

const collectionRates = [
  { month: "October", rate: 88 },
  { month: "November", rate: 96 },
  { month: "December", rate: 92 },
  { month: "January", rate: 100 },
  { month: "February", rate: 98 },
  { month: "March", rate: 94 },
];

const occupancyData = [
  { name: "Plot A — Langas", total: 6, occupied: 6, rate: 100 },
  { name: "Kapsoya Block", total: 4, occupied: 4, rate: 100 },
  { name: "Plot B — Pioneer", total: 4, occupied: 3, rate: 75 },
  { name: "Annex — Huruma", total: 2, occupied: 2, rate: 100 },
];

const arrearsData = [
  { tenant: "Daniel Otieno", property: "Plot B — Pioneer", unit: "7", amount: 10000, days: 15 },
  { tenant: "Samuel Mutua", property: "Annex — Huruma", unit: "1", amount: 12500, days: 5 },
];

const cardStyle = {
  background: "var(--white)",
  borderRadius: "8px",
  border: "1px solid rgba(200,150,62,0.08)",
  overflow: "hidden",
} as const;

export default function ReportsView() {
  const [month, setMonth] = useState("2026-03");

  const totalRevenue = incomeData.reduce((s, d) => s + d.collected, 0);
  const totalExpected = incomeData.reduce((s, d) => s + d.expected, 0);
  const collectionRate = Math.round((totalRevenue / totalExpected) * 100);
  const totalUnits = occupancyData.reduce((s, d) => s + d.total, 0);
  const occupiedUnits = occupancyData.reduce((s, d) => s + d.occupied, 0);
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);

  return (
    <>
      <div className="flex justify-between items-start dashboard-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
            Reports
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            Financial analytics and property performance
          </p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
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
          <option value="2026-03">March 2026</option>
          <option value="2026-02">February 2026</option>
          <option value="2026-01">January 2026</option>
          <option value="2025-12">December 2025</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="reports-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Revenue (6mo)", value: `KES ${totalRevenue.toLocaleString()}`, color: "var(--green)" },
          { label: "Collection Rate", value: `${collectionRate}%`, color: "var(--gold)" },
          { label: "Occupancy Rate", value: `${occupancyRate}%`, color: "#1a5296" },
          { label: "Total Tenants", value: `${occupiedUnits}`, color: "var(--ink)" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ ...cardStyle, padding: "1rem 1.2rem" }}>
            <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
              {kpi.label}
            </span>
            <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, color: kpi.color }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Income chart */}
      <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <div
          className="flex justify-between items-center"
          style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}
        >
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Income Overview — Last 6 Months
          </h3>
        </div>
        <div style={{ padding: "1.5rem", height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData} barGap={2} barCategoryGap="20%">
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
        </div>
      </div>

      {/* Occupancy + Collection Rate */}
      <div className="occupancy-grid" style={{ marginBottom: "1.5rem" }}>
        {/* Occupancy report */}
        <div style={cardStyle}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              Occupancy by Property
            </h3>
          </div>
          <div style={{ padding: "1rem 1.5rem" }}>
            {occupancyData.map((prop, i) => (
              <div
                key={prop.name}
                style={{
                  padding: "0.8rem 0",
                  borderBottom: i < occupancyData.length - 1 ? "1px solid var(--warm)" : "none",
                }}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{prop.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {prop.occupied}/{prop.total} units
                  </span>
                </div>
                <div style={{ background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${prop.rate}%`,
                      height: "100%",
                      background: prop.rate === 100 ? "var(--green)" : "var(--gold)",
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment collection rate */}
        <div style={cardStyle}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              Payment Collection Rate
            </h3>
          </div>
          <div style={{ padding: "1rem 1.5rem" }}>
            {collectionRates.map((m, i) => (
              <div
                key={m.month}
                style={{
                  padding: "0.6rem 0",
                  borderBottom: i < collectionRates.length - 1 ? "1px solid var(--warm)" : "none",
                }}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.8rem" }}>{m.month}</span>
                  <span
                    className="font-serif"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: m.rate >= 95 ? "var(--green)" : m.rate >= 90 ? "var(--gold)" : "var(--rust)",
                    }}
                  >
                    {m.rate}%
                  </span>
                </div>
                <div style={{ background: "var(--warm)", borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${m.rate}%`,
                      height: "100%",
                      background: m.rate >= 95 ? "var(--green)" : m.rate >= 90 ? "var(--gold)" : "var(--rust)",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rent arrears */}
      <div style={cardStyle}>
        <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Rent Arrears
          </h3>
        </div>
        {arrearsData.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
            No overdue payments.
          </div>
        ) : (
          <div>
            {arrearsData.map((tenant, i) => (
              <div
                key={tenant.tenant}
                className="items-center row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderBottom: i < arrearsData.length - 1 ? "1px solid var(--warm)" : "none",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                    {tenant.tenant}
                  </h4>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {tenant.property} · Unit {tenant.unit}
                  </span>
                </div>
                <span
                  className="font-serif"
                  style={{ fontSize: "1rem", fontWeight: 600, color: "var(--rust)" }}
                >
                  KES {tenant.amount.toLocaleString()}
                </span>
                <span
                  className="status-pill"
                  style={{ background: "var(--red-light)", color: "var(--red-soft)" }}
                >
                  {tenant.days} days overdue
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
