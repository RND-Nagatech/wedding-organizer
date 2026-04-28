import express from "express";
import TmKatalogDekorasi from "../models/tm_katalog_dekorasi.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const data = await TmKatalogDekorasi.find().sort({ createdAt: -1 }).populate("adat_id").populate("vendor_id");
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil katalog dekorasi", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nama_dekorasi, adat_id } = req.body || {};
    if (!nama_dekorasi) return res.status(400).json({ pesan: "nama_dekorasi wajib diisi" });
    if (!adat_id) return res.status(400).json({ pesan: "adat_id wajib diisi" });

    const data = await TmKatalogDekorasi.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah katalog dekorasi", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await TmKatalogDekorasi.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit katalog dekorasi", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await TmKatalogDekorasi.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus katalog dekorasi", error: err.message });
  }
});

export default router;

