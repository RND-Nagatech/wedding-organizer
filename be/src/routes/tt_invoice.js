import express from "express";
import TtInvoice from "../models/tt_invoice.js";

const router = express.Router();

// GET semua invoice
router.get("/", async (req, res) => {
  try {
    const invoices = await TtInvoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data invoice" });
  }
});

// POST tambah invoice
router.post("/", async (req, res) => {
  try {
    const invoice = new TtInvoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah invoice", error: err.message });
  }
});

export default router;
