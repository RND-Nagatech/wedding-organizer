import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

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
  .then(() => console.log("Terhubung ke MongoDB"))
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
import ttBookingRouter from "./routes/tt_booking.js";
import ttInvoiceRouter from "./routes/tt_invoice.js";
import ttChecklistRouter from "./routes/tt_checklist.js";
import ttPaymentRouter from "./routes/tt_payment.js";

app.use("/api/tm_vendor", tmVendorRouter);
app.use("/api/tm_kat_vendor", tmKatVendorRouter);
app.use("/api/tm_client", tmClientRouter);
app.use("/api/tm_package", tmPackageRouter);
app.use("/api/tt_booking", ttBookingRouter);
app.use("/api/tt_invoice", ttInvoiceRouter);
app.use("/api/tt_checklist", ttChecklistRouter);
app.use("/api/tt_payment", ttPaymentRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
