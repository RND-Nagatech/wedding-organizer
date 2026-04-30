import mongoose from "mongoose";

const TmKatalogDekorasiSchema = new mongoose.Schema(
  {
    nama_dekorasi: { type: String, required: true, trim: true },
    tema: { type: String, trim: true },
    adat_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_adat", required: false, index: true },
    warna_dominan: { type: String, trim: true },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_vendor", index: true },
    harga: { type: Number, default: 0 },
    foto: { type: String, trim: true }, // URL
    catatan: { type: String, trim: true },
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("tm_katalog_dekorasi", TmKatalogDekorasiSchema);
