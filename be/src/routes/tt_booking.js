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

function vendorStatusFromEventStatus(status_event) {
  if (status_event === "selesai") return "selesai";
  if (status_event === "batal") return "batal";
  if (status_event === "aktif") return "booked";
  return "hold"; // draft
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

// POST tambah booking
router.post("/", async (req, res) => {
  try {
    const {
      // Tahap 5 payload (preferred)
      client_id,
      paket_id,
      lokasi_acara,
      status_event,
      adat_id,
      pic,
      catatan,

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
      client_id: String(id_klien),
      nama_client: `${client.nama_klien} & ${client.pasangan}`,
      id_klien: String(id_klien),
      id_paket: String(id_paket),
      paket_id: String(id_paket),
      adat_id: adat_id || undefined,
      pic,
      status_event: status_event || "draft",
      catatan,
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

    const {
      // Tahap 5
      tanggal_acara,
      lokasi_acara,
      status_event,
      adat_id,
      pic,
      catatan,
      client_id,
      paket_id,

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
    if (typeof status_event !== "undefined") booking.status_event = status_event;
    if (typeof adat_id !== "undefined") booking.adat_id = adat_id || undefined;
    if (typeof pic !== "undefined") booking.pic = pic;
    if (typeof catatan !== "undefined") booking.catatan = catatan;

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

      await TtVendorBooking.updateMany(
        { kode_booking: booking.kode_booking },
        { $set: { status: "batal" } }
      );

      const vendorBookingStatus = vendorStatusFromEventStatus(booking.status_event);
      if (vendorDocs.length > 0) {
        await TtVendorBooking.insertMany(
          vendorDocs.map((v) => ({
            kode_booking: booking.kode_booking,
            vendor_id: v._id,
            kategori_vendor_id: v.kategori_vendor_id || undefined,
            tanggal_acara: String(booking.tanggal_acara),
            status: vendorBookingStatus,
          }))
        );
      }
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
