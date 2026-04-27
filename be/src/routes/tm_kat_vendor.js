
import express from "express";
import KatVendor from "../models/tm_kat_vendor.js";

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    const data = await KatVendor.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single category
router.get("/:id", async (req, res) => {
  try {
    const data = await KatVendor.findById(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE category
router.post("/", async (req, res) => {
  try {
    const { kode_kategori, nama_kategori } = req.body;
    const exists = await KatVendor.findOne({ kode_kategori });
    if (exists) return res.status(400).json({ error: "Kode kategori sudah ada" });
    const data = await KatVendor.create({ kode_kategori, nama_kategori });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE category
router.put("/:id", async (req, res) => {
  try {
    const { kode_kategori, nama_kategori } = req.body;
    const data = await KatVendor.findByIdAndUpdate(
      req.params.id,
      { kode_kategori, nama_kategori },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const data = await KatVendor.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
