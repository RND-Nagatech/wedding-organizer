import mongoose from "mongoose";

const TtWaLogSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, index: true, trim: true },
    kode_client: { type: String, index: true, trim: true },
    no_hp_tujuan: { type: String, trim: true },
    jenis_notifikasi: { type: String, enum: ["booking_status", "pembayaran"], required: true, index: true },
    pesan: { type: String },
    file_pdf: { type: String, trim: true },
    status_kirim: { type: String, enum: ["pending", "sent", "failed"], default: "pending", index: true },
    error_message: { type: String },
    sent_at: { type: Date },
    // prevent duplicate notifications for the same event
    event_key: { type: String, trim: true, index: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model("tt_wa_log", TtWaLogSchema);

