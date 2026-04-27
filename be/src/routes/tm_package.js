import express from "express";
import TmPackage from "../models/tm_package.js";

const router = express.Router();

// GET semua paket
router.get("/", async (req, res) => {
  try {
    const packages = await TmPackage.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data paket" });
  }
});

// GET detail paket
router.get("/:id", async (req, res) => {
  try {
    const paket = await TmPackage.findById(req.params.id);
    if (!paket) return res.status(404).json({ pesan: "Paket tidak ditemukan" });
    res.json(paket);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil detail paket" });
  }
});

// POST tambah paket
router.post("/", async (req, res) => {
  try {
    const paket = new TmPackage(req.body);
    await paket.save();
    res.status(201).json(paket);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah paket", error: err.message });
  }
});

// PUT edit paket
router.put("/:id", async (req, res) => {
  try {
    const paket = await TmPackage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!paket) return res.status(404).json({ pesan: "Paket tidak ditemukan" });
    res.json(paket);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit paket", error: err.message });
  }
});

// DELETE hapus paket
router.delete("/:id", async (req, res) => {
  try {
    const paket = await TmPackage.findByIdAndDelete(req.params.id);
    if (!paket) return res.status(404).json({ pesan: "Paket tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus paket", error: err.message });
  }
});

export default router;
