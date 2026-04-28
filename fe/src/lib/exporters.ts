type Row = Record<string, any>;

export async function exportToExcel(opts: { filename: string; sheetName?: string; rows: Row[] }) {
  const { utils, writeFile } = await import("xlsx");
  const ws = utils.json_to_sheet(opts.rows || []);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, opts.sheetName || "Sheet1");
  writeFile(wb, opts.filename.endsWith(".xlsx") ? opts.filename : `${opts.filename}.xlsx`);
}

export async function exportToPdf(opts: { filename: string; title?: string; columns: string[]; rows: (string | number)[][] }) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default as any;
  const doc = new jsPDF({ orientation: "landscape" });
  if (opts.title) {
    doc.setFontSize(14);
    doc.text(opts.title, 14, 14);
  }
  autoTable(doc, {
    startY: opts.title ? 18 : 10,
    head: [opts.columns],
    body: opts.rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
  });
  doc.save(opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`);
}

