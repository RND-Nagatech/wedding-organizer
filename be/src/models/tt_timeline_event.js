import mongoose from "mongoose";

const TtTimelineEventSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    nama_tugas: { type: String, required: true, trim: true },
    kategori_tugas: { type: String, trim: true, index: true },
    deadline: { type: String, required: true, index: true }, // yyyy-mm-dd
    pic: { type: String, trim: true, index: true },
    status: {
      type: String,
      enum: ["belum_dikerjakan", "proses", "selesai", "terlambat"],
      default: "belum_dikerjakan",
      index: true,
    },
    catatan: { type: String, trim: true },
  },
  { timestamps: true }
);

TtTimelineEventSchema.index({ kode_booking: 1, status: 1, deadline: 1 });

export default mongoose.model("tt_timeline_event", TtTimelineEventSchema);

