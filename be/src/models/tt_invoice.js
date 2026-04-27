import mongoose from "mongoose";

const TtInvoiceSchema = new mongoose.Schema({
  id_booking: { type: String, required: true },
  id_klien: { type: String, required: true },
  jumlah: { type: Number, required: true },
  dibayar: { type: Number, default: 0 },
  jatuh_tempo: { type: String, required: true }, // yyyy-mm-dd
  status: { type: String, enum: ["Unpaid", "Partial", "Paid"], default: "Unpaid" },
});

export default mongoose.model("tt_invoice", TtInvoiceSchema);
