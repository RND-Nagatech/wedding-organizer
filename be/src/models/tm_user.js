import mongoose from "mongoose";

const tmUserSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["owner", "admin", "staff"], default: "staff" },
  aktif: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model("tm_user", tmUserSchema);
export default User;
