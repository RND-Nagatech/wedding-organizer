import express from "express";
import TtCrewAssignment from "../models/tt_crew_assignment.js";

const router = express.Router();

// GET list (filter: kode_booking, tanggal_tugas, role, status_hadir)
router.get("/", async (req, res) => {
  try {
    const { kode_booking, tanggal_tugas, role, status_hadir } = req.query;
    const q = {};
    if (kode_booking) q.kode_booking = String(kode_booking);
    if (tanggal_tugas) q.tanggal_tugas = String(tanggal_tugas);
    if (role) q.role = String(role);
    if (status_hadir) q.status_hadir = String(status_hadir);

    const data = await TtCrewAssignment.find(q).sort({ tanggal_tugas: -1, createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data crew assignment", error: err.message });
  }
});

// POST create
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.kode_booking) return res.status(400).json({ pesan: "kode_booking wajib diisi" });
    if (!payload.nama_crew) return res.status(400).json({ pesan: "nama_crew wajib diisi" });
    if (!payload.role) return res.status(400).json({ pesan: "role wajib diisi" });
    if (!payload.tanggal_tugas) return res.status(400).json({ pesan: "tanggal_tugas wajib diisi" });

    const data = await TtCrewAssignment.create({
      kode_booking: payload.kode_booking,
      nama_crew: payload.nama_crew,
      role: payload.role,
      tanggal_tugas: payload.tanggal_tugas,
      jam_mulai: payload.jam_mulai,
      jam_selesai: payload.jam_selesai,
      lokasi_tugas: payload.lokasi_tugas,
      catatan_tugas: payload.catatan_tugas,
      status_hadir: payload.status_hadir,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah crew assignment", error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    const data = await TtCrewAssignment.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeof payload.kode_booking !== "undefined" ? { kode_booking: payload.kode_booking } : {}),
        ...(typeof payload.nama_crew !== "undefined" ? { nama_crew: payload.nama_crew } : {}),
        ...(typeof payload.role !== "undefined" ? { role: payload.role } : {}),
        ...(typeof payload.tanggal_tugas !== "undefined" ? { tanggal_tugas: payload.tanggal_tugas } : {}),
        ...(typeof payload.jam_mulai !== "undefined" ? { jam_mulai: payload.jam_mulai } : {}),
        ...(typeof payload.jam_selesai !== "undefined" ? { jam_selesai: payload.jam_selesai } : {}),
        ...(typeof payload.lokasi_tugas !== "undefined" ? { lokasi_tugas: payload.lokasi_tugas } : {}),
        ...(typeof payload.catatan_tugas !== "undefined" ? { catatan_tugas: payload.catatan_tugas } : {}),
        ...(typeof payload.status_hadir !== "undefined" ? { status_hadir: payload.status_hadir } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit crew assignment", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const data = await TtCrewAssignment.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ pesan: "Data tidak ditemukan" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus crew assignment", error: err.message });
  }
});

export default router;

