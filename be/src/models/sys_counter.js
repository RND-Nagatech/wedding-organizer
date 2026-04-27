import mongoose from "mongoose";

const SysCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g. "CL-260427"
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("sys_counter", SysCounterSchema);

