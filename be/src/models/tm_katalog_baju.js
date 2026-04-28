import mongoose from "mongoose";

const TmKatalogBajuSchema = new mongoose.Schema(
  {
    nama_baju: { type: String, required: true, trim: true },
    kategori: { type: String, enum: ["akad", "resepsi", "prewedding"], required: true, index: true },
    adat_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_adat", required: true, index: true },
    model: { type: String, trim: true },
    warna: { type: String, trim: true },
    ukuran: { type: String, trim: true },
    foto: { type: String, trim: true }, // URL
    status: { type: String, enum: ["tersedia", "tidak tersedia"], default: "tersedia", index: true },
    catatan: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("tm_katalog_baju", TmKatalogBajuSchema);

