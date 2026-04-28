import express from "express";
import TtVendorBooking from "../models/tt_vendor_booking.js";

const router = express.Router();

// GET list vendor booking (optional filter by kode_booking)
router.get("/", async (req, res) => {
  try {
    const { kode_booking, tanggal_acara, vendor_id, status } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (tanggal_acara) q.tanggal_acara = String(tanggal_acara);
    if (vendor_id) q.vendor_id = String(vendor_id);
    if (status) q.status = String(status);

    const data = await TtVendorBooking.find(q).sort({ createdAt: -1 }).populate("vendor_id").populate("kategori_vendor_id");
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data vendor booking", error: err.message });
  }
});

// PUT update status/catatan
router.put("/:id", async (req, res) => {
  try {
    const { status, catatan } = req.body || {};
    const payload = {};
    if (typeof status !== "undefined") payload.status = status;
    if (typeof catatan !== "undefined") payload.catatan = catatan;

    const data = await TtVendorBooking.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit vendor booking", error: err.message });
  }
});

export default router;

