import mongoose from "mongoose";

const TtTimelineClientSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    nama_step: { type: String, required: true, trim: true },
    urutan: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ["belum_dikerjakan", "proses", "selesai"],
      default: "belum_dikerjakan",
      index: true,
    },
    catatan: { type: String, trim: true },
  },
  { timestamps: true }
);

TtTimelineClientSchema.index({ kode_booking: 1, urutan: 1 });

export default mongoose.model("tt_timeline_client", TtTimelineClientSchema);

