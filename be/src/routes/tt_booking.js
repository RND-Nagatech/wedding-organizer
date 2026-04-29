import express from "express";
import TtBooking from "../models/tt_booking.js";
import TmClient from "../models/tm_client.js";
import TmPackage from "../models/tm_package.js";
import TmVendor from "../models/tm_vendor.js";
import TtVendorBooking from "../models/tt_vendor_booking.js";
import TmKatalogBaju from "../models/tm_katalog_baju.js";
import TmKatalogDekorasi from "../models/tm_katalog_dekorasi.js";
import TmKatalogMakeup from "../models/tm_katalog_makeup.js";
import TtTimelineClient from "../models/tt_timeline_client.js";
import TtTimelineEvent from "../models/tt_timeline_event.js";
import { generateDailyCode } from "../utils/code.js";
import TmAddon from "../models/tm_addon.js";

const router = express.Router();

// GET semua booking
router.get("/", async (req, res) => {
  try {
    const bookings = await TtBooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil data booking" });
  }
});

function deriveStatusBooking({ status_booking, status_review, status_event }) {
  if (status_booking) return String(status_booking);
  if (String(status_event || "") === "aktif") return "ongoing";
  if (String(status_event || "") === "selesai") return "completed";
  if (String(status_event || "") === "batal") return "cancelled";
  if (String(status_review || "") === "approved") return "approved";
  if (String(status_review || "") === "rejected") return "rejected";
  return "menunggu_review";
}

function mapStatusBookingToLegacy(status_booking) {
  const s = String(status_booking || "");
  if (s === "draft") return { status_review: "menunggu_review", status_event: "draft" };
  if (s === "menunggu_review") return { status_review: "menunggu_review", status_event: "draft" };
  // approved berarti booking sudah disetujui dan vendor harus di-lock (legacy: aktif)
  if (s === "approved") return { status_review: "approved", status_event: "aktif" };
  if (s === "rejected") return { status_review: "rejected", status_event: "batal" };
  if (s === "ongoing") return { status_review: "approved", status_event: "aktif" };
  if (s === "completed") return { status_review: "approved", status_event: "selesai" };
  if (s === "cancelled") return { status_review: "rejected", status_event: "batal" };
  return null;
}

function normalizeMoney(v) {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return 0;
  return n;
}

function computePricing({ paketHargaEstimasi, paketHargaFinal, addons, biayaTambahan, diskon }) {
  const safeAddons = Array.isArray(addons) ? addons : [];
  const totalAddonsEstimasi = safeAddons.reduce((s, a) => s + normalizeMoney(a.subtotal_default), 0);
  const totalAddonsFinal = safeAddons.reduce((s, a) => s + normalizeMoney(a.subtotal_final), 0);
  const totalEstimasi = normalizeMoney(paketHargaEstimasi) + totalAddonsEstimasi + normalizeMoney(biayaTambahan) - normalizeMoney(diskon);
  const hargaFinalBooking = normalizeMoney(paketHargaFinal) + totalAddonsFinal + normalizeMoney(biayaTambahan) - normalizeMoney(diskon);
  return { totalAddonsEstimasi, totalAddonsFinal, totalEstimasi, hargaFinalBooking };
}

function vendorStatusFromBookingStatus(status) {
  if (status === "Confirmed") return "booked";
  if (status === "Done") return "selesai";
  return "hold";
}

function vendorStatusFromEventStatus(status_event) {
  if (status_event === "selesai") return "selesai";
  if (status_event === "batal") return "batal";
  if (status_event === "aktif") return "booked";
  return "hold"; // draft
}

function addDaysISO(isoDate, days) {
  try {
    const d = new Date(`${isoDate}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  } catch {
    return isoDate;
  }
}

async function upsertVendorBookingsForBooking({
  kode_booking,
  tanggal_acara,
  vendorDocs,
  status,
}) {
  const kode = String(kode_booking || "");
  const date = String(tanggal_acara || "");
  const pickedIds = vendorDocs.map((v) => String(v._id));

  // release vendors not in selection (avoid wiping history of selesai/batal)
  await TtVendorBooking.updateMany(
    {
      kode_booking: kode,
      tanggal_acara: date,
      vendor_id: { $nin: pickedIds },
      status: { $in: ["hold", "booked"] },
    },
    { $set: { status: "batal" } }
  );

  for (const v of vendorDocs) {
    await TtVendorBooking.updateOne(
      { kode_booking: kode, vendor_id: v._id, tanggal_acara: date },
      {
        $set: {
          kategori_vendor_id: v.kategori_vendor_id || undefined,
          status,
        },
      },
      { upsert: true }
    );
  }
}

// GET available vendors for a package & date
// /api/tt_booking/available-vendors?package_id=...&tanggal_acara=yyyy-mm-dd
router.get("/available-vendors", async (req, res) => {
  try {
    const { package_id, tanggal_acara, kategori_vendor_id } = req.query;
    if (!package_id || !tanggal_acara) {
      return res.status(400).json({ pesan: "package_id dan tanggal_acara wajib diisi" });
    }

    const paket = await TmPackage.findById(String(package_id));
    if (!paket) return res.status(404).json({ pesan: "Paket tidak ditemukan" });

    const allowedVendorIds = (paket.vendor_ids || []).map((id) => String(id));
    if (allowedVendorIds.length === 0) return res.json([]);

    const blocked = await TtVendorBooking.find({
      vendor_id: { $in: allowedVendorIds },
      tanggal_acara: String(tanggal_acara),
      status: { $in: ["hold", "booked"] },
    }).select("vendor_id");
    const blockedSet = new Set(blocked.map((b) => String(b.vendor_id)));

    const vendorQuery = { _id: { $in: allowedVendorIds } };
    if (kategori_vendor_id) vendorQuery.kategori_vendor_id = String(kategori_vendor_id);

    const vendors = await TmVendor.find(vendorQuery).sort({ createdAt: -1 });
    const available = vendors.filter((v) => !blockedSet.has(String(v._id)));

    res.json(available);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil vendor available", error: err.message });
  }
});

// GET vendor options for editing vendor final (include availability)
// /api/tt_booking/vendor-options?package_id=...&tanggal_acara=yyyy-mm-dd&kategori_vendor_id=...&kode_booking=... (optional)
router.get("/vendor-options", async (req, res) => {
  try {
    const { package_id, tanggal_acara, kategori_vendor_id, kode_booking } = req.query;
    if (!package_id || !tanggal_acara || !kategori_vendor_id) {
      return res.status(400).json({ pesan: "package_id, tanggal_acara, dan kategori_vendor_id wajib diisi" });
    }

    const paket = await TmPackage.findById(String(package_id));
    if (!paket) return res.status(404).json({ pesan: "Paket tidak ditemukan" });

    // Allowed vendors by kategori (preferred) or fallback vendor_ids filtered by kategori
    let allowedVendorIds = [];
    const kategoriRows = Array.isArray(paket.kategori_vendors) ? paket.kategori_vendors : [];
    const row = kategoriRows.find((r) => String(r.kategori_vendor_id?._id || r.kategori_vendor_id) === String(kategori_vendor_id));
    if (row && Array.isArray(row.vendor_ids)) {
      allowedVendorIds = row.vendor_ids.map((x) => String(x?._id || x)).filter(Boolean);
    } else {
      allowedVendorIds = (paket.vendor_ids || []).map((x) => String(x)).filter(Boolean);
    }
    if (allowedVendorIds.length === 0) return res.json([]);

    const vendorDocs = await TmVendor.find({
      _id: { $in: allowedVendorIds },
      kategori_vendor_id: String(kategori_vendor_id),
    }).sort({ createdAt: -1 });

    const blocked = await TtVendorBooking.find({
      vendor_id: { $in: allowedVendorIds },
      tanggal_acara: String(tanggal_acara),
      status: { $in: ["hold", "booked"] },
      ...(kode_booking ? { kode_booking: { $ne: String(kode_booking) } } : {}),
    }).select("vendor_id status kode_booking");
    const blockedMap = new Map(blocked.map((b) => [String(b.vendor_id), { status: b.status, kode_booking: b.kode_booking }]));

    const out = vendorDocs.map((v) => {
      const blk = blockedMap.get(String(v._id));
      return {
        _id: v._id,
        nama_vendor: v.nama_vendor,
        kategori_vendor_id: v.kategori_vendor_id,
        kategori_vendor_nama: v.kategori_vendor_nama,
        telepon: v.telepon,
        kontak: v.kontak,
        rentang_harga: v.rentang_harga,
        available: !blk,
        blocked_status: blk?.status,
        blocked_by: blk?.kode_booking,
      };
    });

    res.json(out);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil vendor options", error: err.message });
  }
});

// POST tambah booking
router.post("/", async (req, res) => {
  try {
    const {
      // Tahap 5 payload (preferred)
      client_id,
      paket_id,
      lokasi_acara,
      status_booking,
      status_event,
      status_review,
      adat_id,
      pic,
      catatan,
      preferensi_katalog,
      addons,

      // Backward compat payload
      id_klien = client_id,
      id_paket = paket_id,
      tanggal_acara,
      lokasi = lokasi_acara,
      tamu,
      status,
      vendor_dipilih_ids = [],
    } = req.body || {};

    if (!id_klien || !id_paket || !tanggal_acara) {
      return res.status(400).json({ pesan: "Klien, paket, dan tanggal acara wajib diisi" });
    }

    const client = await TmClient.findById(String(id_klien));
    if (!client) return res.status(400).json({ pesan: "Klien tidak valid" });
    if (!client.kode_client) {
      client.kode_client = await generateDailyCode("CL");
      await client.save();
    }

    const paket = await TmPackage.findById(String(id_paket));
    if (!paket) return res.status(400).json({ pesan: "Paket tidak valid" });

    // Add-ons snapshot (default)
    const picked = Array.isArray(addons) ? addons : [];
    const pickedIds = picked.map((a) => String(a.addon_id || a._id || a.id || "")).filter(Boolean);
    const addonDocs = pickedIds.length ? await TmAddon.find({ _id: { $in: pickedIds } }) : [];
    const addonMap = new Map(addonDocs.map((d) => [String(d._id), d]));
    const bookingAddons = picked
      .map((raw) => {
        const id = String(raw.addon_id || raw._id || raw.id || "");
        const doc = addonMap.get(id);
        if (!doc) return null;
        const qty = Math.max(0, Math.floor(Number(raw.qty || 0)));
        if (!qty) return null;
        const hargaDefault = normalizeMoney(doc.harga_satuan_default);
        const subtotalDefault = qty * hargaDefault;
        return {
          addon_id: doc._id,
          nama_addon: doc.nama_addon,
          kategori_addon: doc.kategori_addon,
          deskripsi: doc.deskripsi,
          satuan: doc.satuan,
          qty,
          harga_satuan_default: hargaDefault,
          harga_satuan_final: hargaDefault,
          subtotal_default: subtotalDefault,
          subtotal_final: subtotalDefault,
        };
      })
      .filter(Boolean);

    const allowedVendorIds = (paket.vendor_ids || []).map((id) => String(id));
    const selectedVendorIds = (Array.isArray(vendor_dipilih_ids) ? vendor_dipilih_ids : [])
      .map(String)
      .filter(Boolean);

    const invalidPick = selectedVendorIds.find((vId) => !allowedVendorIds.includes(vId));
    if (invalidPick) {
      return res.status(400).json({ pesan: "Vendor yang dipilih tidak termasuk dalam paket" });
    }

    // availability check (hold/booked)
    if (selectedVendorIds.length > 0) {
      const taken = await TtVendorBooking.find({
        vendor_id: { $in: selectedVendorIds },
        tanggal_acara: String(tanggal_acara),
        status: { $in: ["hold", "booked"] },
      }).populate("vendor_id");

      if (taken.length > 0) {
        return res.status(409).json({
          pesan: "Ada vendor yang tidak available pada tanggal tersebut",
          vendor_tidak_tersedia: taken.map((t) => ({
            vendor_id: String(t.vendor_id?._id || t.vendor_id),
            nama_vendor: t.vendor_id?.nama_vendor,
            status: t.status,
          })),
        });
      }
    }

    const kode_booking = await generateDailyCode("BK");
    const vendorDocs = selectedVendorIds.length
      ? await TmVendor.find({ _id: { $in: selectedVendorIds } })
      : [];

    // snapshot preferensi katalog (agar riwayat tidak berubah jika master diedit)
    let pref = preferensi_katalog || {};
    const bajuId = pref?.baju_id ? String(pref.baju_id) : null;
    const dekorasiId = pref?.dekorasi_id ? String(pref.dekorasi_id) : null;
    const makeupId = pref?.makeup_id ? String(pref.makeup_id) : null;
    const bajuDoc = bajuId ? await TmKatalogBaju.findById(bajuId) : null;
    const dekorDoc = dekorasiId ? await TmKatalogDekorasi.findById(dekorasiId) : null;
    const makeupDoc = makeupId ? await TmKatalogMakeup.findById(makeupId) : null;

    const booking = new TtBooking({
      kode_booking,
      kode_client: client.kode_client,
      client_id: String(id_klien),
      nama_client: `${client.nama_klien} & ${client.pasangan}`,
      id_klien: String(id_klien),
      id_paket: String(id_paket),
      paket_id: String(id_paket),
      adat_id: adat_id || undefined,
      pic,
      status_booking: deriveStatusBooking({ status_booking, status_review, status_event }),
      status_event: (mapStatusBookingToLegacy(deriveStatusBooking({ status_booking, status_review, status_event }))?.status_event) || status_event || "draft",
      status_review: (mapStatusBookingToLegacy(deriveStatusBooking({ status_booking, status_review, status_event }))?.status_review) || status_review || "menunggu_review",
      catatan,
      preferensi_katalog: {
        baju_id: bajuId || undefined,
        dekorasi_id: dekorasiId || undefined,
        makeup_id: makeupId || undefined,
        baju_snapshot: bajuDoc
          ? { nama_baju: bajuDoc.nama_baju, kategori: bajuDoc.kategori, adat_id: bajuDoc.adat_id, model: bajuDoc.model, warna: bajuDoc.warna, ukuran: bajuDoc.ukuran, foto: bajuDoc.foto, status: bajuDoc.status, catatan: bajuDoc.catatan }
          : undefined,
        dekorasi_snapshot: dekorDoc
          ? { nama_dekorasi: dekorDoc.nama_dekorasi, tema: dekorDoc.tema, adat_id: dekorDoc.adat_id, warna_dominan: dekorDoc.warna_dominan, vendor_id: dekorDoc.vendor_id, harga: dekorDoc.harga, foto: dekorDoc.foto, catatan: dekorDoc.catatan, status: dekorDoc.status }
          : undefined,
        makeup_snapshot: makeupDoc
          ? { nama_style: makeupDoc.nama_style, kategori: makeupDoc.kategori, vendor_mua_id: makeupDoc.vendor_mua_id, foto: makeupDoc.foto, harga: makeupDoc.harga, catatan: makeupDoc.catatan, status: makeupDoc.status }
          : undefined,
      },
      paket_snapshot: {
        nama_paket: paket.nama_paket,
        tagline: paket.tagline,
        harga: paket.harga,
        fitur: paket.fitur,
        vendor_ids: allowedVendorIds,
      },
      addons: bookingAddons,
      harga_paket_estimasi: normalizeMoney(paket.harga),
      harga_paket_final: normalizeMoney(paket.harga),
      biaya_tambahan: 0,
      diskon: 0,
      total_addons_estimasi: computePricing({
        paketHargaEstimasi: normalizeMoney(paket.harga),
        paketHargaFinal: normalizeMoney(paket.harga),
        addons: bookingAddons,
        biayaTambahan: 0,
        diskon: 0,
      }).totalAddonsEstimasi,
      total_addons_final: computePricing({
        paketHargaEstimasi: normalizeMoney(paket.harga),
        paketHargaFinal: normalizeMoney(paket.harga),
        addons: bookingAddons,
        biayaTambahan: 0,
        diskon: 0,
      }).totalAddonsFinal,
      total_estimasi: computePricing({
        paketHargaEstimasi: normalizeMoney(paket.harga),
        paketHargaFinal: normalizeMoney(paket.harga),
        addons: bookingAddons,
        biayaTambahan: 0,
        diskon: 0,
      }).totalEstimasi,
      harga_final_booking: computePricing({
        paketHargaEstimasi: normalizeMoney(paket.harga),
        paketHargaFinal: normalizeMoney(paket.harga),
        addons: bookingAddons,
        biayaTambahan: 0,
        diskon: 0,
      }).hargaFinalBooking,
      tanggal_acara: String(tanggal_acara),
      lokasi,
      tamu,
      vendor_dipilih_ids: selectedVendorIds,
      vendor_dipilih_snapshot: vendorDocs.map((v) => ({
        vendor_id: String(v._id),
        nama_vendor: v.nama_vendor,
        kategori_vendor_id: v.kategori_vendor_id ? String(v.kategori_vendor_id) : undefined,
        kategori_vendor_nama: v.kategori_vendor_nama,
        telepon: v.telepon,
        kontak: v.kontak,
        rentang_harga: v.rentang_harga,
      })),
      status,
    });

    await booking.save();

    const vendorBookingStatus =
      typeof booking.status_event !== "undefined"
        ? vendorStatusFromEventStatus(booking.status_event)
        : vendorStatusFromBookingStatus(booking.status);
    if (selectedVendorIds.length > 0) {
      await TtVendorBooking.insertMany(
        vendorDocs.map((v) => ({
          kode_booking,
          vendor_id: v._id,
          kategori_vendor_id: v.kategori_vendor_id || undefined,
          tanggal_acara: String(tanggal_acara),
          status: vendorBookingStatus,
        }))
      );
    }

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal menambah booking", error: err.message });
  }
});

// PUT update booking (status/lokasi/tamu)
router.put("/:id", async (req, res) => {
  try {
    const booking = await TtBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ pesan: "Booking tidak ditemukan" });
    const prevReviewStatus = booking.status_review;
    const prevStatusBooking = booking.status_booking;

    const {
      // Tahap 5
      tanggal_acara,
      lokasi_acara,
      status_booking,
      status_event,
      status_review,
      adat_id,
      pic,
      catatan,
      client_id,
      paket_id,
      preferensi_katalog,
      addons,
      harga_paket_final,
      biaya_tambahan,
      diskon,

      // Backward compat
      status,
      lokasi,
      tamu,
      id_klien,
      id_paket,
    } = req.body || {};

    // Tahap 6: allow updating vendor selection (write to tt_vendor_booking)
    const vendor_dipilih_ids =
      Array.isArray(req.body?.vendor_dipilih_ids) ? req.body.vendor_dipilih_ids.map(String).filter(Boolean) : undefined;

    const nextTanggal = typeof tanggal_acara !== "undefined" ? String(tanggal_acara) : booking.tanggal_acara;
    const nextLokasi =
      typeof lokasi_acara !== "undefined"
        ? lokasi_acara
        : typeof lokasi !== "undefined"
          ? lokasi
          : booking.lokasi;

    booking.tanggal_acara = nextTanggal;
    booking.lokasi = nextLokasi;

    if (typeof tamu !== "undefined") booking.tamu = tamu;
    if (typeof status !== "undefined") booking.status = status;
    if (typeof status_booking !== "undefined") {
      const next = deriveStatusBooking({ status_booking, status_review: booking.status_review, status_event: booking.status_event });
      booking.status_booking = next;
      const legacy = mapStatusBookingToLegacy(next);
      if (legacy?.status_event) booking.status_event = legacy.status_event;
      if (legacy?.status_review) booking.status_review = legacy.status_review;
    }
    if (typeof status_event !== "undefined") booking.status_event = status_event;
    if (typeof status_review !== "undefined") booking.status_review = status_review;
    // keep status_booking in sync when legacy fields are updated directly
    if (typeof status_event !== "undefined" || typeof status_review !== "undefined") {
      booking.status_booking = deriveStatusBooking({
        status_review: booking.status_review,
        status_event: booking.status_event,
      });
    }
    if (typeof adat_id !== "undefined") booking.adat_id = adat_id || undefined;
    if (typeof pic !== "undefined") booking.pic = pic;
    if (typeof catatan !== "undefined") booking.catatan = catatan;

    // pricing updates (WO)
    if (
      typeof addons !== "undefined" ||
      typeof harga_paket_final !== "undefined" ||
      typeof biaya_tambahan !== "undefined" ||
      typeof diskon !== "undefined"
    ) {
      const nextAddons = typeof addons !== "undefined" ? (Array.isArray(addons) ? addons : []) : booking.addons || [];
      const normalizedAddons = (nextAddons || [])
        .map((a) => {
          const qty = Math.max(0, Math.floor(Number(a.qty || 0)));
          const hargaDefault = normalizeMoney(a.harga_satuan_default);
          const hargaFinal = normalizeMoney(typeof a.harga_satuan_final !== "undefined" ? a.harga_satuan_final : a.harga_satuan_default);
          const subtotalDefault = normalizeMoney(typeof a.subtotal_default !== "undefined" ? a.subtotal_default : qty * hargaDefault);
          const subtotalFinal = qty * hargaFinal;
          return {
            addon_id: a.addon_id || a._id || a.id,
            nama_addon: a.nama_addon,
            kategori_addon: a.kategori_addon,
            deskripsi: a.deskripsi,
            satuan: a.satuan,
            qty,
            harga_satuan_default: hargaDefault,
            harga_satuan_final: hargaFinal,
            subtotal_default: subtotalDefault,
            subtotal_final: subtotalFinal,
          };
        })
        .filter((a) => a.qty > 0);

      booking.addons = normalizedAddons;
      booking.harga_paket_estimasi = normalizeMoney(booking.paket_snapshot?.harga) || booking.harga_paket_estimasi || 0;
      if (typeof harga_paket_final !== "undefined") booking.harga_paket_final = normalizeMoney(harga_paket_final);
      if (typeof biaya_tambahan !== "undefined") booking.biaya_tambahan = normalizeMoney(biaya_tambahan);
      if (typeof diskon !== "undefined") booking.diskon = normalizeMoney(diskon);

      const computed = computePricing({
        paketHargaEstimasi: booking.harga_paket_estimasi,
        paketHargaFinal: booking.harga_paket_final || booking.harga_paket_estimasi,
        addons: normalizedAddons,
        biayaTambahan: booking.biaya_tambahan,
        diskon: booking.diskon,
      });
      booking.total_addons_estimasi = computed.totalAddonsEstimasi;
      booking.total_addons_final = computed.totalAddonsFinal;
      booking.total_estimasi = computed.totalEstimasi;
      booking.harga_final_booking = computed.hargaFinalBooking;
    }
    if (typeof preferensi_katalog !== "undefined") {
      const pref = preferensi_katalog || {};
      const bajuId = pref?.baju_id ? String(pref.baju_id) : null;
      const dekorasiId = pref?.dekorasi_id ? String(pref.dekorasi_id) : null;
      const makeupId = pref?.makeup_id ? String(pref.makeup_id) : null;
      const bajuDoc = bajuId ? await TmKatalogBaju.findById(bajuId) : null;
      const dekorDoc = dekorasiId ? await TmKatalogDekorasi.findById(dekorasiId) : null;
      const makeupDoc = makeupId ? await TmKatalogMakeup.findById(makeupId) : null;
      booking.preferensi_katalog = {
        baju_id: bajuId || undefined,
        dekorasi_id: dekorasiId || undefined,
        makeup_id: makeupId || undefined,
        baju_snapshot: bajuDoc
          ? { nama_baju: bajuDoc.nama_baju, kategori: bajuDoc.kategori, adat_id: bajuDoc.adat_id, model: bajuDoc.model, warna: bajuDoc.warna, ukuran: bajuDoc.ukuran, foto: bajuDoc.foto, status: bajuDoc.status, catatan: bajuDoc.catatan }
          : undefined,
        dekorasi_snapshot: dekorDoc
          ? { nama_dekorasi: dekorDoc.nama_dekorasi, tema: dekorDoc.tema, adat_id: dekorDoc.adat_id, warna_dominan: dekorDoc.warna_dominan, vendor_id: dekorDoc.vendor_id, harga: dekorDoc.harga, foto: dekorDoc.foto, catatan: dekorDoc.catatan, status: dekorDoc.status }
          : undefined,
        makeup_snapshot: makeupDoc
          ? { nama_style: makeupDoc.nama_style, kategori: makeupDoc.kategori, vendor_mua_id: makeupDoc.vendor_mua_id, foto: makeupDoc.foto, harga: makeupDoc.harga, catatan: makeupDoc.catatan, status: makeupDoc.status }
          : undefined,
      };
    }

    if (typeof client_id !== "undefined" || typeof id_klien !== "undefined") {
      const newClientId = String(client_id || id_klien);
      booking.client_id = newClientId;
      booking.id_klien = newClientId;
      const client = await TmClient.findById(newClientId);
      if (client) {
        if (!client.kode_client) {
          client.kode_client = await generateDailyCode("CL");
          await client.save();
        }
        booking.kode_client = client.kode_client;
        booking.nama_client = `${client.nama_klien} & ${client.pasangan}`;
      }
    }

    if (typeof paket_id !== "undefined" || typeof id_paket !== "undefined") {
      const newPackageId = String(paket_id || id_paket);
      booking.paket_id = newPackageId;
      booking.id_paket = newPackageId;

      const paket = await TmPackage.findById(newPackageId);
      if (paket) {
        booking.paket_snapshot = {
          nama_paket: paket.nama_paket,
          tagline: paket.tagline,
          harga: paket.harga,
          fitur: paket.fitur,
          vendor_ids: (paket.vendor_ids || []).map((x) => String(x)),
        };
      }
    }

    if (!booking.kode_booking) {
      booking.kode_booking = await generateDailyCode("BK");
    }
    if (!booking.kode_client) {
      const client = await TmClient.findById(String(booking.id_klien));
      if (client?.kode_client) booking.kode_client = client.kode_client;
    }

    await booking.save();

    const isApprovalTransition =
      prevReviewStatus !== "approved" &&
      booking.status_review === "approved" &&
      booking.kode_booking;

    // On approval: generate default timelines (client + internal) if not exists
    if (isApprovalTransition) {
      const kode = String(booking.kode_booking);
      const clientCount = await TtTimelineClient.countDocuments({ kode_booking: kode });
      if (clientCount === 0) {
        await TtTimelineClient.insertMany([
          { kode_booking: kode, urutan: 1, nama_step: "konsultasi" },
          { kode_booking: kode, urutan: 2, nama_step: "pilih paket" },
          { kode_booking: kode, urutan: 3, nama_step: "pilih konsep/adat" },
          { kode_booking: kode, urutan: 4, nama_step: "finalisasi desain" },
          { kode_booking: kode, urutan: 5, nama_step: "pembayaran DP" },
          { kode_booking: kode, urutan: 6, nama_step: "technical meeting" },
          { kode_booking: kode, urutan: 7, nama_step: "pelunasan" },
          { kode_booking: kode, urutan: 8, nama_step: "hari H" },
        ]);
      }

      const internalCount = await TtTimelineEvent.countDocuments({ kode_booking: kode });
      if (internalCount === 0) {
        await TtTimelineEvent.insertMany([
          { kode_booking: kode, nama_tugas: "cek availability vendor", kategori_tugas: "vendor" },
          { kode_booking: kode, nama_tugas: "hubungi vendor", kategori_tugas: "vendor" },
          { kode_booking: kode, nama_tugas: "finalisasi dekorasi", kategori_tugas: "operasional" },
          { kode_booking: kode, nama_tugas: "fitting baju", kategori_tugas: "operasional" },
          { kode_booking: kode, nama_tugas: "assign crew", kategori_tugas: "crew" },
          { kode_booking: kode, nama_tugas: "checklist barang", kategori_tugas: "barang" },
          { kode_booking: kode, nama_tugas: "rundown final", kategori_tugas: "rundown" },
        ]);
      }
    }

    // Keep vendor booking status in sync with status_booking transition (even when only status_booking is sent)
    // - approved/ongoing => booked
    // - completed => selesai
    // - rejected/cancelled => batal
    if (booking.kode_booking && prevStatusBooking !== booking.status_booking) {
      await TtVendorBooking.updateMany(
        { kode_booking: String(booking.kode_booking) },
        { $set: { status: vendorStatusFromEventStatus(booking.status_event), tanggal_acara: String(booking.tanggal_acara) } }
      );
    }

    // On approval (or already approved/ongoing): ensure selected vendors are locked as booked in tt_vendor_booking
    if (booking.kode_booking && ["approved", "ongoing"].includes(String(booking.status_booking || ""))) {
      const picked = Array.isArray(booking.vendor_dipilih_ids) ? booking.vendor_dipilih_ids.map(String).filter(Boolean) : [];
      if (picked.length > 0) {
        const kode = String(booking.kode_booking);
        const vendorDocs = await TmVendor.find({ _id: { $in: picked } });
        await upsertVendorBookingsForBooking({
          kode_booking: kode,
          tanggal_acara: booking.tanggal_acara,
          vendorDocs,
          status: "booked",
        });
      }
    }

    if (typeof vendor_dipilih_ids !== "undefined") {
      const paket = await TmPackage.findById(String(booking.id_paket));
      const allowedVendorIds = (paket?.vendor_ids || []).map((x) => String(x));
      const invalidPick = vendor_dipilih_ids.find((vId) => !allowedVendorIds.includes(vId));
      if (invalidPick) {
        return res.status(400).json({ pesan: "Vendor yang dipilih tidak termasuk dalam paket" });
      }

      if (vendor_dipilih_ids.length > 0) {
        const taken = await TtVendorBooking.find({
          vendor_id: { $in: vendor_dipilih_ids },
          tanggal_acara: String(booking.tanggal_acara),
          status: { $in: ["hold", "booked"] },
          kode_booking: { $ne: booking.kode_booking },
        }).populate("vendor_id");
        if (taken.length > 0) {
          return res.status(409).json({
            pesan: "Ada vendor yang tidak available pada tanggal tersebut",
            vendor_tidak_tersedia: taken.map((t) => ({
              vendor_id: String(t.vendor_id?._id || t.vendor_id),
              nama_vendor: t.vendor_id?.nama_vendor,
              status: t.status,
            })),
          });
        }
      }

      const vendorDocs = vendor_dipilih_ids.length
        ? await TmVendor.find({ _id: { $in: vendor_dipilih_ids } })
        : [];

      booking.vendor_dipilih_ids = vendor_dipilih_ids;
      booking.vendor_dipilih_snapshot = vendorDocs.map((v) => ({
        vendor_id: String(v._id),
        nama_vendor: v.nama_vendor,
        kategori_vendor_id: v.kategori_vendor_id ? String(v.kategori_vendor_id) : undefined,
        kategori_vendor_nama: v.kategori_vendor_nama,
        telepon: v.telepon,
        kontak: v.kontak,
        rentang_harga: v.rentang_harga,
      }));
      await booking.save();

      const vendorBookingStatus = vendorStatusFromEventStatus(booking.status_event);
      await upsertVendorBookingsForBooking({
        kode_booking: booking.kode_booking,
        tanggal_acara: booking.tanggal_acara,
        vendorDocs,
        status: vendorBookingStatus,
      });
    }

    if (typeof status_event !== "undefined") {
      await TtVendorBooking.updateMany(
        { kode_booking: booking.kode_booking },
        { $set: { status: vendorStatusFromEventStatus(booking.status_event) } }
      );
    } else if (typeof status !== "undefined") {
      await TtVendorBooking.updateMany(
        { kode_booking: booking.kode_booking },
        { $set: { status: vendorStatusFromBookingStatus(booking.status) } }
      );
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ pesan: "Gagal mengedit booking", error: err.message });
  }
});

// DELETE booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await TtBooking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ pesan: "Booking tidak ditemukan" });
    if (booking.kode_booking) {
      await TtVendorBooking.updateMany(
        { kode_booking: booking.kode_booking },
        { $set: { status: "batal" } }
      );
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal menghapus booking", error: err.message });
  }
});

export default router;
