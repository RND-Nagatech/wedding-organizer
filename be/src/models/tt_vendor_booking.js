import mongoose from "mongoose";

const TtVendorBookingSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_vendor", required: true, index: true },
    kategori_vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_kat_vendor", index: true },
    tanggal_acara: { type: String, required: true, index: true }, // yyyy-mm-dd
    jam_mulai: { type: String, trim: true }, // HH:mm
    jam_selesai: { type: String, trim: true }, // HH:mm
    status: {
      type: String,
      enum: ["hold", "booked", "selesai", "batal"],
      default: "hold",
      index: true,
    },
    catatan: { type: String, trim: true },
  },
  { timestamps: true }
);

TtVendorBookingSchema.index({ vendor_id: 1, tanggal_acara: 1, status: 1 });
TtVendorBookingSchema.index({ kode_booking: 1, vendor_id: 1, kategori_vendor_id: 1 }, { unique: true, sparse: true });

export default mongoose.model("tt_vendor_booking", TtVendorBookingSchema);
