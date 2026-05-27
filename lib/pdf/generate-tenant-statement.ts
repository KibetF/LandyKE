import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addHeader, addFooter, addSectionTitle, COLORS } from "./pdf-theme";
import type { TenantPaymentSummary } from "@/types";
import { periodOf } from "@/lib/queries";

interface TenantInfo {
  full_name: string;
  unit_number: string | null;
  rent_amount: number;
  property_name: string;
  property_location: string | null;
}

interface PaymentRow {
  amount: number;
  paid_date: string | null;
  rent_period: string | null;
  method: string;
  status: string;
  payment_type?: string | null;
}

export function generateTenantRentStatement(
  tenant: TenantInfo,
  payments: PaymentRow[],
  summary: TenantPaymentSummary
) {
  const doc = new jsPDF();

  let y = addHeader(doc, "Rent Statement", tenant.full_name);

  // Tenant details
  y = addSectionTitle(doc, "Tenant Details", y);

  const details = [
    ["Name", tenant.full_name],
    ["Property", tenant.property_name],
    ["Unit", tenant.unit_number || "—"],
    ["Monthly Rent", `KES ${tenant.rent_amount.toLocaleString("en-KE")}`],
  ];
  if (tenant.property_location) {
    details.push(["Location", tenant.property_location]);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  details.forEach(([label, value]) => {
    doc.setTextColor(...COLORS.muted);
    doc.text(label + ":", 20, y);
    doc.setTextColor(...COLORS.ink);
    doc.text(value, 65, y);
    y += 5.5;
  });

  y += 6;

  // Account summary
  y = addSectionTitle(doc, "Account Summary", y);
  const balanceLabel = summary.netPosition >= 0 ? "Credit Balance" : "Amount Owed";
  const balanceValue = `KES ${Math.abs(summary.netPosition).toLocaleString("en-KE")}`;
  const summaryRows = [
    [balanceLabel, balanceValue],
    ["Total Outstanding", `KES ${summary.totalOutstanding.toLocaleString("en-KE")}`],
    ["Credit / Advance", `KES ${summary.carriedCredit.toLocaleString("en-KE")}`],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  summaryRows.forEach(([label, value]) => {
    doc.setTextColor(...COLORS.muted);
    doc.text(label + ":", 20, y);
    doc.setTextColor(...COLORS.ink);
    doc.text(value, 80, y);
    y += 5.5;
  });

  y += 6;

  // Month-by-month ledger
  y = addSectionTitle(doc, "Month-by-Month Ledger", y);
  const ledgerRows = [...summary.perMonth].sort((a, b) => (a.period < b.period ? 1 : -1));
  const ledgerData = ledgerRows.map((row) => {
    const balanceText = row.balance > 0
      ? `KES ${row.balance.toLocaleString("en-KE")}`
      : row.balance < 0
        ? `+KES ${(-row.balance).toLocaleString("en-KE")}`
        : "—";
    return [
      row.periodLabel,
      `KES ${row.expected.toLocaleString("en-KE")}`,
      `KES ${row.paid.toLocaleString("en-KE")}`,
      balanceText,
      row.status.charAt(0).toUpperCase() + row.status.slice(1),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Period", "Expected", "Paid", "Balance", "Status"]],
    body: ledgerData,
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      textColor: COLORS.ink,
      lineColor: COLORS.warm,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: COLORS.cream,
      textColor: COLORS.ink,
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [250, 248, 244] },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  // Payment events history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nextY = (doc as any).lastAutoTable?.finalY || y + 20;
  nextY += 10;

  if (payments.length > 0) {
    nextY = addSectionTitle(doc, "Payment Events", nextY);
    const eventData = payments
      .filter((p) => !p.payment_type || p.payment_type === "rent")
      .map((p, i) => [
        String(i + 1),
        p.paid_date
          ? new Date(p.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
          : "—",
        `KES ${p.amount.toLocaleString("en-KE")}`,
        p.method,
        periodOf(p) || "—",
        p.status.charAt(0).toUpperCase() + p.status.slice(1),
      ]);

    autoTable(doc, {
      startY: nextY,
      head: [["#", "Paid Date", "Amount", "Method", "For Period", "Status"]],
      body: eventData,
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 3,
        textColor: COLORS.ink,
        lineColor: COLORS.warm,
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: COLORS.cream,
        textColor: COLORS.ink,
        fontStyle: "bold",
        fontSize: 7.5,
      },
      alternateRowStyles: { fillColor: [250, 248, 244] },
      columnStyles: {
        0: { cellWidth: 12 },
        2: { halign: "right" },
      },
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`Rent_Statement_${tenant.full_name.replace(/\s+/g, "_")}.pdf`);
}
