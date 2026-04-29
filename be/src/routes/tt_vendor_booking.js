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

    // Default: jangan tampilkan yang sudah batal, kecuali diminta explicit
    if (!status) q.status = { $ne: "batal" };

    const rows = await TtVendorBooking.find(q)
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("vendor_id")
      .populate("kategori_vendor_id");

    // De-duplicate by (kode_booking, vendor_id, kategori_vendor_id) - keep latest
    if (kode_booking) {
      const seen = new Set();
      const out = [];
      for (const r of rows) {
        const key = [
          String(r.kode_booking || ""),
          String(r.vendor_id?._id || r.vendor_id || ""),
          String(r.kategori_vendor_id?._id || r.kategori_vendor_id || ""),
        ].join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(r);
      }
      return res.json(out);
    }

    res.json(rows);
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
