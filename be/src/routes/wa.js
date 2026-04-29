import express from "express";
import { waConnect, waGetQrDataUrl, waGetStatus, waLogout, waReconnect } from "../services/whatsapp.js";

const router = express.Router();

router.get("/status", async (_req, res) => {
  res.json(waGetStatus());
});

router.post("/connect", async (_req, res) => {
  const st = await waConnect();
  res.json(st);
});

router.post("/reconnect", async (_req, res) => {
  const st = await waReconnect();
  res.json(st);
});

router.post("/logout", async (_req, res) => {
  const st = await waLogout();
  res.json(st);
});

router.get("/qr", async (_req, res) => {
  const dataUrl = await waGetQrDataUrl();
  res.json({ qr: dataUrl });
});

export default router;

