import express from "express";
import TtKatalogFavorit from "../models/tt_katalog_favorit.js";

const router = express.Router();

// GET list (filter: client_id, katalog_type, kode_booking)
router.get("/", async (req, res) => {
  try {
    const { client_id, katalog_type, kode_booking } = req.query;
    const q = {};
    if (client_id) q.client_id = String(client_id);
    if (katalog_type) q.katalog_type = String(katalog_type);
    if (kode_booking) q.kode_booking = String(kode_booking);
    const rows = await TtKatalogFavorit.find(q).sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil favorit katalog", error: err.message });
  }
});

// POST add (idempotent: upsert)
router.post("/", async (req, res) => {
  try {
    const { client_id, katalog_type, katalog_id, kode_booking } = req.body || {};
    if (!client_id) return res.status(400).json({ pesan: "client_id wajib diisi" });
    if (!katalog_type) return res.status(400).json({ pesan: "katalog_type wajib diisi" });
    if (!katalog_id) return res.status(400).json({ pesan: "katalog_id wajib diisi" });

    const row = await TtKatalogFavorit.findOneAndUpdate(
      { client_id: String(client_id), katalog_type: String(katalog_type), katalog_id: String(katalog_id) },
      { $setOnInsert: { client_id: String(client_id), katalog_type: String(katalog_type), katalog_id: String(katalog_id) }, ...(kode_booking ? { $set: { kode_booking: String(kode_booking) } } : {}) },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(row);
  } catch (err) {
    // duplicate key -> return existing
    if (String(err?.code) === "11000") {
      try {
        const { client_id, katalog_type, katalog_id } = req.body || {};
        const existing = await TtKatalogFavorit.findOne({ client_id: String(client_id), katalog_type: String(katalog_type), katalog_id: String(katalog_id) });
        if (existing) return res.status(200).json(existing);
      } catch {}
    }
    res.status(400).json({ pesan: "Gagal menambah favorit", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const row = await TtKatalogFavorit.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ pesan: "Favorit tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus favorit", error: err.message });
  }
});

export default router;

