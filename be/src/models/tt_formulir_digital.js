import mongoose from "mongoose";

const TtFormulirDigitalSchema = new mongoose.Schema(
  {
    kode_booking: { type: String, required: true, index: true, trim: true },
    nama_pengantin_pria: { type: String, trim: true },
    nama_pengantin_wanita: { type: String, trim: true },
    nama_orang_tua_pria: { type: String, trim: true },
    nama_orang_tua_wanita: { type: String, trim: true },
    nama_wali: { type: String, trim: true },
    nama_saksi_1: { type: String, trim: true },
    nama_saksi_2: { type: String, trim: true },
    nama_MC: { type: String, trim: true },
    nama_penghulu: { type: String, trim: true },
    lokasi_akad: { type: String, trim: true },
    jam_akad: { type: String, trim: true }, // HH:mm
    lokasi_resepsi: { type: String, trim: true },
    jam_resepsi: { type: String, trim: true }, // HH:mm
    adat_konsep: { type: String, trim: true },
    warna_tema: { type: String, trim: true },
    jumlah_tamu: { type: Number },
    request_lagu: { type: String, trim: true },
    request_makanan: { type: String, trim: true },
    catatan_khusus: { type: String, trim: true },
    susunan_acara: { type: String, trim: true },
  },
  { timestamps: true }
);

TtFormulirDigitalSchema.index({ kode_booking: 1 });

export default mongoose.model("tt_formulir_digital", TtFormulirDigitalSchema);

