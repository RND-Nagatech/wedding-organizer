import mongoose from "mongoose";

const TtPaymentSchema = new mongoose.Schema(
  {
    kode_pembayaran: { type: String, unique: true, trim: true },
    kode_booking: { type: String, required: true, index: true, trim: true },
    kode_client: { type: String, required: true, index: true, trim: true },
    nama_client: { type: String, required: true, trim: true },
    total_tagihan: { type: Number, required: true },
    nominal_bayar: { type: Number, required: true },
    jenis_pembayaran: { type: String, enum: ["DP", "cicilan", "pelunasan"], required: true },
    sisa_tagihan: { type: Number, required: true },
    metode_pembayaran: { type: String, required: true, trim: true },
    tanggal_pembayaran: { type: String, required: true }, // yyyy-mm-dd
    status_pembayaran: {
      type: String,
      // backward compat: "belum bayar" masih diterima
      enum: ["belum_bayar", "belum bayar", "DP", "cicilan", "lunas"],
      required: true,
    },
    catatan: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("tt_payment", TtPaymentSchema);
