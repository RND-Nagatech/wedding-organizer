import express from "express";
import SystemProfile from "../models/tp_system.js";

const router = express.Router();

// GET profile (ambil satu saja, asumsikan hanya satu dokumen)
router.get("/", async (req, res) => {
  try {
    const data = await SystemProfile.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE profile (by id)
router.put("/:id", async (req, res) => {
  try {
    const data = await SystemProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CREATE profile (jika belum ada)
router.post("/", async (req, res) => {
  try {
    const exists = await SystemProfile.findOne();
    if (exists) return res.status(400).json({ error: "Profil bisnis sudah ada" });
    const data = await SystemProfile.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
