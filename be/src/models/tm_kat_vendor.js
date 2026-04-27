import mongoose from "mongoose";

const tmKatVendorSchema = new mongoose.Schema({
  kode_kategori: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nama_kategori: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

const KatVendor = mongoose.model("tm_kat_vendor", tmKatVendorSchema);
export default KatVendor;
