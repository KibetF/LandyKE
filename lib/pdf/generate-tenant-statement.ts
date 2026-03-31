import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addHeader, addFooter, addSectionTitle, COLORS } from "./pdf-theme";

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
  method: string;
  status: string;
}

export function generateTenantRentStatement(tenant: TenantInfo, payments: PaymentRow[]) {
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

  // Payment history table
  y = addSectionTitle(doc, "Payment History", y);

  const tableData = payments.map((p, i) => [
    String(i + 1),
    p.paid_date
      ? new Date(p.paid_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    `KES ${p.amount.toLocaleString("en-KE")}`,
    p.method,
    p.status.charAt(0).toUpperCase() + p.status.slice(1),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Date", "Amount", "Method", "Status"]],
    body: tableData,
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
    alternateRowStyles: {
      fillColor: [250, 248, 244],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { halign: "right" },
    },
  });

  // Balance summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || y + 20;
  let summaryY = finalY + 10;

  summaryY = addSectionTitle(doc, "Summary", summaryY);

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const totalPayments = payments.filter((p) => p.status === "paid").length;

  const summaryRows = [
    ["Total Payments Made", String(totalPayments)],
    ["Total Amount Paid", `KES ${totalPaid.toLocaleString("en-KE")}`],
    ["Monthly Rent", `KES ${tenant.rent_amount.toLocaleString("en-KE")}`],
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  summaryRows.forEach(([label, value]) => {
    doc.setTextColor(...COLORS.muted);
    doc.text(label + ":", 20, summaryY);
    doc.setTextColor(...COLORS.ink);
    doc.text(value, 80, summaryY);
    summaryY += 5.5;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`Rent_Statement_${tenant.full_name.replace(/\s+/g, "_")}.pdf`);
}
