import express from "express";
import TmVendor from "../models/tm_vendor.js";
import KatVendor from "../models/tm_kat_vendor.js";

const router = express.Router();

// GET semua vendor
router.get("/", async (req, res) => {
  try {
    const vendors = await TmVendor.find().sort({ createdAt: -1 }).populate("kategori_vendor_id");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data vendor" });
  }
});

// POST tambah vendor
router.post("/", async (req, res) => {
  try {
    const { kategori_vendor_id } = req.body || {};
    if (!kategori_vendor_id) {
      return res.status(400).json({ pesan: "Kategori vendor wajib diisi" });
    }
    if (!req.body?.alamat || !req.body?.telepon) {
      return res.status(400).json({ pesan: "Lengkapi alamat dan telepon" });
    }

    const category = await KatVendor.findById(kategori_vendor_id);
    if (!category) return res.status(400).json({ pesan: "Kategori vendor tidak valid" });

    const vendor = new TmVendor({
      ...req.body,
      kategori_vendor_kode: category.kode_kategori,
      kategori_vendor_nama: category.nama_kategori,
    });
    await vendor.save();
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah vendor", error: err.message });
  }
});

// PUT edit vendor
router.put("/:id", async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };

    if (payload.kategori_vendor_id) {
      const category = await KatVendor.findById(payload.kategori_vendor_id);
      if (!category) return res.status(400).json({ pesan: "Kategori vendor tidak valid" });
      payload.kategori_vendor_kode = category.kode_kategori;
      payload.kategori_vendor_nama = category.nama_kategori;
    }
    if (payload.alamat === "" || payload.telepon === "") {
      return res.status(400).json({ pesan: "Alamat dan telepon tidak boleh kosong" });
    }

    const vendor = await TmVendor.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ pesan: "Vendor tidak ditemukan" });
    res.json(vendor);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit vendor", error: err.message });
  }
});

// DELETE hapus vendor
router.delete("/:id", async (req, res) => {
  try {
    const vendor = await TmVendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ pesan: "Vendor tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus vendor", error: err.message });
  }
});

export default router;
