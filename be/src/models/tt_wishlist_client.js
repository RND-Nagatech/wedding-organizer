import mongoose from "mongoose";

const TtWishlistClientSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    kategori: {
      type: String,
      required: true,
      enum: ["baju", "dekorasi", "makeup", "aksesori", "rundown", "makanan", "lainnya"],
      index: true,
    },
    permintaan: { type: String, required: true, trim: true },
    prioritas: { type: String, enum: ["rendah", "sedang", "tinggi"], default: "sedang", index: true },
    pic: { type: String, trim: true },
    status: { type: String, enum: ["baru", "proses", "selesai", "tidak bisa"], default: "baru", index: true },
    catatan_wo: { type: String, trim: true },
  },
  { timestamps: true }
);

TtWishlistClientSchema.index({ kode_booking: 1, kategori: 1, status: 1 });

export default mongoose.model("tt_wishlist_client", TtWishlistClientSchema);

