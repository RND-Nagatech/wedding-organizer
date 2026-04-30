import express from "express";
import TmKatalogMakeup from "../models/tm_katalog_makeup.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const data = await TmKatalogMakeup.find().sort({ createdAt: -1 }).populate("vendor_mua_id");
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil katalog makeup", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nama_style, kategori, vendor_mua_id } = req.body || {};
    if (!nama_style) return res.status(400).json({ pesan: "nama_style wajib diisi" });

    const data = await TmKatalogMakeup.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah katalog makeup", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await TmKatalogMakeup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit katalog makeup", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await TmKatalogMakeup.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus katalog makeup", error: err.message });
  }
});

export default router;
