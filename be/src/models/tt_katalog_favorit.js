import mongoose from "mongoose";

const TtKatalogFavoritSchema = new mongoose.Schema(
  {
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: "tm_client", required: true, index: true },
    kode_booking: { type: String, trim: true, index: true },
    katalog_type: {
      type: String,
      enum: ["baju", "dekorasi", "makeup"],
      required: true,
      index: true,
    },
    katalog_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
);

// prevent duplicates per client per item (regardless of kode_booking)
TtKatalogFavoritSchema.index({ client_id: 1, katalog_type: 1, katalog_id: 1 }, { unique: true });

export default mongoose.model("tt_katalog_favorit", TtKatalogFavoritSchema);

