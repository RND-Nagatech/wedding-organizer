import express from "express";
import TtChecklistBarang from "../models/tt_checklist_barang.js";

const router = express.Router();

// GET list (filter: kode_booking, kategori_barang, status)
router.get("/", async (req, res) => {
  try {
    const { kode_booking, kategori_barang, status } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (kategori_barang) q.kategori_barang = String(kategori_barang);
    if (status) q.status = String(status);

    const data = await TtChecklistBarang.find(q).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil checklist barang", error: err.message });
  }
});

// POST create
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kode_booking) return res.status(400).json({ pesan: "kode_booking wajib diisi" });
    if (!payload.nama_barang) return res.status(400).json({ pesan: "nama_barang wajib diisi" });
    if (!payload.kategori_barang) return res.status(400).json({ pesan: "kategori_barang wajib diisi" });

    const data = await TtChecklistBarang.create({
      kode_booking: payload.kode_booking,
      nama_barang: payload.nama_barang,
      kategori_barang: payload.kategori_barang,
      jumlah: payload.jumlah,
      untuk_siapa: payload.untuk_siapa,
      pic: payload.pic,
      status: payload.status,
      foto_barang: payload.foto_barang,
      catatan: payload.catatan,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah checklist barang", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await TtChecklistBarang.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.kode_booking !== "undefined" ? { kode_booking: payload.kode_booking } : {}),
        ...(typeof payload.nama_barang !== "undefined" ? { nama_barang: payload.nama_barang } : {}),
        ...(typeof payload.kategori_barang !== "undefined" ? { kategori_barang: payload.kategori_barang } : {}),
        ...(typeof payload.jumlah !== "undefined" ? { jumlah: payload.jumlah } : {}),
        ...(typeof payload.untuk_siapa !== "undefined" ? { untuk_siapa: payload.untuk_siapa } : {}),
        ...(typeof payload.pic !== "undefined" ? { pic: payload.pic } : {}),
        ...(typeof payload.status !== "undefined" ? { status: payload.status } : {}),
        ...(typeof payload.foto_barang !== "undefined" ? { foto_barang: payload.foto_barang } : {}),
        ...(typeof payload.catatan !== "undefined" ? { catatan: payload.catatan } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit checklist barang", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const data = await TtChecklistBarang.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus checklist barang", error: err.message });
  }
});

export default router;

