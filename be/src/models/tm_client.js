import mongoose from "mongoose";

const TmClientSchema = new mongoose.Schema({
  kode_client: { type: String, unique: true, trim: true },
  nama_klien: { type: String, required: true },
  pasangan: { type: String, required: true },
  email: { type: String },
  telepon: { type: String, required: true },
  password: { type: String, trim: true },
  tanggal_pernikahan: { type: String, required: true }, // yyyy-mm-dd
  id_paket: { type: String },
  status: { type: String, enum: ["Lead", "Booked", "Ongoing", "Completed"], default: "Lead" },
  anggaran: { type: Number },
}, { timestamps: true });

export default mongoose.model("tm_client", TmClientSchema);
