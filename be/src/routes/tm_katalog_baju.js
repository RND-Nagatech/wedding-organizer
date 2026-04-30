import express from "express";
import TmKatalogBaju from "../models/tm_katalog_baju.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const data = await TmKatalogBaju.find().sort({ createdAt: -1 }).populate("adat_id");
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil katalog baju", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nama_baju, kategori, adat_id } = req.body || {};
    if (!nama_baju) return res.status(400).json({ pesan: "nama_baju wajib diisi" });

    const data = await TmKatalogBaju.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah katalog baju", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await TmKatalogBaju.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit katalog baju", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await TmKatalogBaju.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus katalog baju", error: err.message });
  }
});

export default router;
