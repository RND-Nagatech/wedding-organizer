import express from "express";
import TtKeuangan from "../models/tt_keuangan.js";
import { generateDailyCode } from "../utils/code.js";

const router = express.Router();

function toISODate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// GET list (filter: date range, kategori)
router.get("/", async (req, res) => {
  try {
    const { tgl_from, tgl_to, kategori } = req.query;
    const q = {};
    if (kategori) q.kategori = String(kategori);
    if (tgl_from || tgl_to) {
      q.tgl_trx = {};
      if (tgl_from) q.tgl_trx.$gte = String(tgl_from);
      if (tgl_to) q.tgl_trx.$lte = String(tgl_to);
    }

    const data = await TtKeuangan.find(q).sort({ tgl_trx: -1, createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data keuangan", error: err.message });
  }
});

// POST create manual
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kategori) return res.status(400).json({ pesan: "kategori wajib diisi" });
    const tgl_trx = payload.tgl_trx ? String(payload.tgl_trx) : toISODate();

    const no_trx = await generateDailyCode("KF");
    const data = await TtKeuangan.create({
      no_trx,
      tgl_trx,
      kategori: payload.kategori,
      keterangan: payload.keterangan,
      jumlah_in: Number(payload.jumlah_in) || 0,
      jumlah_out: Number(payload.jumlah_out) || 0,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah transaksi keuangan", error: err.message });
  }
});

// PUT edit manual
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await TtKeuangan.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.tgl_trx !== "undefined" ? { tgl_trx: payload.tgl_trx } : {}),
        ...(typeof payload.kategori !== "undefined" ? { kategori: payload.kategori } : {}),
        ...(typeof payload.keterangan !== "undefined" ? { keterangan: payload.keterangan } : {}),
        ...(typeof payload.jumlah_in !== "undefined" ? { jumlah_in: Number(payload.jumlah_in) || 0 } : {}),
        ...(typeof payload.jumlah_out !== "undefined" ? { jumlah_out: Number(payload.jumlah_out) || 0 } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit transaksi keuangan", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const data = await TtKeuangan.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus transaksi keuangan", error: err.message });
  }
});

export default router;

