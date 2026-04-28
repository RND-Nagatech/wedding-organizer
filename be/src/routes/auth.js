import express from "express";
import User from "../models/tm_user.js";
import Client from "../models/tm_client.js";
import { generateDailyCode } from "../utils/code.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// POST /api/auth/login
// body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ pesan: "Email dan password wajib diisi" });

    const emailLower = String(email).toLowerCase().trim();
    const pass = String(password);


    const staff = await User.findOne({ email: emailLower, aktif: true });
    if (staff && staff.password) {
      const match = await bcrypt.compare(pass, staff.password);
      if (match) {
        return res.json({
          role: staff.role,
          name: staff.nama,
          email: staff.email,
          userId: String(staff._id),
        });
      }
    }

    const client = await Client.findOne({ email: emailLower });
    if (client && client.password) {
      const match = await bcrypt.compare(pass, client.password);
      if (match) {
        return res.json({
          role: "client",
          name: `${client.nama_klien}`,
          email: client.email,
          clientId: String(client._id),
          clientCode: client.kode_client,
        });
      }
    }

    return res.status(401).json({ pesan: "Email/password salah" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal login", error: err.message });
  }
});

// POST /api/auth/register-client
// body: { nama_klien, pasangan, email, telepon, password }
router.post("/register-client", async (req, res) => {
  try {
    const { nama_klien, pasangan, email, telepon, password } = req.body || {};
    if (!nama_klien) return res.status(400).json({ pesan: "nama_klien wajib diisi" });
    if (!pasangan) return res.status(400).json({ pesan: "pasangan wajib diisi" });
    if (!email) return res.status(400).json({ pesan: "email wajib diisi" });
    if (!telepon) return res.status(400).json({ pesan: "telepon wajib diisi" });
    if (!password || String(password).length < 6) return res.status(400).json({ pesan: "password minimal 6 karakter" });

    const emailLower = String(email).toLowerCase().trim();
    const existsClient = await Client.findOne({ email: emailLower });
    if (existsClient) return res.status(400).json({ pesan: "Email sudah terdaftar sebagai klien" });
    const existsUser = await User.findOne({ email: emailLower });
    if (existsUser) return res.status(400).json({ pesan: "Email sudah terdaftar sebagai user staff" });

    const kode_client = await generateDailyCode("CL");
    const tanggal_pernikahan = new Date().toISOString().slice(0, 10);


    const hash = await bcrypt.hash(String(password), 10);
    const client = await Client.create({
      kode_client,
      nama_klien,
      pasangan,
      email: emailLower,
      telepon,
      password: hash,
      tanggal_pernikahan,
      status: "Lead",
    });

    res.status(201).json({
      role: "client",
      name: client.nama_klien,
      email: client.email,
      clientId: String(client._id),
      clientCode: client.kode_client,
    });
  } catch (err) {
    res.status(400).json({ pesan: "Gagal register klien", error: err.message });
  }
});

export default router;

