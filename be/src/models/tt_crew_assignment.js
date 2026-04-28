import mongoose from "mongoose";

const TtCrewAssignmentSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    nama_crew: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["leader", "runner", "wardrobe", "makeup_assistant", "dokumentasi", "konsumsi", "transport", "lainnya"],
      required: true,
      index: true,
    },
    tanggal_tugas: { type: String, required: true, index: true }, // yyyy-mm-dd
    jam_mulai: { type: String, trim: true }, // HH:mm
    jam_selesai: { type: String, trim: true }, // HH:mm
    lokasi_tugas: { type: String, trim: true },
    catatan_tugas: { type: String, trim: true },
    status_hadir: {
      type: String,
      enum: ["belum_hadir", "hadir", "izin", "tidak_hadir"],
      default: "belum_hadir",
      index: true,
    },
  },
  { timestamps: true }
);

TtCrewAssignmentSchema.index({ kode_booking: 1, tanggal_tugas: 1, role: 1, status_hadir: 1 });

export default mongoose.model("tt_crew_assignment", TtCrewAssignmentSchema);

