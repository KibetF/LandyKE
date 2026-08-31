import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addHeader, addFooter, addSectionTitle, COLORS } from "./pdf-theme";

interface RentStatementData {
  month: string;
  incomeData: { month: string; collected: number; expected: number }[];
  arrearsData: { tenant: string; property: string; unit: string; amount: number; days: number }[];
  collectionRate: number;
  totalCollected: number;
  totalExpected: number;
  receivedInAccount?: number;
  paidToExternal?: number;
}

export function generateRentStatement(data: RentStatementData) {
  const doc = new jsPDF();
  let y = addHeader(doc, "Monthly Rent Statement", data.month);

  // Summary box
  const summaryItems = [
    { label: "Total Collected", value: `KES ${data.totalCollected.toLocaleString()}`, color: COLORS.green },
    { label: "Total Expected", value: `KES ${data.totalExpected.toLocaleString()}`, color: COLORS.ink },
    { label: "Collection Rate", value: `${data.collectionRate}%`, color: COLORS.gold },
    { label: "Outstanding", value: `KES ${Math.max(0, data.totalExpected - data.totalCollected).toLocaleString()}`, color: COLORS.rust },
  ];

  const boxWidth = 40;
  const startX = 20;
  summaryItems.forEach((item, i) => {
    const x = startX + i * (boxWidth + 5);

    // Box background
    doc.setFillColor(...COLORS.cream);
    doc.roundedRect(x, y, boxWidth, 20, 2, 2, "F");

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.label.toUpperCase(), x + 4, y + 7);

    // Value
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...item.color);
    doc.text(item.value, x + 4, y + 15);
  });

  y += 30;

  // Account reconciliation note
  const hasExternal = (data.paidToExternal || 0) > 0;
  if (hasExternal) {
    doc.setFillColor(...COLORS.cream);
    doc.roundedRect(20, y, 170, 12, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(230, 81, 0);
    doc.text(
      `Received in our A/C: KES ${(data.receivedInAccount || 0).toLocaleString()}  |  Paid to old A/C (KCB): KES ${(data.paidToExternal || 0).toLocaleString()}`,
      25,
      y + 7.5
    );
    y += 16;
  }

  // Income trend table
  y = addSectionTitle(doc, "Income Trend — Last 6 Months", y);

  autoTable(doc, {
    startY: y,
    head: [["Month", "Collected", "Expected", "Rate"]],
    body: data.incomeData.map((d) => [
      d.month,
      `KES ${d.collected.toLocaleString()}`,
      `KES ${d.expected.toLocaleString()}`,
      d.expected > 0 ? `${Math.round((d.collected / d.expected) * 100)}%` : "—",
    ]),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.ink,
    },
    headStyles: {
      fillColor: COLORS.cream,
      textColor: COLORS.ink,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [250, 248, 244],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      3: { halign: "center" },
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Arrears table
  if (data.arrearsData.length > 0) {
    y = addSectionTitle(doc, "Outstanding Arrears", y);

    autoTable(doc, {
      startY: y,
      head: [["Tenant", "Property", "Unit", "Amount", "Days Overdue"]],
      body: data.arrearsData.map((d) => [
        d.tenant,
        d.property,
        d.unit,
        `KES ${d.amount.toLocaleString()}`,
        `${d.days} days`,
      ]),
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 4,
        textColor: COLORS.ink,
      },
      headStyles: {
        fillColor: COLORS.cream,
        textColor: COLORS.ink,
        fontStyle: "bold",
        fontSize: 7,
      },
      bodyStyles: {
        textColor: COLORS.rust,
      },
      columnStyles: {
        3: { fontStyle: "bold" },
        4: { halign: "center" },
      },
    });
  }

  // Add footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`LandyKE-Rent-Statement-${data.month.replace(/\s/g, "-")}.pdf`);
}

interface TenantPaymentReportData {
  month: string;
  tenants: {
    name: string;
    property: string;
    unit?: string;
    amount: number;
    date: string;
    status: "paid" | "pending" | "overdue" | "vacated_unpaid" | "partial";
    notes?: string;
  }[];
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  receivedInAccount?: number;
  paidToExternal?: number;
}

export function generateTenantPaymentReport(data: TenantPaymentReportData) {
  const doc = new jsPDF();
  let y = addHeader(doc, "Tenant Payment Report", data.month);

  // Summary boxes
  const paidCount = data.tenants.filter((t) => t.status === "paid").length;
  const partialCount = data.tenants.filter((t) => t.status === "partial").length;
  const overdueCount = data.tenants.filter((t) => t.status === "overdue").length;
  const pendingCount = data.tenants.filter((t) => t.status === "pending").length;
  const vacatedCount = data.tenants.filter((t) => t.status === "vacated_unpaid").length;

  const summaryItems: { label: string; value: string; color: [number, number, number] }[] = [
    { label: "Total Tenants", value: `${data.tenants.length}`, color: COLORS.ink },
    { label: "Paid", value: `${paidCount}`, color: COLORS.green },
    { label: "Partial", value: `${partialCount}`, color: [138, 90, 0] },
    { label: "Pending", value: `${pendingCount}`, color: COLORS.gold },
    { label: "Overdue", value: `${overdueCount}`, color: COLORS.rust },
  ];
  if (vacatedCount > 0) {
    summaryItems.push({ label: "Vacated Unpaid", value: `${vacatedCount}`, color: [107, 94, 94] });
  }

  const boxWidth = 40;
  const startX = 20;
  summaryItems.forEach((item, i) => {
    const x = startX + i * (boxWidth + 5);
    doc.setFillColor(...COLORS.cream);
    doc.roundedRect(x, y, boxWidth, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.label.toUpperCase(), x + 4, y + 7);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...item.color);
    doc.text(item.value, x + 4, y + 16);
  });

  y += 28;

  // Financial summary line
  const hasExternal = (data.paidToExternal || 0) > 0;
  const summaryHeight = hasExternal ? 20 : 12;
  doc.setFillColor(...COLORS.cream);
  doc.roundedRect(20, y, 170, summaryHeight, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(
    `Collected: KES ${data.totalCollected.toLocaleString()}  |  Expected: KES ${data.totalExpected.toLocaleString()}  |  Collection Rate: ${data.collectionRate}%`,
    25,
    y + 7.5
  );
  if (hasExternal) {
    doc.setFontSize(6.5);
    doc.setTextColor(230, 81, 0);
    doc.text(
      `Received in our A/C: KES ${(data.receivedInAccount || 0).toLocaleString()}  |  Paid to old A/C (KCB): KES ${(data.paidToExternal || 0).toLocaleString()}`,
      25,
      y + 15
    );
  }

  y += summaryHeight + 8;

  // Tenant payment table
  y = addSectionTitle(doc, "Payment Status by Tenant", y);

  autoTable(doc, {
    startY: y,
    head: [["#", "Tenant Name", "Property", "Unit", "Rent (KES)", "Status", "Payment Date", hasExternal ? "Channel" : ""].filter(Boolean)],
    body: data.tenants.map((t, i) => {
      const isKcb = t.notes && /kcb/i.test(t.notes);
      const row = [
        (i + 1).toString(),
        t.name,
        t.property,
        t.unit || "—",
        `KES ${t.amount.toLocaleString()}`,
        t.status === "vacated_unpaid" ? "Vacated - Unpaid" : t.status.charAt(0).toUpperCase() + t.status.slice(1),
        t.date,
      ];
      if (hasExternal) row.push(isKcb ? "KCB" : t.status === "paid" ? "Our A/C" : "");
      return row;
    }),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.ink,
    },
    headStyles: {
      fillColor: COLORS.cream,
      textColor: COLORS.ink,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [250, 248, 244],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { fontStyle: "bold" },
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "center" },
      ...(hasExternal ? { 7: { halign: "center", fontSize: 7 } } : {}),
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 5) {
        const val = (hookData.cell.raw as string).toLowerCase();
        if (val === "paid") {
          hookData.cell.styles.textColor = COLORS.green;
        } else if (val === "partial") {
          hookData.cell.styles.textColor = [138, 90, 0];
        } else if (val === "pending") {
          hookData.cell.styles.textColor = COLORS.gold;
        } else if (val === "vacated - unpaid") {
          hookData.cell.styles.textColor = [107, 94, 94];
        } else {
          hookData.cell.styles.textColor = COLORS.rust;
        }
        hookData.cell.styles.fontStyle = "bold";
      }
      // Color the Channel column
      if (hasExternal && hookData.section === "body" && hookData.column.index === 7) {
        const val = (hookData.cell.raw as string);
        if (val === "KCB") {
          hookData.cell.styles.textColor = [230, 81, 0];
          hookData.cell.styles.fontStyle = "bold";
        } else if (val === "Our A/C") {
          hookData.cell.styles.textColor = COLORS.green;
        }
      }
    },
  });

  // Add footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`LandyKE-Tenant-Payment-Report-${data.month.replace(/\s/g, "-")}.pdf`);
}

interface ClientMonthlyReportData {
  landlordName: string;
  month: string;
  collectedThisMonth: number;
  totalInAccount: number;
  openingBalance: number;
  openingBalanceAsOf: string | null;
  collectedSinceOpening: number;
  excludedThisMonth: number;
  properties: { name: string; payments: number; collected: number }[];
}

/**
 * End-of-month statement sent to a client. Two headline figures — what came in
 * this month and what has come in altogether — plus the per-property split that
 * adds up to the first. Sent alongside a bank statement, so every figure is
 * cash actually received into the LandyKE account.
 */
export function generateClientMonthlyReport(data: ClientMonthlyReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = addHeader(doc, "Monthly Statement", `${data.landlordName} · ${data.month}`);

  // Two headline figures, given the full width so they read as the point of
  // the document rather than as one tile among many.
  const headline: { label: string; value: string; color: [number, number, number] }[] = [
    { label: `Collected in ${data.month.split(" ")[0]}`, value: `KES ${data.collectedThisMonth.toLocaleString()}`, color: COLORS.green },
    { label: "Total in our account", value: `KES ${data.totalInAccount.toLocaleString()}`, color: COLORS.ink },
  ];
  const boxWidth = (pageWidth - 40 - 6) / 2;
  headline.forEach((item, i) => {
    const x = 20 + i * (boxWidth + 6);
    doc.setFillColor(...COLORS.cream);
    doc.roundedRect(x, y, boxWidth, 26, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.label.toUpperCase(), x + 6, y + 9);
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...item.color);
    doc.text(item.value, x + 6, y + 20);
  });
  y += 36;

  // Per-property split. Totals row must equal the headline above it.
  y = addSectionTitle(doc, "Where it came from", y);
  autoTable(doc, {
    startY: y,
    head: [["Property", "Payments", "Collected"]],
    body: [
      ...data.properties.map((p) => [p.name, `${p.payments}`, `KES ${p.collected.toLocaleString()}`]),
      ["Total", `${data.properties.reduce((s, p) => s + p.payments, 0)}`, `KES ${data.collectedThisMonth.toLocaleString()}`],
    ],
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: COLORS.ink },
    headStyles: { fillColor: COLORS.cream, textColor: COLORS.ink, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: [250, 248, 244] },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "center" },
      2: { halign: "right" },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.row.index === data.properties.length) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = COLORS.cream;
      }
    },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Show the client how the lifetime total is built, so it can be checked
  // against the bank statement rather than taken on trust.
  y = addSectionTitle(doc, "How the account total is made up", y);
  const asOf = data.openingBalanceAsOf
    ? new Date(data.openingBalanceAsOf).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
    : null;
  autoTable(doc, {
    startY: y,
    body: [
      [asOf ? `Opening balance (to ${asOf})` : "Opening balance", `KES ${data.openingBalance.toLocaleString()}`],
      [asOf ? `Received since ${asOf}` : "Received since", `KES ${data.collectedSinceOpening.toLocaleString()}`],
      ["Total in our account", `KES ${data.totalInAccount.toLocaleString()}`],
    ],
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: COLORS.ink },
    columnStyles: { 0: {}, 1: { halign: "right" } },
    didParseCell: (hookData) => {
      if (hookData.row.index === 2) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = COLORS.cream;
      }
    },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Only footnote the exclusion when there is something to explain.
  if (data.excludedThisMonth > 0) {
    doc.setFillColor(...COLORS.cream);
    doc.roundedRect(20, y, pageWidth - 40, 12, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(230, 81, 0);
    doc.text(
      `Excludes KES ${data.excludedThisMonth.toLocaleString()} paid directly into the KCB account this month, which did not reach the LandyKE account.`,
      25,
      y + 7.5
    );
    y += 16;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text("All figures are money received into the LandyKE collection account. Please read alongside the bank statement.", 20, y + 4);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`LandyKE-Monthly-Statement-${data.landlordName.split(" ")[0]}-${data.month.replace(/\s/g, "-")}.pdf`);
}

interface PropertySummaryData {
  month: string;
  occupancyData: { name: string; total: number; occupied: number; rate: number }[];
  incomeData: { month: string; collected: number; expected: number }[];
  arrearsData: { tenant: string; property: string; unit: string; amount: number; days: number }[];
}

export function generatePropertySummary(data: PropertySummaryData) {
  const doc = new jsPDF();
  let y = addHeader(doc, "Property Performance Summary", data.month);

  // Property occupancy table
  y = addSectionTitle(doc, "Property Occupancy", y);

  autoTable(doc, {
    startY: y,
    head: [["Property", "Total Units", "Occupied", "Vacancy", "Occupancy Rate"]],
    body: data.occupancyData.map((d) => [
      d.name,
      d.total.toString(),
      d.occupied.toString(),
      (d.total - d.occupied).toString(),
      `${d.rate}%`,
    ]),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.ink,
    },
    headStyles: {
      fillColor: COLORS.cream,
      textColor: COLORS.ink,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [250, 248, 244],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      4: { halign: "center" },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 4) {
        const rate = parseInt(hookData.cell.raw as string);
        if (rate === 100) {
          hookData.cell.styles.textColor = COLORS.green;
        } else if (rate >= 90) {
          hookData.cell.styles.textColor = COLORS.gold;
        } else {
          hookData.cell.styles.textColor = COLORS.rust;
        }
        hookData.cell.styles.fontStyle = "bold";
      }
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Totals row
  const totalUnits = data.occupancyData.reduce((s, d) => s + d.total, 0);
  const totalOccupied = data.occupancyData.reduce((s, d) => s + d.occupied, 0);
  const overallRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

  doc.setFillColor(...COLORS.cream);
  doc.roundedRect(20, y - 4, 170, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.ink);
  doc.text(`Total: ${totalUnits} units across ${data.occupancyData.length} properties`, 25, y + 3);
  doc.text(`Occupied: ${totalOccupied}  |  Vacant: ${totalUnits - totalOccupied}  |  Rate: ${overallRate}%`, 25, y + 9);

  y += 22;

  // 6-month income trend
  y = addSectionTitle(doc, "6-Month Income Trend", y);

  autoTable(doc, {
    startY: y,
    head: [["Month", "Collected", "Expected", "Collection Rate"]],
    body: data.incomeData.map((d) => [
      d.month,
      `KES ${d.collected.toLocaleString()}`,
      `KES ${d.expected.toLocaleString()}`,
      d.expected > 0 ? `${Math.round((d.collected / d.expected) * 100)}%` : "—",
    ]),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.ink,
    },
    headStyles: {
      fillColor: COLORS.cream,
      textColor: COLORS.ink,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [250, 248, 244],
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Arrears section
  if (data.arrearsData.length > 0) {
    y = addSectionTitle(doc, "Current Arrears", y);

    autoTable(doc, {
      startY: y,
      head: [["Tenant", "Property", "Unit", "Amount Owed", "Days Overdue"]],
      body: data.arrearsData.map((d) => [
        d.tenant,
        d.property,
        d.unit,
        `KES ${d.amount.toLocaleString()}`,
        `${d.days} days`,
      ]),
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 4,
        textColor: COLORS.rust,
      },
      headStyles: {
        fillColor: [253, 240, 240],
        textColor: COLORS.rust,
        fontStyle: "bold",
        fontSize: 7,
      },
    });
  }

  // Add footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`LandyKE-Property-Summary-${data.month.replace(/\s/g, "-")}.pdf`);
}
