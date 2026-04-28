import express from "express";
import TtReferensiClient from "../models/tt_referensi_client.js";

const router = express.Router();

// GET list (filter: kode_booking, kategori, status)
router.get("/", async (req, res) => {
  try {
    const { kode_booking, kategori, status } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (kategori) q.kategori = String(kategori);
    if (status) q.status = String(status);

    const data = await TtReferensiClient.find(q).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data referensi client", error: err.message });
  }
});

// POST create
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kode_booking) return res.status(400).json({ pesan: "kode_booking wajib diisi" });
    if (!payload.kategori) return res.status(400).json({ pesan: "kategori wajib diisi" });

    const data = await TtReferensiClient.create({
      kode_booking: payload.kode_booking,
      kategori: payload.kategori,
      upload_gambar: payload.upload_gambar,
      judul_referensi: payload.judul_referensi,
      catatan_client: payload.catatan_client,
      status: payload.status,
      catatan_staff: payload.catatan_staff,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah referensi client", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await TtReferensiClient.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.kode_booking !== "undefined" ? { kode_booking: payload.kode_booking } : {}),
        ...(typeof payload.kategori !== "undefined" ? { kategori: payload.kategori } : {}),
        ...(typeof payload.upload_gambar !== "undefined" ? { upload_gambar: payload.upload_gambar } : {}),
        ...(typeof payload.judul_referensi !== "undefined" ? { judul_referensi: payload.judul_referensi } : {}),
        ...(typeof payload.catatan_client !== "undefined" ? { catatan_client: payload.catatan_client } : {}),
        ...(typeof payload.status !== "undefined" ? { status: payload.status } : {}),
        ...(typeof payload.catatan_staff !== "undefined" ? { catatan_staff: payload.catatan_staff } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit referensi client", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const data = await TtReferensiClient.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus referensi client", error: err.message });
  }
});

export default router;

