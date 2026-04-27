import mongoose from "mongoose";

const TtVendorBookingSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_vendor", required: true, index: true },
    tanggal_acara: { type: String, required: true, index: true }, // yyyy-mm-dd
    status: {
      type: String,
      enum: ["hold", "booked", "selesai", "batal"],
      default: "hold",
      index: true,
    },
  },
  { timestamps: true }
);

TtVendorBookingSchema.index({ vendor_id: 1, tanggal_acara: 1, status: 1 });

export default mongoose.model("tt_vendor_booking", TtVendorBookingSchema);

