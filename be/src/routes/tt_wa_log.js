import express from "express";
import path from "path";
import TtWaLog from "../models/tt_wa_log.js";
import TtBooking from "../models/tt_booking.js";
import TtPayment from "../models/tt_payment.js";
import TmClient from "../models/tm_client.js";
import { waSendMessageWithPdf } from "../services/whatsapp.js";
import { normalizePhoneID } from "../utils/phone.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status_kirim, jenis_notifikasi, kode_booking, kode_client, from, to } = req.query;
    const q = {};
    if (status_kirim) q.status_kirim = String(status_kirim);
    if (jenis_notifikasi) q.jenis_notifikasi = String(jenis_notifikasi);
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (kode_client) q.kode_client = String(kode_client);
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(String(from));
      if (to) q.createdAt.$lte = new Date(String(to));
    }
    const rows = await TtWaLog.find(q).sort({ createdAt: -1, sent_at: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil WA log", error: err.message });
  }
});

router.post("/:id/resend", async (req, res) => {
  try {
    const row = await TtWaLog.findById(req.params.id);
    if (!row) return res.status(404).json({ pesan: "Log tidak ditemukan" });

    // Rebuild destination number if possible
    let to = normalizePhoneID(row.no_hp_tujuan);
    if (!to && row.kode_booking) {
      const booking = await TtBooking.findOne({ kode_booking: row.kode_booking });
      const client = booking ? await TmClient.findById(String(booking.id_klien)) : null;
      to = normalizePhoneID(client?.telepon);
    }
    if (!to) {
      row.status_kirim = "failed";
      row.error_message = "Nomor HP client kosong";
      await row.save();
      return res.status(400).json(row);
    }

    // Ensure pdf exists
    const pdfPath = row.file_pdf ? path.resolve(process.cwd(), row.file_pdf.replace(/^\//, "")) : null;
    if (!row.file_pdf) {
      row.status_kirim = "failed";
      row.error_message = "File PDF kosong";
      await row.save();
      return res.status(400).json(row);
    }

    row.status_kirim = "pending";
    row.error_message = "";
    await row.save();

    await waSendMessageWithPdf({
      to,
      message: row.pesan || "",
      pdfPath,
      filename: path.basename(pdfPath),
    });

    row.status_kirim = "sent";
    row.sent_at = new Date();
    row.error_message = "";
    await row.save();
    res.json(row);
  } catch (err) {
    try {
      await TtWaLog.findByIdAndUpdate(req.params.id, { $set: { status_kirim: "failed", error_message: err.message } });
    } catch {}
    res.status(400).json({ pesan: "Gagal resend WA", error: err.message });
  }
});

export default router;

