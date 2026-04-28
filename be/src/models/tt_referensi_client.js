import mongoose from "mongoose";

const TtReferensiClientSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    kategori: {
      type: String,
      required: true,
      enum: ["baju", "dekorasi", "makeup", "aksesori", "lainnya"],
      index: true,
    },
    upload_gambar: { type: String, trim: true },
    judul_referensi: { type: String, trim: true },
    catatan_client: { type: String, trim: true },
    status: {
      type: String,
      enum: ["diajukan", "disetujui", "ditolak", "revisi"],
      default: "diajukan",
      index: true,
    },
    catatan_staff: { type: String, trim: true },
  },
  { timestamps: true }
);

TtReferensiClientSchema.index({ kode_booking: 1, kategori: 1, status: 1 });

export default mongoose.model("tt_referensi_client", TtReferensiClientSchema);

