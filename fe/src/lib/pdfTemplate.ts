export type PdfField = { label: string; value?: any };

function safeText(v: any) {
  const s = v === null || typeof v === "undefined" ? "" : String(v);
  return s.trim() ? s : "—";
}

function formatDateID(iso: string) {
  try {
    if (!iso) return "—";
    const d = new Date(String(iso).includes("T") ? String(iso) : `${iso}T00:00:00`);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(d);
  } catch {
    return safeText(iso);
  }
}

export async function buildSimpleProfessionalPdf(opts: {
  businessName: string;
  title: string;
  subtitle?: string;
  meta?: PdfField[];
  sections: { title?: string; fields: PdfField[] }[];
  filename: string;
}) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const marginX = 14;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginX * 2;
  let y = 14;

  const business = safeText(opts.businessName || "Wedding Organizer");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(business, pageWidth / 2, y, { align: "center" });
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(opts.title, pageWidth / 2, y, { align: "center" });
  y += 5;
  if (opts.subtitle) {
    doc.setFontSize(10);
    doc.text(opts.subtitle, pageWidth / 2, y, { align: "center" });
    y += 4;
  }
  doc.setDrawColor(220);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6;

  // Meta
  const metaRows = (opts.meta || []).filter((m) => m.label);
  if (metaRows.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const m of metaRows) {
      const label = safeText(m.label);
      const value = m.label.toLowerCase().includes("tanggal") ? formatDateID(String(m.value || "")) : safeText(m.value);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}`, marginX, y);
      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(value, contentWidth - 45);
      doc.text(wrapped, marginX + 45, y);
      y += Math.max(5, wrapped.length * 4.5);
      if (y > 275) {
        doc.addPage();
        y = 14;
      }
    }
    y += 2;
    doc.setDrawColor(240);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 6;
  }

  // Sections
  for (const section of opts.sections) {
    if (section.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(section.title, marginX, y);
      y += 6;
    }

    for (const f of section.fields) {
      const label = safeText(f.label);
      const rawValue = f.value;
      const value = label.toLowerCase().includes("tanggal") ? formatDateID(String(rawValue || "")) : safeText(rawValue);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, marginX, y);
      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(value, contentWidth - 45);
      doc.text(wrapped, marginX + 45, y);
      y += Math.max(5, wrapped.length * 4.5);
      if (y > 275) {
        doc.addPage();
        y = 14;
      }
    }
    y += 4;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Halaman ${i} / ${pageCount}`, pageWidth - marginX, 290, { align: "right" });
    doc.setTextColor(0);
  }

  doc.save(opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`);
}

