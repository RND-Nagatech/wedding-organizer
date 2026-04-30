import express from "express";
import TmTestimoni from "../models/tm_testimoni.js";

const router = express.Router();

// GET list (optional filter by status)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status) q.status = String(status);
    const rows = await TmTestimoni.find(q).sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data testimoni", error: err.message });
  }
});

// POST add
router.post("/", async (req, res) => {
  try {
    const { nama, isi_testimoni } = req.body || {};
    if (!nama) return res.status(400).json({ pesan: "nama wajib diisi" });
    if (!isi_testimoni) return res.status(400).json({ pesan: "isi_testimoni wajib diisi" });
    const row = await TmTestimoni.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah testimoni", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const row = await TmTestimoni.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!row) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(row);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit testimoni", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const row = await TmTestimoni.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus testimoni", error: err.message });
  }
});

export default router;

