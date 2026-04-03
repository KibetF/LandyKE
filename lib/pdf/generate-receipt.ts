import jsPDF from "jspdf";
import { addFooter, COLORS } from "./pdf-theme";

export interface ReceiptData {
  receiptNumber: string;
  tenantName: string;
  propertyName: string;
  propertyLocation: string | null;
  unitNumber: string | null;
  amount: number;
  paidDate: string;
  dueDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
}

function extractMethodAndNotes(raw: string | null): { method: string; cleanNotes: string | null } {
  if (!raw) return { method: "—", cleanNotes: null };
  const parts = raw.split(" — ");
  return {
    method: parts[0] || "—",
    cleanNotes: parts.length > 1 ? parts.slice(1).join(" — ") : null,
  };
}

function getPeriodCovered(dueDate: string | null, paidDate: string): string {
  const dateStr = dueDate || paidDate;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
}

function buildReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const { method, cleanNotes } = extractMethodAndNotes(data.paymentMethod);
  const period = getPeriodCovered(data.dueDate, data.paidDate);

  // ── HEADER BAND (cream background) ──────────────────────────────
  doc.setFillColor(...COLORS.cream);
  doc.rect(0, 0, pageWidth, 48, "F");

  // LandyKE logo (left)
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.setTextColor(...COLORS.ink);
  doc.text("LandyKE", 20, 22);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("Property Management, Simplified", 20, 29);

  // Receipt number (top-right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.gold);
  doc.text("RECEIPT NO.", pageWidth - 20, 14, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(data.receiptNumber, pageWidth - 20, 20, { align: "right" });

  // "PAYMENT RECEIPT" centered title
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.ink);
  doc.text("PAYMENT RECEIPT", pageWidth / 2, 40, { align: "center" });

  // Gold divider
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1.5);
  doc.line(20, 47, pageWidth - 20, 47);

  // ── AMOUNT HERO BAND (greenLight background) ─────────────────────
  doc.setFillColor(...COLORS.greenLight);
  doc.rect(0, 50, pageWidth, 36, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.sage);
  const amountLabel = "AMOUNT PAID";
  doc.text(amountLabel, pageWidth / 2, 59, { align: "center" });

  // Thin underline under label
  const labelW = doc.getTextWidth(amountLabel);
  doc.setDrawColor(...COLORS.sage);
  doc.setLineWidth(0.2);
  doc.line(pageWidth / 2 - labelW / 2, 60.5, pageWidth / 2 + labelW / 2, 60.5);

  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.setTextColor(...COLORS.green);
  doc.text(`KES ${data.amount.toLocaleString()}`, pageWidth / 2, 74, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.sage);
  doc.text(period, pageWidth / 2, 82, { align: "center" });

  // ── GOLD SEPARATOR ───────────────────────────────────────────────
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(20, 92, pageWidth - 20, 92);

  // ── TWO-COLUMN DETAILS GRID ──────────────────────────────────────
  const col1X = 20;
  const col2X = pageWidth / 2 + 10;
  let y = 102;

  // Column section headings
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.ink);
  doc.text("TENANT DETAILS", col1X, y);
  doc.text("PAYMENT DETAILS", col2X, y);

  // Gold underlines on headings
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.4);
  doc.line(col1X, y + 1.5, col1X + doc.getTextWidth("TENANT DETAILS"), y + 1.5);
  doc.line(col2X, y + 1.5, col2X + doc.getTextWidth("PAYMENT DETAILS"), y + 1.5);

  y += 9;

  const rowH = 8;

  // Left column — tenant details
  const tenantRows: [string, string][] = [
    ["Name", data.tenantName],
    ["Property", data.propertyName],
  ];
  if (data.unitNumber) tenantRows.push(["Unit", data.unitNumber]);
  if (data.propertyLocation) tenantRows.push(["Location", data.propertyLocation]);

  // Right column — payment details
  const paymentRows: [string, string][] = [
    ["Date", formatDate(data.paidDate)],
    ["Period", period],
    ["Method", method],
  ];
  if (cleanNotes) paymentRows.push(["Notes", cleanNotes]);

  const maxRows = Math.max(tenantRows.length, paymentRows.length);
  for (let i = 0; i < maxRows; i++) {
    const rowY = y + i * rowH;

    // Left row
    if (tenantRows[i]) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.muted);
      doc.text(tenantRows[i][0], col1X, rowY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.ink);
      const maxW = pageWidth / 2 - col1X - 5;
      const value = doc.splitTextToSize(tenantRows[i][1], maxW)[0];
      doc.text(value, col1X, rowY + 4.5);
    }

    // Right row
    if (paymentRows[i]) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.muted);
      doc.text(paymentRows[i][0], col2X, rowY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.ink);
      const maxW = pageWidth - col2X - 20;
      const value = doc.splitTextToSize(paymentRows[i][1], maxW)[0];
      doc.text(value, col2X, rowY + 4.5);
    }
  }

  // ── PAID STAMP ───────────────────────────────────────────────────
  const stampY = y + maxRows * rowH + 12;
  const stampW = 56;
  const stampH = 20;
  const stampX = (pageWidth - stampW) / 2;

  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(1.5);
  doc.roundedRect(stampX, stampY, stampW, stampH, 3, 3, "S");

  // Inner decorative lines
  doc.setLineWidth(0.3);
  doc.line(stampX + 5, stampY + 4.5, stampX + stampW - 5, stampY + 4.5);
  doc.line(stampX + 5, stampY + stampH - 4.5, stampX + stampW - 5, stampY + stampH - 4.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.green);
  doc.text("PAID", pageWidth / 2, stampY + stampH / 2 + 4, { align: "center" });

  // ── CONFIRMATION TEXT ────────────────────────────────────────────
  const confirmY = stampY + stampH + 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  const confirmText = `This receipt confirms payment of KES ${data.amount.toLocaleString()} for ${period} rent at ${data.propertyName}.`;
  doc.text(confirmText, pageWidth / 2, confirmY, { align: "center", maxWidth: pageWidth - 60 });

  // ── FOOTER ───────────────────────────────────────────────────────
  addFooter(doc, 1, 1);

  return doc;
}

export function generateReceiptNumber(paymentId: string, paidDate: string): string {
  const d = new Date(paidDate + "T00:00:00");
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = paymentId.slice(-4);
  return `RCP-${dateStr}-${suffix}`;
}

export function generateReceipt(data: ReceiptData) {
  const doc = buildReceipt(data);
  doc.save(`LandyKE-Receipt-${data.receiptNumber}.pdf`);
}

export function generateReceiptBlob(data: ReceiptData): Blob {
  const doc = buildReceipt(data);
  return doc.output("blob");
}
