import express from "express";
import TtWishlistClient from "../models/tt_wishlist_client.js";

const router = express.Router();

// GET list (filter: kode_booking, kategori, status)
router.get("/", async (req, res) => {
  try {
    const { kode_booking, kategori, status, prioritas } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (kategori) q.kategori = String(kategori);
    if (status) q.status = String(status);
    if (prioritas) q.prioritas = String(prioritas);

    const data = await TtWishlistClient.find(q).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data wishlist client", error: err.message });
  }
});

// POST create
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kode_booking) return res.status(400).json({ pesan: "kode_booking wajib diisi" });
    if (!payload.kategori) return res.status(400).json({ pesan: "kategori wajib diisi" });
    if (!payload.permintaan) return res.status(400).json({ pesan: "permintaan wajib diisi" });

    const data = await TtWishlistClient.create({
      kode_booking: payload.kode_booking,
      kategori: payload.kategori,
      permintaan: payload.permintaan,
      prioritas: payload.prioritas,
      pic: payload.pic,
      status: payload.status,
      catatan_wo: payload.catatan_wo,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah wishlist client", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await TtWishlistClient.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.kode_booking !== "undefined" ? { kode_booking: payload.kode_booking } : {}),
        ...(typeof payload.kategori !== "undefined" ? { kategori: payload.kategori } : {}),
        ...(typeof payload.permintaan !== "undefined" ? { permintaan: payload.permintaan } : {}),
        ...(typeof payload.prioritas !== "undefined" ? { prioritas: payload.prioritas } : {}),
        ...(typeof payload.pic !== "undefined" ? { pic: payload.pic } : {}),
        ...(typeof payload.status !== "undefined" ? { status: payload.status } : {}),
        ...(typeof payload.catatan_wo !== "undefined" ? { catatan_wo: payload.catatan_wo } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit wishlist client", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const data = await TtWishlistClient.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus wishlist client", error: err.message });
  }
});

export default router;

