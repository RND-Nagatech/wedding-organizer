import express from "express";
import TtFormulirDigital from "../models/tt_formulir_digital.js";

const router = express.Router();

// GET list (optional filter by kode_booking)
router.get("/", async (req, res) => {
  try {
    const { kode_booking } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    const data = await TtFormulirDigital.find(q).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil formulir digital", error: err.message });
  }
});

// GET by kode_booking (single)
router.get("/by-booking/:kode_booking", async (req, res) => {
  try {
    const data = await TtFormulirDigital.findOne({ kode_booking: String(req.params.kode_booking) }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil formulir digital", error: err.message });
  }
});

// POST upsert by kode_booking
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kode_booking) return res.status(400).json({ pesan: "kode_booking wajib diisi" });
    const data = await TtFormulirDigital.findOneAndUpdate(
      { kode_booking: String(payload.kode_booking) },
      payload,
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menyimpan formulir digital", error: err.message });
  }
});

// PUT update by id
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await TtFormulirDigital.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit formulir digital", error: err.message });
  }
});

export default router;

