import mongoose from "mongoose";

const TmAddonSchema = new mongoose.Schema(
  {
    nama_addon: { type: String, required: true, trim: true, index: true },
    kategori_addon: { type: String, trim: true, index: true },
    deskripsi: { type: String, trim: true },
    satuan: { type: String, trim: true }, // contoh: pcs, set, pax (bebas)
    harga_satuan_default: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("tm_addon", TmAddonSchema);

