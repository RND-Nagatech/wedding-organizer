import mongoose from "mongoose";

const TtKeuanganSchema = new mongoose.Schema(
  {
    no_trx: { type: String, unique: true, trim: true },
    tgl_trx: { type: String, required: true, index: true }, // yyyy-mm-dd
    kategori: {
      type: String,
      enum: ["DP", "cicilan", "pelunasan", "vendor", "operasional", "lainnya"],
      required: true,
      index: true,
    },
    keterangan: { type: String, trim: true },
    jumlah_in: { type: Number, default: 0 },
    jumlah_out: { type: Number, default: 0 },
    // linkage (optional) untuk sinkron pembayaran -> keuangan
    ref_type: { type: String, trim: true, index: true },
    ref_id: { type: String, trim: true, index: true },
  },
  { timestamps: true }
);

TtKeuanganSchema.index({ tgl_trx: 1, kategori: 1 });

export default mongoose.model("tt_keuangan", TtKeuanganSchema);

