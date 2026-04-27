import express from "express";
import TmClient from "../models/tm_client.js";
import { generateDailyCode } from "../utils/code.js";

const router = express.Router();

// GET semua klien
router.get("/", async (req, res) => {
  try {
    const clients = await TmClient.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data klien" });
  }
});

// POST tambah klien
router.post("/", async (req, res) => {
  try {
    if (!req.body?.telepon) {
      return res.status(400).json({ pesan: "Nomor HP wajib diisi" });
    }

    const kode_client = await generateDailyCode("CL");
    const client = new TmClient({ ...req.body, kode_client });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah klien", error: err.message });
  }
});

// PUT edit klien
router.put("/:id", async (req, res) => {
  try {
    if (req.body?.telepon === "" || req.body?.telepon == null) {
      return res.status(400).json({ pesan: "Nomor HP wajib diisi" });
    }

    const { kode_client, ...payload } = req.body || {};
    const existing = await TmClient.findById(req.params.id);
    if (!existing) return res.status(404).json({ pesan: "Klien tidak ditemukan" });

    if (!existing.kode_client) {
      payload.kode_client = await generateDailyCode("CL");
    }
    const client = await TmClient.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json(client);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit klien", error: err.message });
  }
});

// DELETE hapus klien
router.delete("/:id", async (req, res) => {
  try {
    const client = await TmClient.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ pesan: "Klien tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus klien", error: err.message });
  }
});

export default router;
