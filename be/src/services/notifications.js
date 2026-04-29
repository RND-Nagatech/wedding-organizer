import path from "path";
import TtWaLog from "../models/tt_wa_log.js";
import TmClient from "../models/tm_client.js";
import TtPayment from "../models/tt_payment.js";
import { normalizePhoneID } from "../utils/phone.js";
import { generateBookingStatusPdf, generatePaymentPdf } from "../utils/pdf.js";
import { waSendMessageWithPdf, waGetStatus } from "./whatsapp.js";

const OUT_DIR = path.resolve(process.cwd(), "uploads", "wa");

function safeUpper(s) {
  return String(s || "").toUpperCase();
}

export async function notifyBookingStatus({ booking, status_booking }) {
  const kodeBooking = String(booking.kode_booking || "");
  const kodeClient = String(booking.kode_client || "");
  const eventKey = `booking-status:${kodeBooking}:${String(status_booking || booking.status_booking || "")}`;

  // prevent duplicates
  const exists = await TtWaLog.findOne({ event_key: eventKey });
  if (exists) return exists;

  const client = await TmClient.findById(String(booking.id_klien));
  const phoneRaw = client?.telepon || "";
  const to = normalizePhoneID(phoneRaw);
  const namaClient = booking.nama_client || `${client?.nama_klien || ""} & ${client?.pasangan || ""}`.trim();

  const message = `Halo ${namaClient || "Client"}, booking Anda dengan nomor ${safeUpper(kodeBooking)} statusnya sekarang: ${String(status_booking || "").replace(/_/g, " ")}.\nSilakan cek detail booking pada lampiran PDF.`;

  let log;
  try {
    log = await TtWaLog.create({
      kode_booking: kodeBooking,
      kode_client: kodeClient,
      no_hp_tujuan: String(phoneRaw || ""),
      jenis_notifikasi: "booking_status",
      pesan: message,
      status_kirim: "pending",
      event_key: eventKey,
    });
  } catch (err) {
    // duplicate (unique event_key) - return existing
    if (String(err?.code) === "11000") {
      const existing = await TtWaLog.findOne({ event_key: eventKey });
      if (existing) return existing;
    }
    throw err;
  }

  if (!phoneRaw) {
    log.status_kirim = "failed";
    log.error_message = "Nomor HP client kosong";
    await log.save();
    return log;
  }

  // Generate PDF first
  try {
    const pdfAbs = await generateBookingStatusPdf({
      outDir: OUT_DIR,
      booking,
      paketName: booking.paket_snapshot?.nama_paket,
      statusBooking: status_booking,
      note: booking.catatan,
      updatedAt: new Date(),
    });
    const rel = `/${path.relative(process.cwd(), pdfAbs).replace(/\\/g, "/")}`;
    log.file_pdf = rel;
    await log.save();
  } catch (err) {
    log.status_kirim = "failed";
    log.error_message = `PDF gagal dibuat: ${err.message}`;
    await log.save();
    return log;
  }

  // Send WA
  try {
    const st = waGetStatus();
    if (st.status !== "connected") throw new Error("WhatsApp belum terkoneksi");
    await waSendMessageWithPdf({
      to,
      message,
      pdfPath: path.resolve(process.cwd(), log.file_pdf.replace(/^\//, "")),
      filename: path.basename(log.file_pdf),
    });
    log.status_kirim = "sent";
    log.sent_at = new Date();
    log.error_message = "";
    await log.save();
    return log;
  } catch (err) {
    log.status_kirim = "failed";
    log.error_message = err.message;
    await log.save();
    return log;
  }
}

export async function notifyPaymentCreated({ payment }) {
  const kodeBooking = String(payment.kode_booking || "");
  const kodeClient = String(payment.kode_client || "");
  const eventKey = `payment:${String(payment.kode_pembayaran || payment._id)}`;

  const exists = await TtWaLog.findOne({ event_key: eventKey });
  if (exists) return exists;

  const client = kodeClient ? await TmClient.findOne({ kode_client: kodeClient }) : null;
  const phoneRaw = client?.telepon || "";
  const to = normalizePhoneID(phoneRaw);

  const totalPaid = (
    await TtPayment.aggregate([
      { $match: { kode_booking: kodeBooking } },
      { $group: { _id: null, total: { $sum: "$nominal_bayar" } } },
    ])
  )?.[0]?.total || 0;

  const message = `Halo ${payment.nama_client || "Client"}, pembayaran ${payment.jenis_pembayaran} untuk booking ${safeUpper(kodeBooking)} berhasil dicatat sebesar Rp ${Number(payment.nominal_bayar || 0).toLocaleString("id-ID")}.\nSisa tagihan Anda saat ini Rp ${Number(payment.sisa_tagihan || 0).toLocaleString("id-ID")}.\nDetail pembayaran ada pada lampiran PDF.`;

  let log;
  try {
    log = await TtWaLog.create({
      kode_booking: kodeBooking,
      kode_client: kodeClient,
      no_hp_tujuan: String(phoneRaw || ""),
      jenis_notifikasi: "pembayaran",
      pesan: message,
      status_kirim: "pending",
      event_key: eventKey,
    });
  } catch (err) {
    if (String(err?.code) === "11000") {
      const existing = await TtWaLog.findOne({ event_key: eventKey });
      if (existing) return existing;
    }
    throw err;
  }

  if (!phoneRaw) {
    log.status_kirim = "failed";
    log.error_message = "Nomor HP client kosong";
    await log.save();
    return log;
  }

  try {
    const pdfAbs = await generatePaymentPdf({ outDir: OUT_DIR, payment, totalPaid });
    const rel = `/${path.relative(process.cwd(), pdfAbs).replace(/\\/g, "/")}`;
    log.file_pdf = rel;
    await log.save();
  } catch (err) {
    log.status_kirim = "failed";
    log.error_message = `PDF gagal dibuat: ${err.message}`;
    await log.save();
    return log;
  }

  try {
    const st = waGetStatus();
    if (st.status !== "connected") throw new Error("WhatsApp belum terkoneksi");
    await waSendMessageWithPdf({
      to,
      message,
      pdfPath: path.resolve(process.cwd(), log.file_pdf.replace(/^\//, "")),
      filename: path.basename(log.file_pdf),
    });
    log.status_kirim = "sent";
    log.sent_at = new Date();
    log.error_message = "";
    await log.save();
    return log;
  } catch (err) {
    log.status_kirim = "failed";
    log.error_message = err.message;
    await log.save();
    return log;
  }
}
