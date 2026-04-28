import express from "express";
import TmAdat from "../models/tm_adat.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const data = await TmAdat.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data adat", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.body?.nama_adat) return res.status(400).json({ pesan: "nama_adat wajib diisi" });
    const data = await TmAdat.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah adat", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = await TmAdat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit adat", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await TmAdat.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus adat", error: err.message });
  }
});

export default router;

