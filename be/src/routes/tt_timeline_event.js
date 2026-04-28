import express from "express";
import TtTimelineEvent from "../models/tt_timeline_event.js";

const router = express.Router();

const todayISO = () => new Date().toISOString().slice(0, 10);

const normalizeStatus = (deadline, status) => {
  if (!deadline) return status;
  const isOverdue = String(deadline) < todayISO();
  if (status === "selesai") return "selesai";
  if (isOverdue) return "terlambat";
  return status || "belum_dikerjakan";
};

// GET list (filter: kode_booking, pic, status)
router.get("/", async (req, res) => {
  try {
    const { kode_booking, pic, status } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (pic) q.pic = String(pic);
    if (status) q.status = String(status);

    const data = await TtTimelineEvent.find(q).sort({ deadline: 1, createdAt: -1 });
    res.json(data);
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
    if (!payload.deadline) return res.status(400).json({ pesan: "deadline wajib diisi" });

    const data = await TtTimelineEvent.create({
      kode_booking: payload.kode_booking,
      nama_tugas: payload.nama_tugas,
      kategori_tugas: payload.kategori_tugas,
      deadline: payload.deadline,
      pic: payload.pic,
      status: normalizeStatus(payload.deadline, payload.status),
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

    const nextDeadline = typeof payload.deadline !== "undefined" ? payload.deadline : existing.deadline;
    const nextStatus = typeof payload.status !== "undefined" ? payload.status : existing.status;

    const data = await TtTimelineEvent.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.kode_booking !== "undefined" ? { kode_booking: payload.kode_booking } : {}),
        ...(typeof payload.nama_tugas !== "undefined" ? { nama_tugas: payload.nama_tugas } : {}),
        ...(typeof payload.kategori_tugas !== "undefined" ? { kategori_tugas: payload.kategori_tugas } : {}),
        ...(typeof payload.deadline !== "undefined" ? { deadline: payload.deadline } : {}),
        ...(typeof payload.pic !== "undefined" ? { pic: payload.pic } : {}),
        ...(typeof payload.catatan !== "undefined" ? { catatan: payload.catatan } : {}),
        ...(typeof payload.status !== "undefined" || typeof payload.deadline !== "undefined"
          ? { status: normalizeStatus(nextDeadline, nextStatus) }
          : {}),
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

