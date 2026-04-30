import mongoose from "mongoose";

const TtBookingSchema = new mongoose.Schema({
  kode_booking: { type: String, unique: true, trim: true },
  kode_client: { type: String, trim: true },
  // Tahap 5 fields
  client_id: { type: String, index: true },
  nama_client: { type: String, trim: true },
  paket_id: { type: String, index: true },
  adat_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_adat", index: true },
  pic: { type: String, trim: true },
  status_booking: {
    type: String,
    enum: ["draft", "menunggu_review", "approved", "rejected", "ongoing", "completed", "cancelled"],
    default: "menunggu_review",
    index: true,
  },
  status_event: { type: String, enum: ["draft", "aktif", "selesai", "batal"], default: "draft", index: true },
  status_review: { type: String, enum: ["menunggu_review", "approved", "rejected"], default: "menunggu_review", index: true },
  catatan: { type: String, trim: true },
  cancelled_at: { type: Date },
  cancelled_note: { type: String, trim: true },

  // Add-ons + final pricing (estimasi client, final WO)
  addons: [
    {
      addon_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_addon" },
      nama_addon: { type: String, trim: true },
      kategori_addon: { type: String, trim: true },
      deskripsi: { type: String, trim: true },
      satuan: { type: String, trim: true },
      qty: { type: Number, default: 0 },
      harga_satuan_default: { type: Number, default: 0 },
      harga_satuan_final: { type: Number, default: 0 },
      subtotal_default: { type: Number, default: 0 },
      subtotal_final: { type: Number, default: 0 },
    },
  ],
  harga_paket_estimasi: { type: Number, default: 0 }, // paket "mulai dari"
  harga_paket_final: { type: Number, default: 0 },
  biaya_tambahan: { type: Number, default: 0 },
  diskon: { type: Number, default: 0 },
  total_addons_estimasi: { type: Number, default: 0 },
  total_addons_final: { type: Number, default: 0 },
  total_estimasi: { type: Number, default: 0 },
  harga_final_booking: { type: Number, default: 0 },
  pricing_reviewed_at: { type: Date },
  // preferensi katalog client (snapshot-friendly)
  preferensi_katalog: {
    baju_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_katalog_baju" },
    dekorasi_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_katalog_dekorasi" },
    makeup_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_katalog_makeup" },
    baju_snapshot: { type: Object },
    dekorasi_snapshot: { type: Object },
    makeup_snapshot: { type: Object },
  },

  // Backward-compat (existing)
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
  jam_mulai: { type: String, trim: true }, // HH:mm (opsional)
  jam_selesai: { type: String, trim: true }, // HH:mm (opsional)
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
