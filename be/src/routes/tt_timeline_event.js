import express from "express";
import TtTimelineEvent from "../models/tt_timeline_event.js";

const router = express.Router();

function normalizeStatus(status) {
  const raw = String(status || "belum_dikerjakan");
  // legacy cleanup
  if (raw === "terlambat") return "belum_dikerjakan";
  if (raw === "") return "belum_dikerjakan";
  return raw;
}

function normalizeDeadline(deadline) {
  const d = String(deadline || "").trim();
  return d ? d : undefined;
}

// GET list (filter: kode_booking, pic, status, tanggal_dari, tanggal_sampai)
router.get("/", async (req, res) => {
  try {
    const { kode_booking, pic, status, tanggal_dari, tanggal_sampai } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (pic) q.pic = String(pic);
    if (status) q.status = String(status);

    if (tanggal_dari || tanggal_sampai) {
      q.deadline = {};
      if (tanggal_dari) q.deadline.$gte = String(tanggal_dari);
      if (tanggal_sampai) q.deadline.$lte = String(tanggal_sampai);
    }

    const data = await TtTimelineEvent.find(q).sort({ deadline: 1, createdAt: -1 });
    // legacy cleanup: remove "terlambat" from response
    res.json(
      data.map((d) => {
        const obj = d.toObject ? d.toObject() : d;
        if (obj.status === "terlambat") obj.status = "belum_dikerjakan";
        return obj;
      })
    );
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data timeline event", error: err.message });
  }
});

// POST create
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kode_booking) return res.status(400).json({ pesan: "kode_booking wajib diisi" });
    if (!payload.nama_tugas) return res.status(400).json({ pesan: "nama_tugas wajib diisi" });

    const deadline = normalizeDeadline(payload.deadline);

    const data = await TtTimelineEvent.create({
      kode_booking: payload.kode_booking,
      nama_tugas: payload.nama_tugas,
      kategori_tugas: payload.kategori_tugas,
      ...(deadline ? { deadline } : {}),
      pic: payload.pic,
      status: normalizeStatus(payload.status),
      catatan: payload.catatan,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah timeline event", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const existing = await TtTimelineEvent.findById(req.params.id);
    if (!existing) return res.status(404).json({ pesan: "Data tidak ditemukan" });

    const nextDeadline = typeof payload.deadline !== "undefined" ? normalizeDeadline(payload.deadline) : existing.deadline;
    const nextStatus = typeof payload.status !== "undefined" ? normalizeStatus(payload.status) : normalizeStatus(existing.status);

    const data = await TtTimelineEvent.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.kode_booking !== "undefined" ? { kode_booking: payload.kode_booking } : {}),
        ...(typeof payload.nama_tugas !== "undefined" ? { nama_tugas: payload.nama_tugas } : {}),
        ...(typeof payload.kategori_tugas !== "undefined" ? { kategori_tugas: payload.kategori_tugas } : {}),
        ...(typeof payload.deadline !== "undefined" ? (nextDeadline ? { deadline: nextDeadline } : { $unset: { deadline: "" } }) : {}),
        ...(typeof payload.pic !== "undefined" ? { pic: payload.pic } : {}),
        ...(typeof payload.catatan !== "undefined" ? { catatan: payload.catatan } : {}),
        ...(typeof payload.status !== "undefined" ? { status: nextStatus } : {}),
      },
      { new: true, runValidators: true }
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit timeline event", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const data = await TtTimelineEvent.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus timeline event", error: err.message });
  }
});

export default router;
