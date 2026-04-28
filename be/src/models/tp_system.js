import mongoose from "mongoose";

const tpSystemSchema = new mongoose.Schema({
  nama_bisnis: { type: String, required: true },
  alamat: { type: String },
  telepon: { type: String },
  email: { type: String },
  website: { type: String },
  npwp: { type: String },
  logo_url: { type: String },
}, { timestamps: true });

const SystemProfile = mongoose.model("tp_system", tpSystemSchema);
export default SystemProfile;
