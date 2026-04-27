import express from "express";
import TtChecklist from "../models/tt_checklist.js";

const router = express.Router();

// GET semua checklist
router.get("/", async (req, res) => {
  try {
    const checklist = await TtChecklist.find();
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data checklist" });
  }
});

// POST tambah checklist
router.post("/", async (req, res) => {
  try {
    const item = new TtChecklist(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah checklist", error: err.message });
  }
});

export default router;
