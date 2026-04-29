import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth, MessageMedia } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let waClient = null;
let lastQr = null; // raw QR string
let lastQrAt = null;
let status = "disconnected"; // connected | disconnected | connecting
let connectedNumber = null;
let lastError = null;
let lastState = null;

function ensureClient() {
  if (waClient) return waClient;

  status = "connecting";
  lastQr = null;
  lastQrAt = null;
  connectedNumber = null;
  lastError = null;
  lastState = null;

  waClient = new Client({
    authStrategy: new LocalAuth({
      // saved under be/.wwebjs_auth (persist across restarts)
      dataPath: path.resolve(__dirname, "../../.wwebjs_auth"),
    }),
    puppeteer: {
      // safer defaults for many linux envs
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {}),
    },
  });

  waClient.on("qr", (qr) => {
    lastQr = qr;
    lastQrAt = new Date();
    status = "disconnected";
  });

  waClient.on("ready", async () => {
    status = "connected";
    lastQr = null;
    lastQrAt = null;
    try {
      const info = waClient.info;
      connectedNumber = info?.wid?.user ? String(info.wid.user) : null;
    } catch {
      connectedNumber = null;
    }
  });

  waClient.on("authenticated", () => {
    status = "connecting";
    lastState = "authenticated";
  });

  waClient.on("auth_failure", () => {
    status = "disconnected";
    connectedNumber = null;
    lastError = "auth_failure";
  });

  waClient.on("disconnected", () => {
    status = "disconnected";
    connectedNumber = null;
  });

  waClient.on("change_state", (st) => {
    lastState = String(st || "");
  });

  waClient.on("loading_screen", (percent, message) => {
    lastState = `loading:${percent}%${message ? `:${message}` : ""}`;
  });

  waClient.on("error", (err) => {
    lastError = err?.message || String(err || "unknown_error");
  });

  // fire and forget init
  waClient
    .initialize()
    .catch((err) => {
      lastError = err?.message || String(err || "init_failed");
      status = "disconnected";
    });

  // also track unhandled errors
  try {
    waClient.pupPage?.on?.("pageerror", (err) => {
      lastError = err?.message || String(err || "pageerror");
    });
  } catch {}

  return waClient;
}

export function waGetStatus() {
  return {
    status,
    connectedNumber,
    hasQr: Boolean(lastQr),
    lastQrAt,
    lastError,
    lastState,
  };
}

export async function waGetQrDataUrl() {
  if (!lastQr) return null;
  return QRCode.toDataURL(lastQr, { margin: 1, width: 320 });
}

export async function waConnect() {
  ensureClient();
  return waGetStatus();
}

export async function waReconnect() {
  try {
    if (waClient) {
      await waClient.destroy();
    }
  } catch {}
  waClient = null;
  lastQr = null;
  lastQrAt = null;
  status = "connecting";
  connectedNumber = null;
  ensureClient();
  return waGetStatus();
}

export async function waLogout() {
  if (!waClient) return waGetStatus();
  try {
    await waClient.logout();
  } catch {}
  try {
    await waClient.destroy();
  } catch {}
  waClient = null;
  lastQr = null;
  lastQrAt = null;
  status = "disconnected";
  connectedNumber = null;
  return waGetStatus();
}

export async function waSendMessageWithPdf({ to, message, pdfPath, filename }) {
  const client = ensureClient();
  if (status !== "connected") {
    throw new Error("WhatsApp belum terkoneksi");
  }
  if (!to) throw new Error("Nomor tujuan kosong");
  if (!message) throw new Error("Pesan kosong");

  await client.sendMessage(to, message);

  if (pdfPath) {
    const abs = path.isAbsolute(pdfPath) ? pdfPath : path.resolve(process.cwd(), pdfPath);
    if (!fs.existsSync(abs)) throw new Error("File PDF tidak ditemukan");
    const media = MessageMedia.fromFilePath(abs);
    await client.sendMessage(to, media, { sendMediaAsDocument: true, filename: filename || "document.pdf" });
  }
}
