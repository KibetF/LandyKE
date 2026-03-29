"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, FileText, BarChart3, Users, AlertTriangle } from "lucide-react";
import { generateRentStatement, generatePropertySummary, generateTenantPaymentReport } from "@/lib/pdf/generate-report";
import { getAvailableMonths } from "@/lib/queries";
import WhatsAppShareButton from "@/components/ui/WhatsAppShareButton";

interface ReportsViewProps {
  incomeData: { month: string; collected: number; expected: number }[];
  occupancyData: { name: string; total: number; occupied: number; rate: number }[];
  collectionRates: { month: string; rate: number }[];
  arrearsData: { tenant: string; property: string; unit: string; amount: number; days: number }[];
  tenantStatusData: { name: string; property: string; amount: number; date: string; status: "paid" | "pending" | "overdue" }[];
  selectedMonth: string;
}

const cardStyle = {
  background: "var(--white)",
  borderRadius: "8px",
  border: "1px solid rgba(200,150,62,0.08)",
  overflow: "hidden",
} as const;

const months = getAvailableMonths();

function formatLabel(key: string) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

export default function ReportsView({
  incomeData,
  occupancyData,
  collectionRates,
  arrearsData,
  tenantStatusData,
  selectedMonth,
}: ReportsViewProps) {
  const router = useRouter();

  const totalRevenue = incomeData.reduce((s, d) => s + d.collected, 0);
  const totalExpected = incomeData.reduce((s, d) => s + d.expected, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0;
  const totalUnits = occupancyData.reduce((s, d) => s + d.total, 0);
  const occupiedUnits = occupancyData.reduce((s, d) => s + d.occupied, 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  function handleMonthChange(value: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (value === currentMonth) {
      router.push("/reports");
    } else {
      router.push(`/reports?month=${value}`);
    }
  }

  function exportCsv() {
    let csv = "Section,Item,Value\n";
    // Income data
    incomeData.forEach((d) => {
      csv += `Income,${d.month} Collected,${d.collected}\n`;
      csv += `Income,${d.month} Expected,${d.expected}\n`;
    });
    // Occupancy
    occupancyData.forEach((d) => {
      csv += `Occupancy,${d.name},${d.occupied}/${d.total} (${d.rate}%)\n`;
    });
    // Collection rates
    collectionRates.forEach((d) => {
      csv += `Collection Rate,${d.month},${d.rate}%\n`;
    });
    // Arrears
    arrearsData.forEach((d) => {
      csv += `Arrears,${d.tenant} - ${d.property} Unit ${d.unit},KES ${d.amount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadRentStatement() {
    generateRentStatement({
      month: formatLabel(selectedMonth),
      incomeData,
      arrearsData,
      collectionRate,
      totalCollected: totalRevenue,
      totalExpected,
    });
  }

  function downloadPropertySummary() {
    generatePropertySummary({
      month: formatLabel(selectedMonth),
      occupancyData,
      incomeData,
      arrearsData,
    });
  }

  function downloadTenantPaymentReport() {
    generateTenantPaymentReport({
      month: formatLabel(selectedMonth),
      tenants: tenantStatusData,
      totalCollected: totalRevenue,
      totalExpected,
      collectionRate,
    });
  }

  const hasData = incomeData.length > 0 && incomeData.some((d) => d.collected > 0 || d.expected > 0);

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
        <div className="flex items-center" style={{ gap: "0.5rem" }}>
          <WhatsAppShareButton month={formatLabel(selectedMonth)} />
          <button
            onClick={exportCsv}
            className="flex items-center"
            style={{
              gap: "0.4rem",
              background: "var(--white)",
              border: "1px solid var(--warm)",
              padding: "0.6rem 1rem",
              fontSize: "0.8rem",
              color: "var(--ink)",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "var(--font-sans), sans-serif",
            }}
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={downloadRentStatement}
            className="flex items-center"
            style={{
              gap: "0.4rem",
              background: "var(--ink)",
              color: "var(--cream)",
              border: "none",
              padding: "0.6rem 1rem",
              fontSize: "0.8rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "var(--font-sans), sans-serif",
            }}
          >
            <FileText size={14} />
            Rent Statement PDF
          </button>
          <button
            onClick={downloadPropertySummary}
            className="flex items-center"
            style={{
              gap: "0.4rem",
              background: "var(--sage)",
              color: "var(--cream)",
              border: "none",
              padding: "0.6rem 1rem",
              fontSize: "0.8rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "var(--font-sans), sans-serif",
            }}
          >
            <FileText size={14} />
            Property Summary PDF
          </button>
          <button
            onClick={downloadTenantPaymentReport}
            className="flex items-center"
            style={{
              gap: "0.4rem",
              background: "#1a5296",
              color: "var(--cream)",
              border: "none",
              padding: "0.6rem 1rem",
              fontSize: "0.8rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "var(--font-sans), sans-serif",
            }}
          >
            <Users size={14} />
            Tenant Payments PDF
          </button>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
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
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="reports-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}`, color: "var(--green)" },
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
            Income Overview
          </h3>
        </div>
        <div style={{ padding: "1.5rem", height: "250px" }}>
          {!hasData ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: "100%", color: "var(--muted)" }}
            >
              <BarChart3 size={32} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
              <span style={{ fontSize: "0.85rem" }}>No income data available</span>
            </div>
          ) : (
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
          )}
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
            {occupancyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                <span style={{ fontSize: "0.85rem" }}>No property data</span>
              </div>
            ) : (
              occupancyData.map((prop, i) => (
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
              ))
            )}
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
            {collectionRates.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                <BarChart3 size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                <span style={{ fontSize: "0.85rem" }}>No collection data</span>
              </div>
            ) : (
              collectionRates.map((m, i) => (
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
              ))
            )}
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
          <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
            <AlertTriangle size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
            <span style={{ fontSize: "0.85rem" }}>No overdue payments</span>
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
