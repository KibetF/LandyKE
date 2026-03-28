import jsPDF from "jspdf";

// Brand colors matching the design system
export const COLORS = {
  ink: [15, 14, 11] as [number, number, number],
  gold: [200, 150, 62] as [number, number, number],
  goldLight: [232, 185, 106] as [number, number, number],
  cream: [245, 240, 232] as [number, number, number],
  warm: [237, 230, 214] as [number, number, number],
  green: [45, 106, 79] as [number, number, number],
  greenLight: [232, 244, 238] as [number, number, number],
  rust: [139, 58, 42] as [number, number, number],
  muted: [122, 116, 104] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  sage: [74, 92, 78] as [number, number, number],
};

export function addHeader(doc: jsPDF, title: string, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // "LandyKE" text-based logo
  doc.setFont("times", "italic");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.ink);
  doc.text("LandyKE", 20, 22);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("Property Management, Simplified", 20, 28);

  // Gold accent line
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1.5);
  doc.line(20, 33, pageWidth - 20, 33);

  // Report title
  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.ink);
  doc.text(title, 20, 44);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(subtitle, 20, 51);

  // Return Y position for content start
  return 60;
}

export function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Thin line
  doc.setDrawColor(...COLORS.warm);
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);

  // Generation date
  const dateStr = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated on ${dateStr}`, 20, pageHeight - 12);

  // Page numbers
  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    pageWidth - 20,
    pageHeight - 12,
    { align: "right" }
  );

  // Branding
  doc.setTextColor(...COLORS.gold);
  doc.text("LandyKE", pageWidth / 2, pageHeight - 12, { align: "center" });
}

export function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.ink);
  doc.text(title, 20, y);

  // Small gold underline
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 20 + doc.getTextWidth(title), y + 2);

  return y + 8;
}
