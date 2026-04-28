import express from "express";
import TmPackage from "../models/tm_package.js";

const router = express.Router();

function uniqStrings(arr) {
  return Array.from(new Set((Array.isArray(arr) ? arr : []).map(String).filter(Boolean)));
}

function normalizeKategoriVendors(input) {
  const rows = Array.isArray(input) ? input : [];
  return rows
    .map((r) => ({
      kategori_vendor_id: r?.kategori_vendor_id ? String(r.kategori_vendor_id) : "",
      vendor_ids: uniqStrings(r?.vendor_ids || []),
    }))
    .filter((r) => r.kategori_vendor_id);
}

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
    const body = req.body || {};
    const kategori_vendors = normalizeKategoriVendors(body.kategori_vendors);
    const vendorUnion = uniqStrings([
      ...(body.vendor_ids || []),
      ...kategori_vendors.flatMap((x) => x.vendor_ids),
    ]);

    const paket = new TmPackage({
      ...body,
      kategori_vendors,
      vendor_ids: vendorUnion,
    });
    await paket.save();
    res.status(201).json(paket);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah paket", error: err.message });
  }
});

// PUT edit paket
router.put("/:id", async (req, res) => {
  try {
    const body = req.body || {};
    const kategori_vendors = typeof body.kategori_vendors !== "undefined"
      ? normalizeKategoriVendors(body.kategori_vendors)
      : undefined;

    let vendorUnion;
    if (typeof kategori_vendors !== "undefined") {
      vendorUnion = uniqStrings([
        ...(body.vendor_ids || []),
        ...kategori_vendors.flatMap((x) => x.vendor_ids),
      ]);
    }

    const payload = {
      ...body,
      ...(typeof kategori_vendors !== "undefined" ? { kategori_vendors } : {}),
      ...(typeof vendorUnion !== "undefined" ? { vendor_ids: vendorUnion } : {}),
    };

    const paket = await TmPackage.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
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
