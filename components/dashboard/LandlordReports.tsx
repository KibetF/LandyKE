"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { ChevronUp, Eye, Download, Send, FileText, BarChart3, Users } from "lucide-react";
import { generateTenantPaymentReport } from "@/lib/pdf/generate-report";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface PropertyBreakdown {
  name: string;
  location: string | null;
  totalTenants: number;
  tenantsPaid: number;
  collected: number;
  expected: number;
  receivedInAccount?: number;
  paidToExternal?: number;
  rate: number;
}

interface TenantStatus {
  name: string;
  property: string;
  unit?: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
  notes?: string;
}

interface ReportData {
  incomeData: { month: string; collected: number; expected: number }[];
  occupancyData: { name: string; total: number; occupied: number; rate: number }[];
  collectionRates: { month: string; rate: number }[];
  tenantStatusData: TenantStatus[];
  propertyBreakdown: PropertyBreakdown[];
  selectedMonth: string;
}

const cardStyle = {
  background: "var(--white)",
  borderRadius: "8px",
  border: "1px solid rgba(200,150,62,0.08)",
  overflow: "hidden" as const,
};

function formatMonthLabel(key: string) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

export default function LandlordReports({ selectedMonth }: { selectedMonth: string }) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const fetchReport = useCallback(async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/landlord/reports?month=${month}`);
      const data = await res.json();
      if (res.ok) setReportData(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth, fetchReport]);

  function downloadAllTenantPayments() {
    if (!reportData) return;
    const totalRevenue = reportData.incomeData.reduce((s, d) => s + d.collected, 0);
    const totalExpected = reportData.incomeData.reduce((s, d) => s + d.expected, 0);
    const collectionRate = totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0;
    const totals = reportData.propertyBreakdown.reduce((acc, p) => ({
      receivedInAccount: acc.receivedInAccount + (p.receivedInAccount || 0),
      paidToExternal: acc.paidToExternal + (p.paidToExternal || 0),
    }), { receivedInAccount: 0, paidToExternal: 0 });
    generateTenantPaymentReport({
      month: formatMonthLabel(selectedMonth),
      tenants: reportData.tenantStatusData,
      totalCollected: totalRevenue,
      totalExpected,
      collectionRate,
      receivedInAccount: totals.receivedInAccount,
      paidToExternal: totals.paidToExternal,
    });
  }

  function downloadPropertyReport(propertyName: string) {
    if (!reportData) return;
    const propertyTenants = reportData.tenantStatusData.filter((t) => t.property === propertyName);
    const propBreakdown = reportData.propertyBreakdown.find((p) => p.name === propertyName);
    generateTenantPaymentReport({
      month: `${formatMonthLabel(selectedMonth)} — ${propertyName}`,
      tenants: propertyTenants,
      totalCollected: propBreakdown?.collected || 0,
      totalExpected: propBreakdown?.expected || 0,
      collectionRate: propBreakdown?.rate || 0,
      receivedInAccount: propBreakdown?.receivedInAccount,
      paidToExternal: propBreakdown?.paidToExternal,
    });
  }

  function sendPropertyWhatsApp(propertyName: string) {
    if (!reportData) return;
    const propertyTenants = reportData.tenantStatusData.filter((t) => t.property === propertyName);
    const propBreakdown = reportData.propertyBreakdown.find((p) => p.name === propertyName);
    const month = formatMonthLabel(selectedMonth);

    let msg = `*LandyKE — ${propertyName}*\n`;
    msg += `*${month} Rent Collection*\n\n`;
    msg += `Collected: KES ${(propBreakdown?.collected || 0).toLocaleString()}\n`;
    msg += `Expected: KES ${(propBreakdown?.expected || 0).toLocaleString()}\n`;
    msg += `Rate: ${propBreakdown?.rate || 0}%\n\n`;

    const paid = propertyTenants.filter((t) => t.status === "paid");
    const unpaid = propertyTenants.filter((t) => t.status !== "paid");

    if (paid.length > 0) {
      msg += `*Paid (${paid.length}):*\n`;
      paid.forEach((t) => { msg += `✓ ${t.name}${t.unit ? ` (Unit ${t.unit})` : ""} — KES ${t.amount.toLocaleString()}\n`; });
      msg += `\n`;
    }
    if (unpaid.length > 0) {
      msg += `*Not Paid (${unpaid.length}):*\n`;
      unpaid.forEach((t) => { msg += `✗ ${t.name}${t.unit ? ` (Unit ${t.unit})` : ""} — KES ${t.amount.toLocaleString()} (${t.status})\n`; });
    }
    msg += `\n— LandyKE`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: "3rem", color: "var(--muted)" }}>
        <BarChart3 size={36} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
        <span style={{ fontSize: "0.85rem" }}>Loading reports...</span>
      </div>
    );
  }

  if (!reportData) return null;

  const totalRevenue = reportData.incomeData.reduce((s, d) => s + d.collected, 0);
  const totalExpected = reportData.incomeData.reduce((s, d) => s + d.expected, 0);
  const outstanding = Math.max(0, totalExpected - totalRevenue);
  const collectionRate = totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0;
  const totalUnits = reportData.occupancyData.reduce((s, d) => s + d.total, 0);
  const occupiedUnits = reportData.occupancyData.reduce((s, d) => s + d.occupied, 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const paidCount = reportData.tenantStatusData.filter((t) => t.status === "paid").length;
  const pendingCount = reportData.tenantStatusData.filter((t) => t.status === "pending").length;
  const overdueCount = reportData.tenantStatusData.filter((t) => t.status === "overdue").length;

  const collectionData = [
    { name: "Collected", value: totalRevenue },
    { name: "Outstanding", value: outstanding },
  ];
  const collectionColors = ["#2d6a4f", "#8b3a2a"];

  const statusData = [
    { name: "Paid", value: paidCount },
    { name: "Pending", value: pendingCount },
    { name: "Overdue", value: overdueCount },
  ].filter((d) => d.value > 0);
  const statusColors = ["#2d6a4f", "#c8963e", "#8b3a2a"];

  return (
    <>
      {/* KPI Cards */}
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

      {/* Pie Charts */}
      <div className="occupancy-grid" style={{ marginBottom: "1.5rem" }}>
        <div style={cardStyle}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Collection Overview</h3>
          </div>
          <div style={{ padding: "1rem", height: "220px" }}>
            {totalExpected === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ height: "100%", color: "var(--muted)" }}>
                <span style={{ fontSize: "0.85rem" }}>No data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={collectionData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {collectionData.map((_, i) => (
                      <Cell key={i} fill={collectionColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `KES ${Number(value).toLocaleString()}`} contentStyle={{ fontSize: "0.75rem", borderRadius: "4px" }} />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Tenant Payment Status</h3>
          </div>
          <div style={{ padding: "1rem", height: "220px" }}>
            {statusData.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ height: "100%", color: "var(--muted)" }}>
                <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                <span style={{ fontSize: "0.85rem" }}>No tenants</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.name === "Paid" ? statusColors[0] : entry.name === "Pending" ? statusColors[1] : statusColors[2]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} tenants`} contentStyle={{ fontSize: "0.75rem", borderRadius: "4px" }} />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex items-center" style={{ gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button
          onClick={downloadAllTenantPayments}
          className="flex items-center"
          style={{
            gap: "0.4rem",
            background: "#1a5296",
            color: "#fff",
            border: "none",
            padding: "0.7rem 1rem",
            fontSize: "0.8rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "var(--font-sans), sans-serif",
            fontWeight: 500,
          }}
        >
          <FileText size={14} />
          Tenant Payments PDF
        </button>
      </div>

      {/* Property Payment Breakdown */}
      {reportData.propertyBreakdown && reportData.propertyBreakdown.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              Payment Breakdown by Property — {formatMonthLabel(selectedMonth)}
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--warm)", background: "var(--cream)" }}>
                  {[
                    { label: "Property", hide: false },
                    { label: "Tenants Paid", hide: true },
                    { label: "Collected", hide: false },
                    { label: "Expected", hide: true },
                    { label: "Outstanding", hide: false },
                    { label: "Rate", hide: true },
                    { label: "", hide: false },
                  ].map((h) => (
                    <th key={h.label} className={h.hide ? "reports-table-mobile-hide" : ""} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", fontWeight: 600 }}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.propertyBreakdown.map((prop, i) => {
                  const isExpanded = expandedProperty === prop.name;
                  const propertyTenants = reportData.tenantStatusData.filter((t) => t.property === prop.name);
                  return (
                    <Fragment key={prop.name}>
                      <tr style={{ borderBottom: isExpanded ? "none" : (i < reportData.propertyBreakdown.length - 1 ? "1px solid var(--warm)" : "none") }} className="row-hover">
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ fontWeight: 600 }}>{prop.name}</span>
                          {prop.location && <span style={{ display: "block", fontSize: "0.7rem", color: "var(--muted)" }}>{prop.location}</span>}
                        </td>
                        <td className="reports-table-mobile-hide" style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ fontWeight: 600 }}>{prop.tenantsPaid}</span>
                          <span style={{ color: "var(--muted)" }}> / {prop.totalTenants}</span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span className="font-serif" style={{ fontWeight: 600, color: prop.collected > 0 ? "var(--green)" : "var(--muted)" }}>
                            KES {prop.collected.toLocaleString()}
                          </span>
                        </td>
                        <td className="reports-table-mobile-hide" style={{ padding: "0.85rem 1rem" }}>
                          <span style={{ color: "var(--muted)" }}>KES {prop.expected.toLocaleString()}</span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span className="font-serif" style={{ fontWeight: 600, color: prop.expected - prop.collected > 0 ? "var(--rust)" : "var(--green)" }}>
                            KES {Math.max(0, prop.expected - prop.collected).toLocaleString()}
                          </span>
                        </td>
                        <td className="reports-table-mobile-hide" style={{ padding: "0.85rem 1rem" }}>
                          <div className="flex items-center" style={{ gap: "0.5rem" }}>
                            <div style={{ flex: 1, background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden", minWidth: "60px" }}>
                              <div style={{
                                width: `${prop.rate}%`, height: "100%",
                                background: prop.rate >= 100 ? "var(--green)" : prop.rate >= 50 ? "var(--gold)" : "var(--rust)",
                                borderRadius: "4px",
                              }} />
                            </div>
                            <span className="font-serif" style={{
                              fontSize: "0.85rem", fontWeight: 600,
                              color: prop.rate >= 100 ? "var(--green)" : prop.rate >= 50 ? "var(--gold)" : "var(--rust)",
                            }}>
                              {prop.rate}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          <div className="flex items-center" style={{ gap: "0.3rem" }}>
                            <button
                              onClick={() => setExpandedProperty(isExpanded ? null : prop.name)}
                              title={`Preview ${prop.name} tenants`}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "4px", color: isExpanded ? "var(--gold)" : "var(--muted)", display: "flex", alignItems: "center" }}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              onClick={() => downloadPropertyReport(prop.name)}
                              title={`Download ${prop.name} report`}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "4px", color: "var(--ink)", display: "flex", alignItems: "center" }}
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => sendPropertyWhatsApp(prop.name)}
                              title={`Send ${prop.name} report via WhatsApp`}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "4px", color: "#25D366", display: "flex", alignItems: "center" }}
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ padding: 0 }}>
                            <div style={{ background: "var(--cream)", borderBottom: i < reportData.propertyBreakdown.length - 1 ? "1px solid var(--warm)" : "none" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                                <thead>
                                  <tr style={{ borderBottom: "1px solid rgba(200,150,62,0.15)" }}>
                                    {[
                                      { label: "#", hide: true },
                                      { label: "Tenant", hide: false },
                                      { label: "Unit", hide: true },
                                      { label: "Rent (KES)", hide: false },
                                      { label: "Status", hide: false },
                                      { label: "Payment Date", hide: true },
                                      { label: "Channel", hide: true },
                                    ].map((h) => (
                                      <th key={h.label} className={h.hide ? "reports-table-mobile-hide" : ""} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", fontWeight: 600 }}>
                                        {h.label}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {propertyTenants.map((t, ti) => {
                                    const isExternal = t.notes && /kcb/i.test(t.notes);
                                    return (
                                      <tr key={t.name + ti} style={{ borderBottom: ti < propertyTenants.length - 1 ? "1px solid rgba(200,150,62,0.1)" : "none" }}>
                                        <td className="reports-table-mobile-hide" style={{ padding: "0.6rem 1rem", color: "var(--muted)" }}>{ti + 1}</td>
                                        <td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>{t.name}</td>
                                        <td className="reports-table-mobile-hide" style={{ padding: "0.6rem 1rem", color: "var(--muted)" }}>{t.unit || "—"}</td>
                                        <td style={{ padding: "0.6rem 1rem" }}>KES {t.amount.toLocaleString()}</td>
                                        <td style={{ padding: "0.6rem 1rem" }}>
                                          <span className="status-pill" style={{
                                            background: t.status === "paid" ? "var(--green-light)" : t.status === "pending" ? "var(--gold-light)" : "var(--red-light)",
                                            color: t.status === "paid" ? "var(--green)" : t.status === "pending" ? "var(--gold)" : "var(--rust)",
                                          }}>
                                            {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                          </span>
                                        </td>
                                        <td className="reports-table-mobile-hide" style={{ padding: "0.6rem 1rem", fontSize: "0.75rem", color: "var(--muted)" }}>{t.date}</td>
                                        <td className="reports-table-mobile-hide" style={{ padding: "0.6rem 1rem" }}>
                                          {isExternal ? (
                                            <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", fontSize: "0.65rem", fontWeight: 600, borderRadius: "3px", background: "#fff3e0", color: "#e65100", border: "1px solid #ffcc80" }}>
                                              KCB
                                            </span>
                                          ) : t.status === "paid" ? (
                                            <span style={{ fontSize: "0.7rem", color: "var(--green)" }}>Our A/C</span>
                                          ) : null}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {/* Reconciliation footer */}
                              {(prop.paidToExternal || 0) > 0 && (
                                <div style={{ padding: "0.6rem 1rem", background: "#fff8e1", borderTop: "1px solid #ffcc80", fontSize: "0.75rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                  <span style={{ color: "#e65100", fontWeight: 600 }}>Reconciliation:</span>
                                  <span>Received in our A/C: <strong style={{ color: "var(--green)" }}>KES {(prop.receivedInAccount || 0).toLocaleString()}</strong></span>
                                  <span>Paid to KCB (old A/C): <strong style={{ color: "#e65100" }}>KES {(prop.paidToExternal || 0).toLocaleString()}</strong></span>
                                </div>
                              )}
                              <div style={{ padding: "0.6rem 1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                <button
                                  onClick={() => downloadPropertyReport(prop.name)}
                                  className="flex items-center"
                                  style={{ gap: "0.3rem", background: "var(--ink)", color: "var(--cream)", border: "none", padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderRadius: "4px", cursor: "pointer" }}
                                >
                                  <Download size={12} /> Download PDF
                                </button>
                                <button
                                  onClick={() => sendPropertyWhatsApp(prop.name)}
                                  className="flex items-center"
                                  style={{ gap: "0.3rem", background: "#25D366", color: "#fff", border: "none", padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderRadius: "4px", cursor: "pointer" }}
                                >
                                  <Send size={12} /> WhatsApp
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {/* Totals row */}
                {(() => {
                  const totals = reportData.propertyBreakdown.reduce((acc, p) => ({
                    tenantsPaid: acc.tenantsPaid + p.tenantsPaid,
                    totalTenants: acc.totalTenants + p.totalTenants,
                    collected: acc.collected + p.collected,
                    expected: acc.expected + p.expected,
                  }), { tenantsPaid: 0, totalTenants: 0, collected: 0, expected: 0 });
                  const totalRate = totals.expected > 0 ? Math.round((totals.collected / totals.expected) * 100) : 0;
                  return (
                    <tr style={{ background: "var(--cream)", fontWeight: 600 }}>
                      <td style={{ padding: "0.85rem 1rem" }}>Total</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{totals.tenantsPaid} / {totals.totalTenants}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span className="font-serif" style={{ color: "var(--green)" }}>KES {totals.collected.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>KES {totals.expected.toLocaleString()}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span className="font-serif" style={{ color: totals.expected - totals.collected > 0 ? "var(--rust)" : "var(--green)" }}>
                          KES {Math.max(0, totals.expected - totals.collected).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span className="font-serif" style={{ color: totalRate >= 100 ? "var(--green)" : totalRate >= 50 ? "var(--gold)" : "var(--rust)" }}>
                          {totalRate}%
                        </span>
                      </td>
                      <td></td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Income Overview Bar Chart */}
      <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Income Overview
          </h3>
        </div>
        <div style={{ padding: "1.5rem", height: "250px" }}>
          {reportData.incomeData.every((d) => d.collected === 0 && d.expected === 0) ? (
            <div className="flex flex-col items-center justify-center" style={{ height: "100%", color: "var(--muted)" }}>
              <BarChart3 size={32} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
              <span style={{ fontSize: "0.85rem" }}>No income data available</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.incomeData} barGap={2} barCategoryGap="20%">
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

      {/* Occupancy by Property + Collection Rate */}
      <div className="occupancy-grid" style={{ marginBottom: "1.5rem" }}>
        <div style={cardStyle}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Occupancy by Property</h3>
          </div>
          <div style={{ padding: "1rem 1.5rem" }}>
            {reportData.occupancyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                <Users size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                <span style={{ fontSize: "0.85rem" }}>No property data</span>
              </div>
            ) : (
              reportData.occupancyData.map((prop, i) => (
                <div key={prop.name} style={{ padding: "0.8rem 0", borderBottom: i < reportData.occupancyData.length - 1 ? "1px solid var(--warm)" : "none" }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{prop.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{prop.occupied}/{prop.total} units</span>
                  </div>
                  <div style={{ background: "var(--warm)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div style={{
                      width: `${prop.rate}%`, height: "100%",
                      background: prop.rate === 100 ? "var(--green)" : "var(--gold)",
                      borderRadius: "4px", transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--warm)" }}>
            <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Payment Collection Rate</h3>
          </div>
          <div style={{ padding: "1rem 1.5rem" }}>
            {reportData.collectionRates.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: "2rem", color: "var(--muted)" }}>
                <BarChart3 size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                <span style={{ fontSize: "0.85rem" }}>No collection data</span>
              </div>
            ) : (
              reportData.collectionRates.map((m, i) => (
                <div key={m.month} style={{ padding: "0.6rem 0", borderBottom: i < reportData.collectionRates.length - 1 ? "1px solid var(--warm)" : "none" }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.8rem" }}>{m.month}</span>
                    <span className="font-serif" style={{
                      fontSize: "0.85rem", fontWeight: 600,
                      color: m.rate >= 95 ? "var(--green)" : m.rate >= 90 ? "var(--gold)" : "var(--rust)",
                    }}>
                      {m.rate}%
                    </span>
                  </div>
                  <div style={{ background: "var(--warm)", borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                    <div style={{
                      width: `${m.rate}%`, height: "100%",
                      background: m.rate >= 95 ? "var(--green)" : m.rate >= 90 ? "var(--gold)" : "var(--rust)",
                      borderRadius: "4px",
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
