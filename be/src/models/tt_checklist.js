import mongoose from "mongoose";

const TtChecklistSchema = new mongoose.Schema({
  id_booking: { type: String, required: true },
  judul: { type: String, required: true },
  tenggat: { type: String, required: true }, // yyyy-mm-dd
  selesai: { type: Boolean, default: false },
  kategori: { type: String },
});

export default mongoose.model("tt_checklist", TtChecklistSchema);
