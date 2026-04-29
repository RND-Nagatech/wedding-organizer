//
//
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createDefaultUser } from "./utils/createDefaultUser.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;


mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log("Terhubung ke MongoDB");
    await createDefaultUser();
  })
  .catch((err) => console.error("Gagal terhubung ke MongoDB:", err));

// Contoh route root
app.get("/", (req, res) => {
  res.json({ pesan: "API Wedding Organizer aktif" });
});


// Route master: Vendor

import tmVendorRouter from "./routes/tm_vendor.js";
import tmKatVendorRouter from "./routes/tm_kat_vendor.js";
import tmClientRouter from "./routes/tm_client.js";
import tmPackageRouter from "./routes/tm_package.js";
import tmUserRouter from "./routes/tm_user.js";
import ttBookingRouter from "./routes/tt_booking.js";
import ttInvoiceRouter from "./routes/tt_invoice.js";
import ttChecklistRouter from "./routes/tt_checklist.js";
import ttPaymentRouter from "./routes/tt_payment.js";
import uploadRouter from "./routes/upload.js";
import tmAdatRouter from "./routes/tm_adat.js";
import tmKatalogBajuRouter from "./routes/tm_katalog_baju.js";
import tmKatalogDekorasiRouter from "./routes/tm_katalog_dekorasi.js";
import tmKatalogMakeupRouter from "./routes/tm_katalog_makeup.js";
import tmAddonRouter from "./routes/tm_addon.js";
import ttVendorBookingRouter from "./routes/tt_vendor_booking.js";
import ttReferensiClientRouter from "./routes/tt_referensi_client.js";
import ttWishlistClientRouter from "./routes/tt_wishlist_client.js";
import ttChecklistBarangRouter from "./routes/tt_checklist_barang.js";
import ttCrewAssignmentRouter from "./routes/tt_crew_assignment.js";
import ttTimelineEventRouter from "./routes/tt_timeline_event.js";
import ttKeuanganRouter from "./routes/tt_keuangan.js";
import reportsRouter from "./routes/reports.js";
import authRouter from "./routes/auth.js";
import ttFormulirDigitalRouter from "./routes/tt_formulir_digital.js";
import ttTimelineClientRouter from "./routes/tt_timeline_client.js";
import tpSystemRouter from "./routes/tp_system.js";
import ttKatalogFavoritRouter from "./routes/tt_katalog_favorit.js";
app.use("/api/tp_system", tpSystemRouter);

app.use("/uploads", express.static("uploads"));

app.use("/api/tm_vendor", tmVendorRouter);
app.use("/api/tm_kat_vendor", tmKatVendorRouter);
app.use("/api/tm_client", tmClientRouter);
app.use("/api/tm_package", tmPackageRouter);
app.use("/api/tm_user", tmUserRouter);
app.use("/api/tt_booking", ttBookingRouter);
app.use("/api/tt_invoice", ttInvoiceRouter);
app.use("/api/tt_checklist", ttChecklistRouter);
app.use("/api/tt_payment", ttPaymentRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/tm_adat", tmAdatRouter);
app.use("/api/tm_katalog_baju", tmKatalogBajuRouter);
app.use("/api/tm_katalog_dekorasi", tmKatalogDekorasiRouter);
app.use("/api/tm_katalog_makeup", tmKatalogMakeupRouter);
app.use("/api/tm_addon", tmAddonRouter);
app.use("/api/tt_vendor_booking", ttVendorBookingRouter);
app.use("/api/tt_referensi_client", ttReferensiClientRouter);
app.use("/api/tt_wishlist_client", ttWishlistClientRouter);
app.use("/api/tt_checklist_barang", ttChecklistBarangRouter);
app.use("/api/tt_crew_assignment", ttCrewAssignmentRouter);
app.use("/api/tt_timeline_event", ttTimelineEventRouter);
app.use("/api/tt_keuangan", ttKeuanganRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/auth", authRouter);
app.use("/api/tt_formulir_digital", ttFormulirDigitalRouter);
app.use("/api/tt_timeline_client", ttTimelineClientRouter);
app.use("/api/tt_katalog_favorit", ttKatalogFavoritRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
