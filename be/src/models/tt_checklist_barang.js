import mongoose from "mongoose";

const TtChecklistBarangSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    nama_barang: { type: String, required: true, trim: true },
    kategori_barang: {
      type: String,
      enum: ["baju", "aksesori", "dekorasi", "dokumen", "lainnya"],
      required: true,
      index: true,
    },
    jumlah: { type: Number, default: 1 },
    untuk_siapa: { type: String, trim: true },
    pic: { type: String, trim: true },
    status: {
      type: String,
      enum: ["belum_siap", "siap", "dibawa", "dikembalikan"],
      default: "belum_siap",
      index: true,
    },
    foto_barang: { type: String, trim: true },
    catatan: { type: String, trim: true },
  },
  { timestamps: true }
);

TtChecklistBarangSchema.index({ kode_booking: 1, kategori_barang: 1, status: 1 });

export default mongoose.model("tt_checklist_barang", TtChecklistBarangSchema);

