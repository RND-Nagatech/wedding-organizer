import mongoose from "mongoose";

const TmPackageSchema = new mongoose.Schema({
  nama_paket: { type: String, required: true },
  tagline: { type: String },
  harga: { type: Number, required: true },
  fitur: [{ type: String }],
  // vendor allowed by kategori (flow baru: pilih kategori dulu, lalu vendor sesuai kategori)
  kategori_vendors: [
    {
      kategori_vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_vendor_category", required: true },
      vendor_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "tm_vendor" }],
    },
  ],
  vendor_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "tm_vendor" }],
  populer: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("tm_package", TmPackageSchema);
