import mongoose from "mongoose";

const TmVendorSchema = new mongoose.Schema({
  nama_vendor: { type: String, required: true },
  kategori_vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_kat_vendor" },
  kategori_vendor_kode: { type: String, trim: true },
  kategori_vendor_nama: { type: String, trim: true },
  kontak: { type: String, trim: true },
  rating: { type: Number, default: 0 },
  rentang_harga: { type: String, trim: true },
  alamat: { type: String, required: true },
  telepon: { type: String, required: true },
  email: { type: String },
  tanggal_bergabung: { type: String, required: true }, // format yyyy-mm-dd
  status: { type: String, default: "aktif" },
}, { timestamps: true });

export default mongoose.model("tm_vendor", TmVendorSchema);
