import express from "express";
import User from "../models/tm_user.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user
router.get("/:id", async (req, res) => {
  try {
    const data = await User.findById(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE user
router.post("/", async (req, res) => {
  try {
    const { nama, email, password, role, aktif } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email sudah terdaftar" });
    const hash = await bcrypt.hash(String(password), 10);
    const data = await User.create({ nama, email, password: hash, role, aktif });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE user
router.put("/:id", async (req, res) => {
  try {
    const { nama, email, password, role, aktif } = req.body || {};
    const payload = {};
    if (typeof nama !== "undefined") payload.nama = nama;
    if (typeof email !== "undefined") payload.email = email;
    if (typeof role !== "undefined") payload.role = role;
    if (typeof aktif !== "undefined") payload.aktif = aktif;
    if (typeof password !== "undefined" && String(password).trim()) {
      payload.password = await bcrypt.hash(String(password), 10);
    }
    const data = await User.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const data = await User.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
