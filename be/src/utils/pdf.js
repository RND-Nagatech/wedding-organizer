import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatDateTime(d = new Date()) {
  try {
    return new Date(d).toISOString().replace("T", " ").slice(0, 19);
  } catch {
    return String(d || "");
  }
}

function writePdf({ filePath, title, rows }) {
  return new Promise((resolve, reject) => {
    try {
      ensureDir(path.dirname(filePath));
      const doc = new PDFDocument({ size: "A4", margin: 48 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(18).text(title, { align: "center" });
      doc.moveDown(1.5);

      doc.fontSize(11);
      for (const [k, v] of rows) {
        doc.font("Helvetica-Bold").text(`${k}: `, { continued: true });
        doc.font("Helvetica").text(v || "—");
      }

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
  const rows = [
    ["Kode Booking", String(booking.kode_booking || "")],
    ["Kode Client", String(booking.kode_client || "")],
    ["Nama Client", String(booking.nama_client || "")],
    ["Tanggal Acara", String(booking.tanggal_acara || "")],
    ["Paket", String(paketName || booking.paket_snapshot?.nama_paket || "")],
    ["Status Booking", String(statusBooking || booking.status_booking || "")],
    ["Harga Final Booking", booking.harga_final_booking ? `Rp ${Number(booking.harga_final_booking).toLocaleString("id-ID")}` : "—"],
    ["Catatan WO", String(note || booking.catatan || "") || "—"],
    ["Tanggal Update", formatDateTime(updatedAt || new Date())],
  ];
  return writePdf({ filePath, title: "Detail Status Booking", rows });
}

export async function generatePaymentPdf({ outDir, payment, totalPaid }) {
  const fileName = `bukti-pembayaran-${String(payment.kode_pembayaran || payment._id).toLowerCase()}.pdf`;
  const filePath = path.join(outDir, fileName);
  const rows = [
    ["Kode Pembayaran", String(payment.kode_pembayaran || "")],
    ["Kode Booking", String(payment.kode_booking || "")],
    ["Kode Client", String(payment.kode_client || "")],
    ["Nama Client", String(payment.nama_client || "")],
    ["Jenis Pembayaran", String(payment.jenis_pembayaran || "")],
    ["Total Tagihan", `Rp ${Number(payment.total_tagihan || 0).toLocaleString("id-ID")}`],
    ["Nominal Bayar", `Rp ${Number(payment.nominal_bayar || 0).toLocaleString("id-ID")}`],
    ["Total Terbayar", `Rp ${Number(totalPaid || 0).toLocaleString("id-ID")}`],
    ["Sisa Tagihan", `Rp ${Number(payment.sisa_tagihan || 0).toLocaleString("id-ID")}`],
    ["Metode Pembayaran", String(payment.metode_pembayaran || "")],
    ["Tanggal Pembayaran", String(payment.tanggal_pembayaran || "")],
    ["Status Pembayaran", String(payment.status_pembayaran || "")],
  ];
  return writePdf({ filePath, title: "Bukti Pembayaran Wedding Organizer", rows });
}

