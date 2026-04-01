import jsPDF from "jspdf";
import { addHeader, addFooter, COLORS } from "./pdf-theme";

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

  // Header
  let y = addHeader(doc, "Payment Receipt", data.receiptNumber);

  // Tenant Details Section
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.ink);
  doc.text("Tenant Details", 20, y);
  y += 7;

  const labelX = 20;
  const valueX = 60;

  const tenantFields: [string, string][] = [
    ["Name", data.tenantName],
    ["Property", data.propertyName],
  ];
  if (data.unitNumber) tenantFields.push(["Unit", data.unitNumber]);
  if (data.propertyLocation) tenantFields.push(["Location", data.propertyLocation]);

  for (const [label, value] of tenantFields) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(label, labelX, y);
    doc.setTextColor(...COLORS.ink);
    doc.text(value, valueX, y);
    y += 6;
  }

  y += 4;

  // Divider
  doc.setDrawColor(...COLORS.warm);
  doc.setLineWidth(0.3);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  // Payment Details Section
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.ink);
  doc.text("Payment Details", 20, y);
  y += 10;

  // Amount (large, green)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Amount", labelX, y);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.green);
  doc.text(`KES ${data.amount.toLocaleString()}`, valueX, y);
  y += 10;

  // Other payment fields
  const paymentFields: [string, string][] = [
    ["Payment Date", formatDate(data.paidDate)],
    ["Period Covered", period],
    ["Payment Method", method],
  ];
  if (cleanNotes) paymentFields.push(["Notes", cleanNotes]);

  for (const [label, value] of paymentFields) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(label, labelX, y);
    doc.setTextColor(...COLORS.ink);
    doc.text(value, valueX, y);
    y += 6;
  }

  y += 8;

  // Confirmation box
  const boxW = pageWidth - 40;
  const boxH = 18;
  doc.setFillColor(...COLORS.greenLight);
  doc.roundedRect(20, y, boxW, boxH, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.green);
  const confirmText = `This receipt confirms payment of KES ${data.amount.toLocaleString()} for ${period} rent.`;
  doc.text(confirmText, pageWidth / 2, y + boxH / 2 + 1, { align: "center" });

  // Footer
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
