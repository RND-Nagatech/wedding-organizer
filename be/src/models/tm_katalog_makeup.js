import mongoose from "mongoose";

const TmKatalogMakeupSchema = new mongoose.Schema(
  {
    nama_style: { type: String, required: true, trim: true },
    kategori: { type: String, enum: ["natural", "bold", "glam", "adat", "modern"], required: true, index: true },
    vendor_mua_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_vendor", required: true, index: true },
    foto: { type: String, trim: true }, // URL
    harga: { type: Number, default: 0 },
    catatan: { type: String, trim: true },
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("tm_katalog_makeup", TmKatalogMakeupSchema);

