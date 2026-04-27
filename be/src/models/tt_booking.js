import mongoose from "mongoose";

const TtBookingSchema = new mongoose.Schema({
  kode_booking: { type: String, unique: true, trim: true },
  kode_client: { type: String, trim: true },
  id_klien: { type: String, required: true },
  id_paket: { type: String, required: true },
  paket_snapshot: {
    nama_paket: { type: String },
    tagline: { type: String },
    harga: { type: Number },
    fitur: [{ type: String }],
    vendor_ids: [{ type: String }],
  },
  tanggal_acara: { type: String, required: true }, // yyyy-mm-dd
  lokasi: { type: String },
  tamu: { type: Number },
  vendor_dipilih_ids: [{ type: String }],
  vendor_dipilih_snapshot: [
    {
      vendor_id: { type: String },
      nama_vendor: { type: String },
      kategori_vendor_id: { type: String },
      kategori_vendor_nama: { type: String },
      telepon: { type: String },
      kontak: { type: String },
      rentang_harga: { type: String },
    },
  ],
  status: { type: String, enum: ["Pending", "Confirmed", "Done"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model("tt_booking", TtBookingSchema);
