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

  // ── DARK HEADER BAND ─────────────────────────────────────────────
  doc.setFillColor(...COLORS.ink);
  doc.rect(0, 0, pageWidth, 58, "F");

  // LandyKE logo (left, cream)
  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.cream);
  doc.text("LandyKE", marginX, 20);

  // Tagline (left, muted gold)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.goldLight);
  doc.text("Property Management, Simplified", marginX, 27);

  // Document type label (right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text("DOCUMENT TYPE", pageWidth - marginX, 14, { align: "right" });

  // "Payment Receipt" italic gold (right)
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.gold);
  doc.text("Payment Receipt", pageWidth - marginX, 23, { align: "right" });

  // Dashed separator inside header
  doc.setDrawColor(...COLORS.muted);
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
  doc.setTextColor(...COLORS.cream);
  doc.text(data.receiptNumber, marginX, 47);
  doc.text(formatDate(data.paidDate), pageWidth / 2 + 5, 47);

  // PROPERTY + PERIOD
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text("PROPERTY", marginX, 54);
  doc.text("PERIOD", pageWidth / 2 + 5, 54);

  // We'll render property name and period just below the band
  // (they overlap slightly into the next section so we skip them inside the dark band)

  // ── GREEN STATUS BAND ─────────────────────────────────────────────
  doc.setFillColor(...COLORS.green);
  doc.rect(0, 58, pageWidth, 26, "F");

  // Property name (bottom of dark band / top of green — rendered over green)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.cream);
  // Actually render these inside the dark band at y=57 — adjust
  // Let's put PROPERTY value at y=57 inside dark band
  // Re-render cleanly:
  doc.setFillColor(...COLORS.ink);
  doc.rect(0, 52, pageWidth, 6, "F"); // small strip to hold text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.cream);
  doc.text(data.propertyName, marginX, 57);
  doc.text(period, pageWidth / 2 + 5, 57);

  // Now green band content
  // Checkmark circle
  const ckCX = marginX + 8;
  const ckCY = 71;
  drawCheckmark(doc, ckCX, ckCY, 5.5);

  // STATUS label
  const textX = marginX + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(232, 244, 238); // greenLight-ish on green
  doc.text("STATUS", textX, 65);

  // Payment Received
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.cream);
  doc.text("Payment Received", textX, 73);

  // Tenant · Unit
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(232, 244, 238);
  const unitStr = data.unitNumber ? ` · Unit ${data.unitNumber}` : "";
  doc.text(`${data.tenantName}${unitStr}`, textX, 80);

  // ── AMOUNT SECTION (greenLight background) ────────────────────────
  doc.setFillColor(...COLORS.greenLight);
  doc.rect(0, 84, pageWidth, 38, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.sage);
  doc.text("AMOUNT PAID", pageWidth / 2, 94, { align: "center" });

  // Underline label
  const lblW = doc.getTextWidth("AMOUNT PAID");
  doc.setDrawColor(...COLORS.sage);
  doc.setLineWidth(0.2);
  doc.line(pageWidth / 2 - lblW / 2, 95.5, pageWidth / 2 + lblW / 2, 95.5);

  // KES amount — split "KES" smaller and number larger
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.green);
  const kesLabel = "KES ";
  const amountStr = data.amount.toLocaleString();
  const kesW = doc.getTextWidth(kesLabel);
  doc.setFontSize(16);
  const totalW16 = doc.getTextWidth(kesLabel);
  doc.setFontSize(36);
  const numW = doc.getTextWidth(amountStr);
  // center the combined string
  const combinedX = pageWidth / 2 - (totalW16 + numW) / 2;
  doc.setFontSize(16);
  doc.text(kesLabel, combinedX, 111);
  doc.setFontSize(36);
  doc.text(amountStr, combinedX + kesW, 111);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.sage);
  doc.text(period, pageWidth / 2, 118, { align: "center" });

  // ── TRANSACTION DETAILS ───────────────────────────────────────────
  let y = 132;

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
  // Dashed top border
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  let fx = marginX;
  while (fx < pageWidth - marginX) {
    doc.line(fx, pageHeight - 22, Math.min(fx + 3, pageWidth - marginX), pageHeight - 22);
    fx += 5;
  }

  // Footer text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);

  const genDate = new Date().toLocaleDateString("en-KE", {
    day: "numeric", month: "long", year: "numeric",
  });
  doc.text(`Generated on ${genDate}`, marginX, pageHeight - 14);
  doc.text(`Page 1 of 1`, pageWidth - marginX, pageHeight - 14, { align: "right" });

  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gold);
  doc.text("LandyKE", pageWidth / 2, pageHeight - 14, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.muted);
  doc.text("Property Management, Simplified", pageWidth / 2, pageHeight - 9, { align: "center" });

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
