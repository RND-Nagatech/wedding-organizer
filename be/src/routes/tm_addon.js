import express from "express";
import TmAddon from "../models/tm_addon.js";

const router = express.Router();

// GET list
router.get("/", async (req, res) => {
  try {
    const { q, status, kategori_addon } = req.query;
    const query = {};
    if (status) query.status = String(status);
    if (kategori_addon) query.kategori_addon = String(kategori_addon);
    if (q) query.nama_addon = { $regex: String(q), $options: "i" };
    const rows = await TmAddon.find(query).sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil master add-ons", error: err.message });
  }
});

// POST create
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.nama_addon) return res.status(400).json({ pesan: "nama_addon wajib diisi" });
    const harga = Number(payload.harga_satuan_default || 0);
    if (Number.isNaN(harga) || harga < 0) return res.status(400).json({ pesan: "harga_satuan_default tidak valid" });

    const row = await TmAddon.create({
      nama_addon: payload.nama_addon,
      kategori_addon: payload.kategori_addon,
      deskripsi: payload.deskripsi,
      satuan: payload.satuan,
      harga_satuan_default: harga,
      status: payload.status || "aktif",
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah add-on", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    if (typeof payload.harga_satuan_default !== "undefined") {
      const harga = Number(payload.harga_satuan_default || 0);
      if (Number.isNaN(harga) || harga < 0) return res.status(400).json({ pesan: "harga_satuan_default tidak valid" });
    }

    const row = await TmAddon.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.nama_addon !== "undefined" ? { nama_addon: payload.nama_addon } : {}),
        ...(typeof payload.kategori_addon !== "undefined" ? { kategori_addon: payload.kategori_addon } : {}),
        ...(typeof payload.deskripsi !== "undefined" ? { deskripsi: payload.deskripsi } : {}),
        ...(typeof payload.satuan !== "undefined" ? { satuan: payload.satuan } : {}),
        ...(typeof payload.harga_satuan_default !== "undefined" ? { harga_satuan_default: Number(payload.harga_satuan_default || 0) } : {}),
        ...(typeof payload.status !== "undefined" ? { status: payload.status } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!row) return res.status(404).json({ pesan: "Add-on tidak ditemukan" });
    res.json(row);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit add-on", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const row = await TmAddon.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ pesan: "Add-on tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus add-on", error: err.message });
  }
});

export default router;

