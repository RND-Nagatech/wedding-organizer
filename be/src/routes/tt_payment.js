import express from "express";
import TtPayment from "../models/tt_payment.js";
import TtBooking from "../models/tt_booking.js";
import TmClient from "../models/tm_client.js";
import TmPackage from "../models/tm_package.js";
import { generateDailyCode } from "../utils/code.js";

const router = express.Router();

// GET semua pembayaran
router.get("/", async (req, res) => {
  try {
    const payments = await TtPayment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data pembayaran", error: err.message });
  }
});

function toISODate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function statusPembayaran({ total, paidBefore, paidAfter }) {
  if (paidAfter >= total) return "lunas";
  if (paidBefore <= 0) return "DP";
  return "cicilan";
}

// POST tambah pembayaran
router.post("/", async (req, res) => {
  try {
    const { kode_booking, id_booking, nominal_bayar, metode_pembayaran, tanggal_pembayaran } = req.body || {};

    if (!metode_pembayaran) return res.status(400).json({ pesan: "Metode pembayaran wajib diisi" });
    if (!nominal_bayar || Number(nominal_bayar) <= 0) return res.status(400).json({ pesan: "Nominal bayar harus > 0" });

    const booking =
      (kode_booking ? await TtBooking.findOne({ kode_booking: String(kode_booking) }) : null) ||
      (id_booking ? await TtBooking.findById(String(id_booking)) : null);

    if (!booking) return res.status(400).json({ pesan: "Booking tidak ditemukan" });
    if (!booking.kode_booking) {
      booking.kode_booking = await generateDailyCode("BK");
      await booking.save();
    }

    const client = await TmClient.findById(String(booking.id_klien));
    if (!client) return res.status(400).json({ pesan: "Klien tidak ditemukan" });
    if (!client.kode_client) {
      client.kode_client = await generateDailyCode("CL");
      await client.save();
    }

    const total =
      Number(booking.paket_snapshot?.harga) ||
      Number((await TmPackage.findById(String(booking.id_paket)))?.harga) ||
      0;
    if (!total || total <= 0) return res.status(400).json({ pesan: "Total tagihan tidak valid (harga paket kosong)" });

    const paidBefore = (
      await TtPayment.aggregate([
        { $match: { kode_booking: booking.kode_booking } },
        { $group: { _id: null, total: { $sum: "$nominal_bayar" } } },
      ])
    )?.[0]?.total || 0;

    const pay = Number(nominal_bayar);
    const remainingBefore = total - paidBefore;
    if (pay > remainingBefore) {
      return res.status(400).json({ pesan: "Nominal bayar melebihi sisa tagihan", sisa_tagihan: remainingBefore });
    }

    const paidAfter = paidBefore + pay;
    const remainingAfter = Math.max(total - paidAfter, 0);
    const status_pembayaran = statusPembayaran({ total, paidBefore, paidAfter });

    const kode_pembayaran = await generateDailyCode("PY");
    const nama_client = `${client.nama_klien} & ${client.pasangan}`;

    const payment = new TtPayment({
      kode_pembayaran,
      kode_booking: booking.kode_booking,
      kode_client: client.kode_client,
      nama_client,
      total_tagihan: total,
      nominal_bayar: pay,
      sisa_tagihan: remainingAfter,
      metode_pembayaran,
      tanggal_pembayaran: tanggal_pembayaran ? String(tanggal_pembayaran) : toISODate(),
      status_pembayaran,
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah pembayaran", error: err.message });
  }
});

export default router;

