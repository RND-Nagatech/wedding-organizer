import express from "express";
import TtTimelineClient from "../models/tt_timeline_client.js";

const router = express.Router();

// GET list (optional filter by kode_booking)
router.get("/", async (req, res) => {
  try {
    const { kode_booking } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    const rows = await TtTimelineClient.find(q).sort({ urutan: 1, createdAt: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil timeline client", error: err.message });
  }
});

// POST add
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kode_booking) return res.status(400).json({ pesan: "kode_booking wajib diisi" });
    if (!payload.nama_step) return res.status(400).json({ pesan: "nama_step wajib diisi" });
    const row = new TtTimelineClient(payload);
    await row.save();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah timeline client", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const row = await TtTimelineClient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!row) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(row);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit timeline client", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const row = await TtTimelineClient.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus timeline client", error: err.message });
  }
});

export default router;

