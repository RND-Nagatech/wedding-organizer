import mongoose from "mongoose";

const TmTestimoniSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    jabatan: { type: String, trim: true },
    isi_testimoni: { type: String, required: true, trim: true },
    foto: { type: String, trim: true }, // path /uploads/...
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif", index: true },
  },
  { timestamps: true }
);

TmTestimoniSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("tm_testimoni", TmTestimoniSchema);

