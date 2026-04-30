import express from "express";
import TtBooking from "../models/tt_booking.js";
import TtTimelineEvent from "../models/tt_timeline_event.js";
import TtPayment from "../models/tt_payment.js";
import TtKeuangan from "../models/tt_keuangan.js";
import TmPackage from "../models/tm_package.js";
import TtVendorBooking from "../models/tt_vendor_booking.js";
import TmVendor from "../models/tm_vendor.js";

const router = express.Router();

// Helpers
const sum = (arr) => arr.reduce((s, x) => s + (Number(x) || 0), 0);

// 1) Laporan Event
// GET /api/reports/events?tgl_from=yyyy-mm-dd&tgl_to=...&status_event=aktif&paket_id=...&pic=...
router.get("/events", async (req, res) => {
  try {
    const { tgl_from, tgl_to, status_event, paket_id, pic } = req.query;
    const q = {};
    if (status_event) q.status_event = String(status_event);
    // id_paket dan paket_id bisa berbeda, cek dua2nya
    if (paket_id) {
      // Cari booking yang id_paket atau paket_id sama
      q.$or = [
        { id_paket: String(paket_id) },
        { paket_id: String(paket_id) }
      ];
    }
    if (pic) q.pic = String(pic);
    if (tgl_from || tgl_to) {
      q.tanggal_acara = {};
      if (tgl_from) q.tanggal_acara.$gte = String(tgl_from);
      if (tgl_to) q.tanggal_acara.$lte = String(tgl_to);
    }

    const bookings = await TtBooking.find(q).sort({ tanggal_acara: -1, createdAt: -1 });
    const kodeBookings = bookings.map((b) => b.kode_booking).filter(Boolean);

    const tasks = kodeBookings.length
      ? await TtTimelineEvent.find({ kode_booking: { $in: kodeBookings } }).select("kode_booking status")
      : [];

    const grouped = new Map();
    for (const t of tasks) {
      const kb = String(t.kode_booking || "");
      if (!kb) continue;
      const cur = grouped.get(kb) || { total: 0, done: 0 };
      cur.total += 1;
      if (t.status === "selesai") cur.done += 1;
      grouped.set(kb, cur);
    }

    res.json(
      bookings.map((b) => {
        const g = grouped.get(String(b.kode_booking || "")) || { total: 0, done: 0 };
        const progress_percent = g.total ? Math.round((g.done / g.total) * 100) : 0;
        return {
          kode_booking: b.kode_booking,
          kode_client: b.kode_client,
          nama_client: b.nama_client,
          tanggal_acara: b.tanggal_acara,
          paket: b.paket_snapshot?.nama_paket,
          paket_id: b.id_paket,
          status_event: b.status_event,
          progress_percent,
          pic: b.pic,
        };
      })
    );
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil laporan event", error: err.message });
  }
});

// 2) Laporan Pembayaran Klien (aggregate per booking)
// GET /api/reports/payments?tgl_from=...&tgl_to=...&status=lunas|belum&kode_client=...
router.get("/payments", async (req, res) => {
  try {
    const { tgl_from, tgl_to, status, kode_client } = req.query;
    const q = {};
    // kode_client kadang bisa kode_client atau id_klien
    if (kode_client) {
      q.$or = [
        { kode_client: String(kode_client) },
        { id_klien: String(kode_client) }
      ];
    }
    if (tgl_from || tgl_to) {
      q.tanggal_pembayaran = {};
      if (tgl_from) q.tanggal_pembayaran.$gte = String(tgl_from);
      if (tgl_to) q.tanggal_pembayaran.$lte = String(tgl_to);
    }

    const rows = await TtPayment.find(q).sort({ tanggal_pembayaran: -1, createdAt: -1 });
    const map = new Map();
    for (const p of rows) {
      const kb = String(p.kode_booking);
      const cur = map.get(kb) || {
        kode_booking: kb,
        kode_client: p.kode_client,
        nama_client: p.nama_client,
        total_tagihan: Number(p.total_tagihan) || 0,
        DP: 0,
        cicilan: 0,
        total_bayar: 0,
        sisa_pembayaran: 0,
        status_pembayaran: "belum",
      };

      const jenis = p.jenis_pembayaran || p.status_pembayaran;
      if (jenis === "DP") cur.DP += Number(p.nominal_bayar) || 0;
      else if (jenis === "cicilan") cur.cicilan += Number(p.nominal_bayar) || 0;
      else if (jenis === "pelunasan") cur.cicilan += Number(p.nominal_bayar) || 0;

      cur.total_bayar += Number(p.nominal_bayar) || 0;
      cur.total_tagihan = Math.max(cur.total_tagihan, Number(p.total_tagihan) || 0);
      map.set(kb, cur);
    }

    const result = Array.from(map.values()).map((r) => {
      r.sisa_pembayaran = Math.max(r.total_tagihan - r.total_bayar, 0);
      r.status_pembayaran = r.sisa_pembayaran === 0 ? "lunas" : "belum";
      return r;
    });

    const filtered = typeof status !== "undefined" ? result.filter((r) => r.status_pembayaran === String(status)) : result;
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil laporan pembayaran", error: err.message });
  }
});

// 3) Laporan Keuangan Detail
// GET /api/reports/keuangan-detail?tgl_from=...&tgl_to=...&kategori=...
router.get("/keuangan-detail", async (req, res) => {
  try {
    const { tgl_from, tgl_to, kategori } = req.query;
    const q = {};
    if (kategori) q.kategori = String(kategori);
    if (tgl_from || tgl_to) {
      q.tgl_trx = {};
      if (tgl_from) q.tgl_trx.$gte = String(tgl_from);
      if (tgl_to) q.tgl_trx.$lte = String(tgl_to);
    }

    const rows = await TtKeuangan.find(q).sort({ tgl_trx: 1, createdAt: 1 });
    let saldo = 0;
    const out = rows.map((r) => {
      saldo += (Number(r.jumlah_in) || 0) - (Number(r.jumlah_out) || 0);
      return {
        no_trx: r.no_trx,
        tgl_trx: r.tgl_trx,
        kategori: r.kategori,
        keterangan: r.keterangan,
        jumlah_in: Number(r.jumlah_in) || 0,
        jumlah_out: Number(r.jumlah_out) || 0,
        saldo_berjalan: saldo,
      };
    });
    res.json(out);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil laporan keuangan detail", error: err.message });
  }
});

// 4) Laporan Keuangan Rekap
// GET /api/reports/keuangan-rekap?tgl_from=...&tgl_to=...
router.get("/keuangan-rekap", async (req, res) => {
  try {
    const { tgl_from, tgl_to } = req.query;
    const q = {};
    if (tgl_from || tgl_to) {
      q.tgl_trx = {};
      if (tgl_from) q.tgl_trx.$gte = String(tgl_from);
      if (tgl_to) q.tgl_trx.$lte = String(tgl_to);
    }
    const rows = await TtKeuangan.find(q);
    const byKat = new Map();
    for (const r of rows) {
      const k = String(r.kategori);
      const cur = byKat.get(k) || { kategori: k, total_in: 0, total_out: 0, saldo: 0 };
      cur.total_in += Number(r.jumlah_in) || 0;
      cur.total_out += Number(r.jumlah_out) || 0;
      cur.saldo = cur.total_in - cur.total_out;
      byKat.set(k, cur);
    }
    const data = Array.from(byKat.values()).sort((a, b) => a.kategori.localeCompare(b.kategori));
    const total_pemasukan = sum(data.map((d) => d.total_in));
    const total_pengeluaran = sum(data.map((d) => d.total_out));
    const saldo_akhir = total_pemasukan - total_pengeluaran;
    res.json({ data, summary: { total_pemasukan, total_pengeluaran, saldo_akhir } });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil laporan keuangan rekap", error: err.message });
  }
});

// 5) Laporan Vendor - Availability by date
// GET /api/reports/vendors/availability?tanggal=yyyy-mm-dd&kategori_vendor_id=...
router.get("/vendors/availability", async (req, res) => {
  try {
    const { tanggal, tgl_from, tgl_to, kategori_vendor_id, vendor_id } = req.query;
    const from = String(tgl_from || tanggal || "");
    const to = String(tgl_to || tanggal || "");
    if (!from) return res.status(400).json({ pesan: "tanggal atau tgl_from wajib diisi" });

    const vendorQuery = {};
    if (kategori_vendor_id && String(kategori_vendor_id) !== "all") {
      vendorQuery.kategori_vendor_id = String(kategori_vendor_id);
    }
    if (vendor_id && String(vendor_id) !== "all") {
      vendorQuery._id = String(vendor_id);
    }
    const vendors = await TmVendor.find(vendorQuery).sort({ createdAt: -1 });
    const vendorIds = vendors.map((v) => v._id);

    const bookings = vendorIds.length
      ? await TtVendorBooking.find({
          vendor_id: { $in: vendorIds },
          tanggal_acara: { $gte: from, $lte: to || from },
          status: { $in: ["hold", "booked"] },
        }).select("vendor_id status kode_booking jam_mulai jam_selesai createdAt")
      : [];

    const byVendor = new Map();
    for (const b of bookings) {
      const id = String(b.vendor_id);
      const cur = byVendor.get(id) || [];
      cur.push({
        kode_booking: b.kode_booking,
        status: b.status,
        tanggal_acara: b.tanggal_acara,
        jam_mulai: b.jam_mulai,
        jam_selesai: b.jam_selesai,
        createdAt: b.createdAt,
      });
      byVendor.set(id, cur);
    }

    const out = vendors.map((v) => {
      const rows = byVendor.get(String(v._id)) || [];
      const status = rows.some((r) => r.status === "booked") ? "booked" : rows.length ? "hold" : "available";
      return {
        vendor_id: String(v._id),
        nama_vendor: v.nama_vendor,
        kategori_vendor_id: v.kategori_vendor_id ? String(v.kategori_vendor_id) : null,
        kategori_vendor_nama: v.kategori_vendor_nama || null,
        status,
        bookings: rows
          .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")))
          .map((r) => ({
            tanggal_acara: r.tanggal_acara,
            kode_booking: r.kode_booking,
            status: r.status,
            jam_mulai: r.jam_mulai,
            jam_selesai: r.jam_selesai,
          })),
      };
    });

    res.json(out);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil laporan vendor availability", error: err.message });
  }
});

// 7) Laporan Vendor - bookings grouped by vendor
// GET /api/reports/vendors/bookings?tgl_from=...&tgl_to=...&kategori_vendor_id=...&vendor_id=...
router.get("/vendors/bookings", async (req, res) => {
  try {
    const { tgl_from, tgl_to, kategori_vendor_id, vendor_id } = req.query;
    const q = {};
    if (tgl_from || tgl_to) {
      q.tanggal_acara = {};
      if (tgl_from) q.tanggal_acara.$gte = String(tgl_from);
      if (tgl_to) q.tanggal_acara.$lte = String(tgl_to);
    }
    if (vendor_id && String(vendor_id) !== "all") q.vendor_id = String(vendor_id);
    if (kategori_vendor_id && String(kategori_vendor_id) !== "all") q.kategori_vendor_id = String(kategori_vendor_id);
    // exclude cancelled vendor booking from report-by-vendor
    q.status = { $ne: "batal" };

    const rows = await TtVendorBooking.find(q)
      .sort({ vendor_id: 1, tanggal_acara: 1, createdAt: 1 })
      .populate("vendor_id");

    const kodeBookings = Array.from(new Set(rows.map((r) => String(r.kode_booking)).filter(Boolean)));
    const bookingDocs = kodeBookings.length
      ? await TtBooking.find({ kode_booking: { $in: kodeBookings } }).select("kode_booking nama_client")
      : [];
    const bookingMap = new Map(bookingDocs.map((b) => [String(b.kode_booking), b]));

    const grouped = new Map();
    for (const r of rows) {
      const v = r.vendor_id;
      const vid = String(v?._id || r.vendor_id);
      if (!vid) continue;
      const cur = grouped.get(vid) || {
        vendor_id: vid,
        nama_vendor: v?.nama_vendor,
        kategori_vendor_id: v?.kategori_vendor_id ? String(v.kategori_vendor_id) : null,
        kategori_vendor_nama: v?.kategori_vendor_nama || null,
        bookings: [],
      };
      cur.bookings.push({
        tanggal_booking: r.tanggal_acara,
        kode_booking: r.kode_booking,
        nama_client: bookingMap.get(String(r.kode_booking))?.nama_client || null,
        status_vendor_booking: r.status,
        jam_mulai: r.jam_mulai,
        jam_selesai: r.jam_selesai,
      });
      grouped.set(vid, cur);
    }

    const out = Array.from(grouped.values()).map((g) => ({
      ...g,
      bookings: (g.bookings || []).sort((a, b) => String(a.tanggal_booking || "").localeCompare(String(b.tanggal_booking || ""))),
    }));
    res.json(out);
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil laporan vendor booking", error: err.message });
  }
});

// 6) Laporan Vendor - Schedule per vendor
// GET /api/reports/vendors/schedule?vendor_id=...&tgl_from=...&tgl_to=...
router.get("/vendors/schedule", async (req, res) => {
  try {
    const { vendor_id, tgl_from, tgl_to } = req.query;
    if (!vendor_id) return res.status(400).json({ pesan: "vendor_id wajib diisi" });

    const v = await TmVendor.findById(String(vendor_id));
    if (!v) return res.status(404).json({ pesan: "Vendor tidak ditemukan" });

    const q = { vendor_id: String(vendor_id) };
    if (tgl_from || tgl_to) {
      q.tanggal_acara = {};
      if (tgl_from) q.tanggal_acara.$gte = String(tgl_from);
      if (tgl_to) q.tanggal_acara.$lte = String(tgl_to);
    }

    const rows = await TtVendorBooking.find(q).sort({ tanggal_acara: -1, createdAt: -1 }).select("tanggal_acara kode_booking status jam_mulai jam_selesai");
    const kodeBookings = Array.from(new Set(rows.map((r) => String(r.kode_booking)).filter(Boolean)));
    const bookingDocs = kodeBookings.length ? await TtBooking.find({ kode_booking: { $in: kodeBookings } }).select("kode_booking nama_client") : [];
    const bookingMap = new Map(bookingDocs.map((b) => [String(b.kode_booking), b]));

    res.json({
      vendor: {
        vendor_id: String(v._id),
        nama_vendor: v.nama_vendor,
        kategori_vendor_id: v.kategori_vendor_id ? String(v.kategori_vendor_id) : null,
        kategori_vendor_nama: v.kategori_vendor_nama || null,
      },
      schedule: rows.map((r) => ({
        tanggal_booking: r.tanggal_acara,
        kode_booking: r.kode_booking,
        nama_client: bookingMap.get(String(r.kode_booking))?.nama_client || null,
        status_vendor_booking: r.status,
        jam_mulai: r.jam_mulai,
        jam_selesai: r.jam_selesai,
      })),
    });
  } catch (err) {
    res.status(500).json({ pesan: "Gagal mengambil jadwal vendor", error: err.message });
  }
});

export default router;
