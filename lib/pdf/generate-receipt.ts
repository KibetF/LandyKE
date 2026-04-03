import jsPDF from "jspdf";
import { COLORS } from "./pdf-theme";

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
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function drawCheckmark(doc: jsPDF, cx: number, cy: number, r: number) {
  // Circle
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, r, "S");
  // Checkmark lines
  doc.setLineWidth(0.9);
  doc.line(cx - r * 0.45, cy, cx - r * 0.1, cy + r * 0.4);
  doc.line(cx - r * 0.1, cy + r * 0.4, cx + r * 0.5, cy - r * 0.35);
}

function buildReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const { method, cleanNotes } = extractMethodAndNotes(data.paymentMethod);
  const period = getPeriodCovered(data.dueDate, data.paidDate);

  // ── CREAM HEADER BAND ────────────────────────────────────────────
  doc.setFillColor(...COLORS.cream);
  doc.rect(0, 0, pageWidth, 55, "F");

  // LandyKE logo (left, ink)
  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.ink);
  doc.text("LandyKE", marginX, 20);

  // Tagline (left, muted)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.muted);
  doc.text("Property Management, Simplified", marginX, 27);

  // Document type label (right, muted)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text("DOCUMENT TYPE", pageWidth - marginX, 14, { align: "right" });

  // "Payment Receipt" italic gold (right)
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.gold);
  doc.text("Payment Receipt", pageWidth - marginX, 23, { align: "right" });

  // Dashed separator
  doc.setDrawColor(...COLORS.warm);
  doc.setLineWidth(0.2);
  const dashW = 3, gapW = 2;
  let dx = marginX;
  while (dx < pageWidth - marginX) {
    doc.line(dx, 32, Math.min(dx + dashW, pageWidth - marginX), 32);
    dx += dashW + gapW;
  }

  // Two-column meta: RECEIPT NO. + DATE PAID
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text("RECEIPT NO.", marginX, 40);
  doc.text("DATE PAID", pageWidth / 2 + 5, 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(data.receiptNumber, marginX, 47);
  doc.text(formatDate(data.paidDate), pageWidth / 2 + 5, 47);

  // PROPERTY + PERIOD labels
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text("PROPERTY", marginX, 52);
  doc.text("PERIOD", pageWidth / 2 + 5, 52);

  // Property name + period values (ink, just below labels — inside cream band)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.ink);
  doc.text(data.propertyName, marginX, 58);
  doc.text(period, pageWidth / 2 + 5, 58);

  // Gold divider below header
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1);
  doc.line(0, 62, pageWidth, 62);

  // ── GREEN STATUS BAND ─────────────────────────────────────────────
  doc.setFillColor(...COLORS.green);
  doc.rect(0, 62, pageWidth, 26, "F");

  // Checkmark circle
  const ckCX = marginX + 8;
  const ckCY = 75;
  drawCheckmark(doc, ckCX, ckCY, 5.5);

  // STATUS label
  const textX = marginX + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(232, 244, 238);
  doc.text("STATUS", textX, 69);

  // Payment Received
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.cream);
  doc.text("Payment Received", textX, 77);

  // Tenant · Unit
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(232, 244, 238);
  const unitStr = data.unitNumber ? ` · Unit ${data.unitNumber}` : "";
  doc.text(`${data.tenantName}${unitStr}`, textX, 84);

  // ── AMOUNT SECTION (greenLight background) ────────────────────────
  doc.setFillColor(...COLORS.greenLight);
  doc.rect(0, 88, pageWidth, 38, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.sage);
  doc.text("AMOUNT PAID", pageWidth / 2, 98, { align: "center" });

  // Underline label
  const lblW = doc.getTextWidth("AMOUNT PAID");
  doc.setDrawColor(...COLORS.sage);
  doc.setLineWidth(0.2);
  doc.line(pageWidth / 2 - lblW / 2, 99.5, pageWidth / 2 + lblW / 2, 99.5);

  // KES amount — split "KES" smaller and number larger
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.green);
  const kesLabel = "KES ";
  const amountStr = data.amount.toLocaleString();
  const kesW = doc.getTextWidth(kesLabel);
  doc.setFontSize(36);
  const numW = doc.getTextWidth(amountStr);
  doc.setFontSize(16);
  const totalW16 = doc.getTextWidth(kesLabel);
  const combinedX = pageWidth / 2 - (totalW16 + numW) / 2;
  doc.text(kesLabel, combinedX, 115);
  doc.setFontSize(36);
  doc.text(amountStr, combinedX + kesW, 115);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.sage);
  doc.text(period, pageWidth / 2, 122, { align: "center" });

  // ── TRANSACTION DETAILS ───────────────────────────────────────────
  let y = 136;

  // Section heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("TRANSACTION DETAILS", marginX, y);

  // Gold underline
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(marginX, y + 1.5, marginX + doc.getTextWidth("TRANSACTION DETAILS"), y + 1.5);

  y += 8;

  const rows: [string, string][] = [
    ["Tenant", data.tenantName],
    ["Property", data.propertyName],
  ];
  if (data.unitNumber) rows.push(["Unit", data.unitNumber]);
  if (data.propertyLocation) rows.push(["Location", data.propertyLocation]);
  rows.push(["Date Paid", formatDate(data.paidDate)]);
  rows.push(["Period", period]);
  rows.push(["Payment Method", method]);
  if (cleanNotes) rows.push(["Reference", cleanNotes]);

  const rowH = 11;
  for (let i = 0; i < rows.length; i++) {
    const ry = y + i * rowH;

    // Subtle alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(...COLORS.cream);
      doc.rect(marginX - 2, ry - 4, pageWidth - marginX * 2 + 4, rowH, "F");
    }

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(rows[i][0], marginX, ry + 2);

    // Value (right-aligned, bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(rows[i][1], pageWidth - marginX, ry + 2, { align: "right" });

    // Separator line
    doc.setDrawColor(...COLORS.warm);
    doc.setLineWidth(0.2);
    doc.line(marginX, ry + rowH - 1, pageWidth - marginX, ry + rowH - 1);
  }

  // ── PAID STAMP ────────────────────────────────────────────────────
  const stampY = y + rows.length * rowH + 14;
  const stampW = 60;
  const stampH = 22;
  const stampX = (pageWidth - stampW) / 2;

  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(1.8);
  doc.roundedRect(stampX, stampY, stampW, stampH, 3, 3, "S");

  doc.setLineWidth(0.35);
  doc.line(stampX + 6, stampY + 5, stampX + stampW - 6, stampY + 5);
  doc.line(stampX + 6, stampY + stampH - 5, stampX + stampW - 6, stampY + stampH - 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.green);
  doc.text("PAID", pageWidth / 2, stampY + stampH / 2 + 4.5, { align: "center" });

  // ── FOOTER ────────────────────────────────────────────────────────
  const footerY = pageHeight - 32;

  // Dashed top border (warm color, subtle)
  doc.setDrawColor(...COLORS.warm);
  doc.setLineWidth(0.3);
  let fx = marginX;
  while (fx < pageWidth - marginX) {
    doc.line(fx, footerY, Math.min(fx + 3, pageWidth - marginX), footerY);
    fx += 5;
  }

  // "LandyKE · Eldoret, Kenya"
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.ink);
  doc.text("LandyKE · Eldoret, Kenya", pageWidth / 2, footerY + 8, { align: "center" });

  // "landyke.com · Registered Property Managers"
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.muted);
  doc.text("Registered Property Managers", pageWidth / 2, footerY + 14, { align: "center" });

  // Phone number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("Tel:", pageWidth / 2 - 18, footerY + 21);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.ink);
  doc.text("+254 722 338 510", pageWidth / 2 - 10, footerY + 21);

  // Generation date (very small, bottom-right)
  const genDate = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Generated ${genDate}`, pageWidth - marginX, footerY + 21, { align: "right" });

  return doc;
}

export function generateReceiptNumber(paymentId: string, paidDate: string): string {
  const d = new Date(paidDate + "T00:00:00");
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = paymentId.slice(-4).toUpperCase();
  return `LK-RCP-${dateStr}-${suffix}`;
}

export function generateReceipt(data: ReceiptData) {
  const doc = buildReceipt(data);
  doc.save(`LandyKE-Receipt-${data.receiptNumber}.pdf`);
}

export function generateReceiptBlob(data: ReceiptData): Blob {
  const doc = buildReceipt(data);
  return doc.output("blob");
}
