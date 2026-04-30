import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import SystemProfile from "../models/tp_system.js";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatDateID(iso) {
  try {
    if (!iso) return "—";
    const d = new Date(String(iso).includes("T") ? String(iso) : `${iso}T00:00:00`);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(d);
  } catch {
    return String(iso || "—");
  }
}

function formatDateTime(d = new Date()) {
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(dt);
  } catch {
    return String(d || "");
  }
}

function formatIDR(n) {
  const v = Number(n || 0);
  if (Number.isNaN(v)) return "Rp 0";
  return `Rp ${v.toLocaleString("id-ID")}`;
}

let cachedProfile = { name: "Wedding Organizer", loadedAt: 0 };
async function getBusinessName() {
  const now = Date.now();
  if (cachedProfile.loadedAt && now - cachedProfile.loadedAt < 60_000) return cachedProfile.name;
  try {
    const prof = await SystemProfile.findOne().select("nama_bisnis");
    cachedProfile = { name: prof?.nama_bisnis || "Wedding Organizer", loadedAt: now };
    return cachedProfile.name;
  } catch {
    return cachedProfile.name || "Wedding Organizer";
  }
}

function writePdf({ filePath, businessName, docTitle, subtitle, sections, footerNote }) {
  return new Promise((resolve, reject) => {
    try {
      ensureDir(path.dirname(filePath));
      const doc = new PDFDocument({ size: "A4", margin: 48 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const startX = doc.page.margins.left;

      // Header
      doc.font("Helvetica-Bold").fontSize(18).text(businessName || "Wedding Organizer", startX, doc.y, { align: "center", width: pageWidth });
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(13).text(docTitle, startX, doc.y, { align: "center", width: pageWidth });
      if (subtitle) {
        doc.moveDown(0.2);
        doc.font("Helvetica").fontSize(10).fillColor("#666666").text(subtitle, startX, doc.y, { align: "center", width: pageWidth });
        doc.fillColor("#000000");
      }
      doc.moveDown(0.6);
      doc.moveTo(startX, doc.y).lineTo(startX + pageWidth, doc.y).strokeColor("#dddddd").stroke();
      doc.moveDown(0.8);

      const labelWidth = 150;
      const valueWidth = pageWidth - labelWidth;

      doc.fontSize(11);
      for (const section of sections || []) {
        if (section.title) {
          doc.font("Helvetica-Bold").fontSize(12).text(section.title, startX);
          doc.moveDown(0.4);
        }
        for (const row of section.rows || []) {
          const k = String(row[0] || "").trim();
          const v = String(row[1] ?? "—");
          const y = doc.y;
          doc.font("Helvetica-Bold").fontSize(10).text(k, startX, y, { width: labelWidth });
          doc.font("Helvetica").fontSize(10).text(v || "—", startX + labelWidth, y, { width: valueWidth });
          doc.moveDown(0.4);
        }
        doc.moveDown(0.4);
      }

      doc.moveTo(startX, doc.page.height - doc.page.margins.bottom - 20).lineTo(startX + pageWidth, doc.page.height - doc.page.margins.bottom - 20).strokeColor("#eeeeee").stroke();
      doc.font("Helvetica").fontSize(9).fillColor("#888888").text(footerNote || "Dokumen ini dibuat otomatis oleh sistem.", startX, doc.page.height - doc.page.margins.bottom - 14, { width: pageWidth, align: "left" });
      doc.fillColor("#000000");

      doc.end();
      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateBookingStatusPdf({ outDir, booking, paketName, statusBooking, note, updatedAt }) {
  const fileName = `booking-status-${String(booking.kode_booking || booking._id).toLowerCase()}-${String(statusBooking || "").toLowerCase()}.pdf`;
  const filePath = path.join(outDir, fileName);
  const businessName = await getBusinessName();
  const kode = String(booking.kode_booking || "").toUpperCase();
  const sections = [
    {
      title: "Informasi Booking",
      rows: [
        ["Kode Booking", kode || "—"],
        ["Kode Client", String(booking.kode_client || "") || "—"],
        ["Nama Client", String(booking.nama_client || "") || "—"],
        ["Tanggal Acara", formatDateID(booking.tanggal_acara)],
        ["Paket", String(paketName || booking.paket_snapshot?.nama_paket || "") || "—"],
      ],
    },
    {
      title: "Status",
      rows: [
        ["Status Booking", String(statusBooking || booking.status_booking || "").replace(/_/g, " ") || "—"],
        ["Harga Final Booking", booking.harga_final_booking ? formatIDR(booking.harga_final_booking) : "—"],
        ["Catatan WO", String(note || booking.catatan || "") || "—"],
        ["Tanggal Update", formatDateTime(updatedAt || new Date())],
      ],
    },
  ];
  return writePdf({
    filePath,
    businessName,
    docTitle: `Detail Booking ${kode || ""}`.trim(),
    subtitle: "Detail status booking",
    sections,
    footerNote: `Dicetak: ${formatDateTime(new Date())}`,
  });
}

export async function generatePaymentPdf({ outDir, payment, totalPaid }) {
  const fileName = `bukti-pembayaran-${String(payment.kode_pembayaran || payment._id).toLowerCase()}.pdf`;
  const filePath = path.join(outDir, fileName);
  const businessName = await getBusinessName();
  const kodeBooking = String(payment.kode_booking || "").toUpperCase();
  const sections = [
    {
      title: "Informasi Pembayaran",
      rows: [
        ["Kode Pembayaran", String(payment.kode_pembayaran || "") || "—"],
        ["Kode Booking", kodeBooking || "—"],
        ["Kode Client", String(payment.kode_client || "") || "—"],
        ["Nama Client", String(payment.nama_client || "") || "—"],
        ["Jenis Pembayaran", String(payment.jenis_pembayaran || "") || "—"],
        ["Metode Pembayaran", String(payment.metode_pembayaran || "") || "—"],
        ["Tanggal Pembayaran", formatDateID(payment.tanggal_pembayaran)],
        ["Status Pembayaran", String(payment.status_pembayaran || "").replace(/_/g, " ") || "—"],
      ],
    },
    {
      title: "Rincian Tagihan",
      rows: [
        ["Total Tagihan", formatIDR(payment.total_tagihan || 0)],
        ["Nominal Bayar", formatIDR(payment.nominal_bayar || 0)],
        ["Total Terbayar", formatIDR(totalPaid || 0)],
        ["Sisa Tagihan", formatIDR(payment.sisa_tagihan || 0)],
      ],
    },
  ];
  return writePdf({
    filePath,
    businessName,
    docTitle: `Pembayaran ${kodeBooking ? `[${kodeBooking}]` : ""}`.trim(),
    subtitle: "Bukti pembayaran",
    sections,
    footerNote: `Dicetak: ${formatDateTime(new Date())}`,
  });
}
