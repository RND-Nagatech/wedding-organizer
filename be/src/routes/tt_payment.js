import express from "express";
import TtPayment from "../models/tt_payment.js";
import TtBooking from "../models/tt_booking.js";
import TmClient from "../models/tm_client.js";
import TmPackage from "../models/tm_package.js";
import TtKeuangan from "../models/tt_keuangan.js";
import { generateDailyCode } from "../utils/code.js";
import { notifyPaymentCreated } from "../services/notifications.js";

const router = express.Router();

// GET semua pembayaran
router.get("/", async (req, res) => {
  try {
    const { kode_booking, kode_client, status_pembayaran, tgl_from, tgl_to } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (kode_client) q.kode_client = String(kode_client);
    if (status_pembayaran) q.status_pembayaran = String(status_pembayaran);
    if (tgl_from || tgl_to) {
      q.tanggal_pembayaran = {};
      if (tgl_from) q.tanggal_pembayaran.$gte = String(tgl_from);
      if (tgl_to) q.tanggal_pembayaran.$lte = String(tgl_to);
    }

    const payments = await TtPayment.find(q).sort({ tanggal_pembayaran: -1, createdAt: -1 });
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

function jenisPembayaranFromContext({ total, paidBefore, paidAfter }) {
  if (paidAfter >= total) return "pelunasan";
  if (paidBefore <= 0) return "DP";
  return "cicilan";
}

// POST tambah pembayaran
router.post("/", async (req, res) => {
  try {
    const { kode_booking, id_booking, nominal_bayar, metode_pembayaran, tanggal_pembayaran, jenis_pembayaran, catatan } = req.body || {};

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
      Number(booking.harga_final_booking) ||
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
    const jenisFinal = jenis_pembayaran || jenisPembayaranFromContext({ total, paidBefore, paidAfter });

    const kode_pembayaran = await generateDailyCode("PY");
    const nama_client = `${client.nama_klien} & ${client.pasangan}`;

    const payment = new TtPayment({
      kode_pembayaran,
      kode_booking: booking.kode_booking,
      kode_client: client.kode_client,
      nama_client,
      total_tagihan: total,
      nominal_bayar: pay,
      jenis_pembayaran: jenisFinal,
      sisa_tagihan: remainingAfter,
      metode_pembayaran,
      tanggal_pembayaran: tanggal_pembayaran ? String(tanggal_pembayaran) : toISODate(),
      status_pembayaran,
      catatan,
    });

    await payment.save();

    // Tahap 12: auto insert ke keuangan (jumlah_in)
    await TtKeuangan.create({
      no_trx: await generateDailyCode("KF"),
      tgl_trx: payment.tanggal_pembayaran,
      kategori: jenisFinal === "DP" ? "DP" : jenisFinal,
      keterangan: `Pembayaran ${payment.kode_pembayaran} (${payment.kode_booking})`,
      jumlah_in: pay,
      jumlah_out: 0,
      ref_type: "payment",
      ref_id: String(payment._id),
    });

    // WA notification: create log + (maybe) send WA. Return log id for easier debugging.
    let waLog = null;
    try {
      waLog = await notifyPaymentCreated({ payment });
    } catch (err) {
      // ignore (payment still success)
    }

    res.status(201).json({ ...payment.toObject(), wa_log_id: waLog?._id });
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah pembayaran", error: err.message });
  }
});

// PUT edit pembayaran
router.put("/:id", async (req, res) => {
  try {
    const payment = await TtPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ pesan: "Pembayaran tidak ditemukan" });

    const { nominal_bayar, metode_pembayaran, tanggal_pembayaran, catatan } = req.body || {};
    const nextNominal = typeof nominal_bayar !== "undefined" ? Number(nominal_bayar) : payment.nominal_bayar;
    if (!nextNominal || nextNominal <= 0) return res.status(400).json({ pesan: "Nominal bayar harus > 0" });
    const nextTanggal = typeof tanggal_pembayaran !== "undefined" ? String(tanggal_pembayaran) : payment.tanggal_pembayaran;
    const nextMetode = typeof metode_pembayaran !== "undefined" ? String(metode_pembayaran) : payment.metode_pembayaran;
    if (!nextMetode) return res.status(400).json({ pesan: "Metode pembayaran wajib diisi" });

    const total = Number(payment.total_tagihan) || 0;
    const paidOther = (
      await TtPayment.aggregate([
        { $match: { kode_booking: payment.kode_booking, _id: { $ne: payment._id } } },
        { $group: { _id: null, total: { $sum: "$nominal_bayar" } } },
      ])
    )?.[0]?.total || 0;

    const remainingBefore = total - paidOther;
    if (nextNominal > remainingBefore) {
      return res.status(400).json({ pesan: "Nominal bayar melebihi sisa tagihan", sisa_tagihan: remainingBefore });
    }

    const paidAfter = paidOther + nextNominal;
    const remainingAfter = Math.max(total - paidAfter, 0);
    const status_pembayaran = statusPembayaran({ total, paidBefore: paidOther, paidAfter });
    const jenisFinal = payment.jenis_pembayaran || jenisPembayaranFromContext({ total, paidBefore: paidOther, paidAfter });

    payment.nominal_bayar = nextNominal;
    payment.metode_pembayaran = nextMetode;
    payment.tanggal_pembayaran = nextTanggal;
    payment.sisa_tagihan = remainingAfter;
    payment.status_pembayaran = status_pembayaran;
    payment.jenis_pembayaran = jenisFinal;
    if (typeof catatan !== "undefined") payment.catatan = catatan;

    await payment.save();

    // sinkron keuangan terkait payment
    await TtKeuangan.findOneAndUpdate(
      { ref_type: "payment", ref_id: String(payment._id) },
      {
        $set: {
          tgl_trx: payment.tanggal_pembayaran,
          kategori: jenisFinal === "DP" ? "DP" : jenisFinal,
          keterangan: `Pembayaran ${payment.kode_pembayaran} (${payment.kode_booking})`,
          jumlah_in: payment.nominal_bayar,
          jumlah_out: 0,
        },
      },
      { upsert: true, new: true }
    );

    let waLog = null;
    try {
      waLog = await notifyPaymentCreated({ payment });
    } catch (err) {}
    res.json({ ...payment.toObject(), wa_log_id: waLog?._id });
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit pembayaran", error: err.message });
  }
});

// DELETE pembayaran
router.delete("/:id", async (req, res) => {
  try {
    const payment = await TtPayment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ pesan: "Pembayaran tidak ditemukan" });
    await TtKeuangan.deleteMany({ ref_type: "payment", ref_id: String(payment._id) });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus pembayaran", error: err.message });
  }
});

export default router;
