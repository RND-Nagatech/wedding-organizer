import mongoose from "mongoose";

const TmAdatSchema = new mongoose.Schema(
  {
    nama_adat: { type: String, required: true, trim: true },
    deskripsi: { type: String, trim: true },
    warna_tema: { type: String, trim: true },
    referensi_dekorasi: { type: String, trim: true },
    referensi_baju: { type: String, trim: true },
    catatan: { type: String, trim: true },
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("tm_adat", TmAdatSchema);

