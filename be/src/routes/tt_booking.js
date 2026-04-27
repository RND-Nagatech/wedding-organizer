import express from "express";
import TtBooking from "../models/tt_booking.js";
import TmClient from "../models/tm_client.js";
import TmPackage from "../models/tm_package.js";
import TmVendor from "../models/tm_vendor.js";
import TtVendorBooking from "../models/tt_vendor_booking.js";
import { generateDailyCode } from "../utils/code.js";

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

function vendorStatusFromBookingStatus(status) {
  if (status === "Confirmed") return "booked";
  if (status === "Done") return "selesai";
  return "hold";
}

// GET available vendors for a package & date
// /api/tt_booking/available-vendors?package_id=...&tanggal_acara=yyyy-mm-dd
router.get("/available-vendors", async (req, res) => {
  try {
    const { package_id, tanggal_acara } = req.query;
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

    const vendors = await TmVendor.find({ _id: { $in: allowedVendorIds } }).sort({ createdAt: -1 });
    const available = vendors.filter((v) => !blockedSet.has(String(v._id)));

    res.json(available);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil vendor available", error: err.message });
  }
});

// POST tambah booking
router.post("/", async (req, res) => {
  try {
    const {
      id_klien,
      id_paket,
      tanggal_acara,
      lokasi,
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

    const booking = new TtBooking({
      kode_booking,
      kode_client: client.kode_client,
      id_klien: String(id_klien),
      id_paket: String(id_paket),
      paket_snapshot: {
        nama_paket: paket.nama_paket,
        tagline: paket.tagline,
        harga: paket.harga,
        fitur: paket.fitur,
        vendor_ids: allowedVendorIds,
      },
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

    const vendorBookingStatus = vendorStatusFromBookingStatus(booking.status);
    if (selectedVendorIds.length > 0) {
      await TtVendorBooking.insertMany(
        selectedVendorIds.map((vendorId) => ({
          kode_booking,
          vendor_id: vendorId,
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

    const { status, lokasi, tamu } = req.body || {};
    if (typeof lokasi !== "undefined") booking.lokasi = lokasi;
    if (typeof tamu !== "undefined") booking.tamu = tamu;
    if (typeof status !== "undefined") booking.status = status;

    if (!booking.kode_booking) {
      booking.kode_booking = await generateDailyCode("BK");
    }
    if (!booking.kode_client) {
      const client = await TmClient.findById(String(booking.id_klien));
      if (client?.kode_client) booking.kode_client = client.kode_client;
    }

    await booking.save();

    if (typeof status !== "undefined") {
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
