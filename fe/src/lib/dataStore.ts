// Reactive in-memory store untuk MVP (frontend-only)
import { useSyncExternalStore, useState, useEffect } from "react";
import {
  bookings as initialBookings,
  checklist as initialChecklist,
  clients as initialClients,
  invoices as initialInvoices,
  packages as initialPackages,
  type Booking,
  type ChecklistItem,
  type Client,
  type Invoice,
  type Package,
  type Vendor,
} from "./mockData";
import {
  ambilVendor, tambahVendor,
  editVendor, hapusVendor,
  ambilKlien, tambahKlien,
  editKlien, hapusKlien,
  ambilPaket, tambahPaket,
  editPaket, hapusPaket,
  ambilBooking, tambahBooking,
  editBooking, hapusBooking,
  ambilInvoice, tambahInvoice,
  ambilChecklist, tambahChecklist
} from "./api";
import { ambilPembayaran, tambahPembayaran, editPembayaran, hapusPembayaran } from "./api";
import {
  ambilAdat,
  tambahAdat,
  editAdat,
  hapusAdat,
  ambilKatalogBaju,
  tambahKatalogBaju,
  editKatalogBaju,
  hapusKatalogBaju,
  ambilKatalogDekorasi,
  tambahKatalogDekorasi,
  editKatalogDekorasi,
  hapusKatalogDekorasi,
  ambilKatalogMakeup,
  tambahKatalogMakeup,
  editKatalogMakeup,
  hapusKatalogMakeup,
} from "./api";
import {
  ambilReferensiClient,
  tambahReferensiClient,
  editReferensiClient,
  hapusReferensiClient,
  ambilWishlistClient,
  tambahWishlistClient,
  editWishlistClient,
  hapusWishlistClient,
} from "./api";
import {
  ambilChecklistBarang,
  tambahChecklistBarang,
  editChecklistBarang,
  hapusChecklistBarang,
  ambilCrewAssignment,
  tambahCrewAssignment,
  editCrewAssignment,
  hapusCrewAssignment,
  ambilTimelineEvent,
  tambahTimelineEvent,
  editTimelineEvent,
  hapusTimelineEvent,
} from "./api";
import { ambilKeuangan, tambahKeuangan, editKeuangan, hapusKeuangan } from "./api";

export type Payment = {
  id: string;
  code: string;
  bookingCode: string;
  clientCode: string;
  clientName: string;
  totalDue: number;
  amountPaid: number;
  remaining: number;
  paymentType?: "DP" | "cicilan" | "pelunasan";
  method: string;
  paidDate: string;
  status: "belum_bayar" | "belum bayar" | "DP" | "cicilan" | "lunas";
  note?: string;
};

export type AdatConcept = {
  id: string;
  nama_adat: string;
  deskripsi?: string;
  warna_tema?: string;
  referensi_dekorasi?: string;
  referensi_baju?: string;
  catatan?: string;
  status: "aktif" | "nonaktif";
};

export type CatalogBaju = {
  id: string;
  nama_baju: string;
  kategori: "akad" | "resepsi" | "prewedding";
  adat_id: string;
  adat_nama?: string;
  model?: string;
  warna?: string;
  ukuran?: string;
  foto?: string;
  status: "tersedia" | "tidak tersedia";
  catatan?: string;
};

export type CatalogDekorasi = {
  id: string;
  nama_dekorasi: string;
  tema?: string;
  adat_id: string;
  adat_nama?: string;
  warna_dominan?: string;
  vendor_id?: string;
  vendor_nama?: string;
  harga: number;
  foto?: string;
  catatan?: string;
  status: "aktif" | "nonaktif";
};

export type CatalogMakeup = {
  id: string;
  nama_style: string;
  kategori: "natural" | "bold" | "glam" | "adat" | "modern";
  vendor_mua_id: string;
  vendor_mua_nama?: string;
  foto?: string;
  harga: number;
  catatan?: string;
  status: "aktif" | "nonaktif";
};

export type ClientReference = {
  id: string;
  kode_booking: string;
  kategori: "baju" | "dekorasi" | "makeup" | "aksesori" | "lainnya";
  upload_gambar?: string;
  judul_referensi?: string;
  catatan_client?: string;
  status: "diajukan" | "disetujui" | "ditolak" | "revisi";
  catatan_staff?: string;
};

export type ClientWishlist = {
  id: string;
  kode_booking: string;
  kategori: "baju" | "dekorasi" | "makeup" | "aksesori" | "rundown" | "makanan" | "lainnya";
  permintaan: string;
  prioritas: "rendah" | "sedang" | "tinggi";
  pic?: string;
  status: "baru" | "proses" | "selesai" | "tidak bisa";
  catatan_wo?: string;
};

export type ChecklistBarang = {
  id: string;
  kode_booking: string;
  nama_barang: string;
  kategori_barang: "baju" | "aksesori" | "dekorasi" | "dokumen" | "lainnya";
  jumlah: number;
  untuk_siapa?: string;
  pic?: string;
  status: "belum_siap" | "siap" | "dibawa" | "dikembalikan";
  foto_barang?: string;
  catatan?: string;
};

export type CrewAssignment = {
  id: string;
  kode_booking: string;
  nama_crew: string;
  role: "leader" | "runner" | "wardrobe" | "makeup_assistant" | "dokumentasi" | "konsumsi" | "transport" | "lainnya";
  tanggal_tugas: string;
  jam_mulai?: string;
  jam_selesai?: string;
  lokasi_tugas?: string;
  catatan_tugas?: string;
  status_hadir: "belum_hadir" | "hadir" | "izin" | "tidak_hadir";
};

export type TimelineEventTask = {
  id: string;
  kode_booking: string;
  nama_tugas: string;
  kategori_tugas?: string;
  deadline: string;
  pic?: string;
  status: "belum_dikerjakan" | "proses" | "selesai" | "terlambat";
  catatan?: string;
};

export type KeuanganTrx = {
  id: string;
  no_trx: string;
  tgl_trx: string;
  kategori: "DP" | "cicilan" | "pelunasan" | "vendor" | "operasional" | "lainnya";
  keterangan?: string;
  jumlah_in: number;
  jumlah_out: number;
  ref_type?: string;
  ref_id?: string;
};

type State = {
  clients: Client[];
  vendors: Vendor[];
  packages: Package[];
  bookings: Booking[];
  checklist: ChecklistItem[];
  invoices: Invoice[];
  payments: Payment[];
  adat: AdatConcept[];
  katalogBaju: CatalogBaju[];
  katalogDekorasi: CatalogDekorasi[];
  katalogMakeup: CatalogMakeup[];
  referensiClient: ClientReference[];
  wishlistClient: ClientWishlist[];
  checklistBarang: ChecklistBarang[];
  crewAssignments: CrewAssignment[];
  timelineEvent: TimelineEventTask[];
  keuangan: KeuanganTrx[];
};

let state: State = {
  clients: [],
  vendors: [],
  packages: [],
  bookings: [],
  checklist: [],
  invoices: [],
  payments: [],
  adat: [],
  katalogBaju: [],
  katalogDekorasi: [],
  katalogMakeup: [],
  referensiClient: [],
  wishlistClient: [],
  checklistBarang: [],
  crewAssignments: [],
  timelineEvent: [],
  keuangan: [],
};

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((l) => l());
const setState = (updater: (s: State) => State) => {
  state = updater(state);
  emit();
};

const onlyDefined = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v !== "undefined"));

export const store = {
  addClient: async (c: Omit<Client, "id">) => {
    const client = await tambahKlien({
      nama_klien: c.name,
      pasangan: c.partner,
      email: c.email,
      telepon: c.phone,
      tanggal_pernikahan: c.weddingDate,
      id_paket: c.packageId,
      status: c.status,
      anggaran: c.budget,
    });
    setState((s) => ({ ...s, clients: [
      {
        id: client._id,
        code: client.kode_client,
        name: client.nama_klien,
        partner: client.pasangan,
        email: client.email,
        phone: client.telepon,
        weddingDate: client.tanggal_pernikahan,
        packageId: client.id_paket,
        status: client.status,
        budget: client.anggaran,
      },
      ...s.clients,
    ] }));
  },
  updateClient: async (id: string, c: Partial<Omit<Client, "id">>) => {
    const updated = await editKlien(
      id,
      onlyDefined({
        nama_klien: c.name,
        pasangan: c.partner,
        email: c.email,
        telepon: c.phone,
        tanggal_pernikahan: c.weddingDate,
        id_paket: c.packageId,
        status: c.status,
        anggaran: c.budget,
      })
    );
    setState((s) => ({
      ...s,
      clients: s.clients.map((x) =>
        x.id === id
          ? {
              id: updated._id,
              code: updated.kode_client,
              name: updated.nama_klien,
              partner: updated.pasangan,
              email: updated.email,
              phone: updated.telepon,
              weddingDate: updated.tanggal_pernikahan,
              packageId: updated.id_paket,
              status: updated.status,
              budget: updated.anggaran,
            }
          : x
      ),
    }));
  },
  deleteClient: async (id: string) => {
    await hapusKlien(id);
    setState((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) }));
  },
  addVendor: async (v: any) => {
    const vendor = await tambahVendor({
      nama_vendor: v.name,
      kategori_vendor_id: v.categoryId,
      // kontak: v.contact,
      rating: v.rating,
      rentang_harga: v.priceRange,
      tanggal_bergabung: new Date().toISOString().slice(0, 10),
      alamat: v.alamat,
      telepon: v.telepon,
    });
    setState((s) => ({ ...s, vendors: [
      {
        id: vendor._id,
        name: vendor.nama_vendor,
        category: vendor.kategori_vendor_nama || vendor.kategori_vendor_id?.nama_kategori || "-",
        categoryId: vendor.kategori_vendor_id?._id || vendor.kategori_vendor_id,
        // contact: vendor.kontak,
        rating: vendor.rating,
        priceRange: vendor.rentang_harga,
        alamat: vendor.alamat,
        telepon: vendor.telepon,
      },
      ...s.vendors,
    ] }));
  },
  updateVendor: async (id: string, v: any) => {
    const vendor = await editVendor(id, {
      nama_vendor: v.name,
      kategori_vendor_id: v.categoryId,
      // kontak: v.contact,
      rating: v.rating,
      rentang_harga: v.priceRange,
      alamat: v.alamat,
      telepon: v.telepon,
      email: v.email,
      status: v.status,
    });
    setState((s) => ({
      ...s,
      vendors: s.vendors.map((x) =>
        x.id === id
          ? {
              id: vendor._id,
              name: vendor.nama_vendor,
              category: vendor.kategori_vendor_nama || vendor.kategori_vendor_id?.nama_kategori || "-",
              categoryId: vendor.kategori_vendor_id?._id || vendor.kategori_vendor_id,
              // contact: vendor.kontak,
              rating: vendor.rating,
              priceRange: vendor.rentang_harga,
              alamat: vendor.alamat,
              telepon: vendor.telepon,
            }
          : x
      ),
    }));
  },
  deleteVendor: async (id: string) => {
    await hapusVendor(id);
    setState((s) => ({ ...s, vendors: s.vendors.filter((v) => v.id !== id) }));
  },
  addPackage: async (p: Omit<Package, "id">) => {
    const paket = await tambahPaket({
      nama_paket: p.name,
      tagline: p.tagline,
      harga: p.price,
      fitur: p.features,
      vendor_ids: p.vendorIds || [],
      populer: p.popular || false,
    });
    setState((s) => ({ ...s, packages: [
      {
        id: paket._id,
        name: paket.nama_paket,
        tagline: paket.tagline,
        price: paket.harga,
        features: paket.fitur,
        vendorIds: paket.vendor_ids || [],
        popular: paket.populer,
      },
      ...s.packages,
    ] }));
  },
  updatePackage: async (id: string, p: Partial<Omit<Package, "id">>) => {
    const paket = await editPaket(
      id,
      onlyDefined({
        nama_paket: p.name,
        tagline: p.tagline,
        harga: p.price,
        fitur: p.features,
        vendor_ids: p.vendorIds,
        populer: p.popular,
      })
    );
    setState((s) => ({
      ...s,
      packages: s.packages.map((x) =>
        x.id === id
          ? {
              id: paket._id,
              name: paket.nama_paket,
              tagline: paket.tagline,
              price: paket.harga,
              features: paket.fitur,
              vendorIds: paket.vendor_ids || [],
              popular: paket.populer,
            }
          : x
      ),
    }));
  },
  deletePackage: async (id: string) => {
    await hapusPaket(id);
    setState((s) => ({ ...s, packages: s.packages.filter((p) => p.id !== id) }));
  },
  addBooking: async (b: Omit<Booking, "id">) => {
    const booking = await tambahBooking({
      id_klien: b.clientId,
      id_paket: b.packageId,
      tanggal_acara: b.eventDate,
      lokasi: b.venue,
      tamu: b.guests,
      status: b.status,
      vendor_dipilih_ids: b.vendorSelectedIds || [],
    });
    setState((s) => ({ ...s, bookings: [
      {
        id: booking._id,
        code: booking.kode_booking,
        clientCode: booking.kode_client,
        clientName: booking.nama_client,
        clientId: booking.id_klien,
        packageId: booking.id_paket,
        eventDate: booking.tanggal_acara,
        venue: booking.lokasi,
        guests: booking.tamu,
        adatId: booking.adat_id,
        pic: booking.pic,
        eventStatus: booking.status_event,
        note: booking.catatan,
        vendorSelectedIds: booking.vendor_dipilih_ids || [],
        packageSnapshot: booking.paket_snapshot
          ? {
              name: booking.paket_snapshot.nama_paket,
              tagline: booking.paket_snapshot.tagline,
              price: booking.paket_snapshot.harga,
              features: booking.paket_snapshot.fitur,
              vendorIds: booking.paket_snapshot.vendor_ids,
            }
          : undefined,
        status: booking.status,
      },
      ...s.bookings,
    ] }));
  },
  updateBooking: async (id: string, b: Partial<Omit<Booking, "id">>) => {
    const booking = await editBooking(
      id,
      onlyDefined({
        status: b.status,
        lokasi: b.venue,
        tamu: b.guests,
      })
    );
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((x) =>
        x.id === id
          ? {
              id: booking._id,
              code: booking.kode_booking,
              clientCode: booking.kode_client,
              clientName: booking.nama_client,
              clientId: booking.id_klien,
              packageId: booking.id_paket,
              eventDate: booking.tanggal_acara,
              venue: booking.lokasi,
              guests: booking.tamu,
              adatId: booking.adat_id,
              pic: booking.pic,
              eventStatus: booking.status_event,
              note: booking.catatan,
              vendorSelectedIds: booking.vendor_dipilih_ids || [],
              packageSnapshot: booking.paket_snapshot
                ? {
                    name: booking.paket_snapshot.nama_paket,
                    tagline: booking.paket_snapshot.tagline,
                    price: booking.paket_snapshot.harga,
                    features: booking.paket_snapshot.fitur,
                    vendorIds: booking.paket_snapshot.vendor_ids,
                  }
                : undefined,
              status: booking.status,
            }
          : x
      ),
    }));
  },
  deleteBooking: async (id: string) => {
    await hapusBooking(id);
    setState((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== id) }));
  },

  // Tahap 5: Booking/Event (admin)
  addEventBooking: async (payload: {
    clientId: string;
    packageId: string;
    adatId?: string;
    eventDate: string;
    venue: string;
    pic?: string;
    eventStatus?: "draft" | "aktif" | "selesai" | "batal";
    note?: string;
    vendorSelectedIds: string[];
  }) => {
    const booking = await tambahBooking({
      client_id: payload.clientId,
      paket_id: payload.packageId,
      adat_id: payload.adatId,
      tanggal_acara: payload.eventDate,
      lokasi_acara: payload.venue,
      pic: payload.pic,
      status_event: payload.eventStatus || "draft",
      catatan: payload.note,
      vendor_dipilih_ids: payload.vendorSelectedIds || [],
    });

    setState((s) => ({
      ...s,
      bookings: [
        {
          id: booking._id,
          code: booking.kode_booking,
          clientCode: booking.kode_client,
          clientName: booking.nama_client,
          clientId: booking.id_klien,
          packageId: booking.id_paket,
          eventDate: booking.tanggal_acara,
          venue: booking.lokasi,
          guests: booking.tamu || 0,
          adatId: booking.adat_id?._id || booking.adat_id,
          pic: booking.pic,
          eventStatus: booking.status_event,
          note: booking.catatan,
          vendorSelectedIds: booking.vendor_dipilih_ids || [],
          packageSnapshot: booking.paket_snapshot
            ? {
                name: booking.paket_snapshot.nama_paket,
                tagline: booking.paket_snapshot.tagline,
                price: booking.paket_snapshot.harga,
                features: booking.paket_snapshot.fitur,
                vendorIds: booking.paket_snapshot.vendor_ids,
              }
            : undefined,
          status: booking.status,
        },
        ...s.bookings,
      ],
    }));
  },

  updateEventBooking: async (
    id: string,
    payload: Partial<{
      clientId: string;
      packageId: string;
      adatId?: string;
      eventDate: string;
      venue: string;
      pic?: string;
      eventStatus?: "draft" | "aktif" | "selesai" | "batal";
      note?: string;
      vendorSelectedIds: string[];
    }>
  ) => {
    const booking = await editBooking(
      id,
      onlyDefined({
        client_id: payload.clientId,
        paket_id: payload.packageId,
        adat_id: payload.adatId,
        tanggal_acara: payload.eventDate,
        lokasi_acara: payload.venue,
        pic: payload.pic,
        status_event: payload.eventStatus,
        catatan: payload.note,
        vendor_dipilih_ids: payload.vendorSelectedIds,
      })
    );

    setState((s) => ({
      ...s,
      bookings: s.bookings.map((x) =>
        x.id === id
          ? {
              id: booking._id,
              code: booking.kode_booking,
              clientCode: booking.kode_client,
              clientName: booking.nama_client,
              clientId: booking.id_klien,
              packageId: booking.id_paket,
              eventDate: booking.tanggal_acara,
              venue: booking.lokasi,
              guests: booking.tamu || 0,
              adatId: booking.adat_id?._id || booking.adat_id,
              pic: booking.pic,
              eventStatus: booking.status_event,
              note: booking.catatan,
              vendorSelectedIds: booking.vendor_dipilih_ids || [],
              packageSnapshot: booking.paket_snapshot
                ? {
                    name: booking.paket_snapshot.nama_paket,
                    tagline: booking.paket_snapshot.tagline,
                    price: booking.paket_snapshot.harga,
                    features: booking.paket_snapshot.fitur,
                    vendorIds: booking.paket_snapshot.vendor_ids,
                  }
                : undefined,
              status: booking.status,
            }
          : x
      ),
    }));
  },

  deleteEventBooking: async (id: string) => {
    await hapusBooking(id);
    setState((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== id) }));
  },
  addPayment: async (p: { kode_booking: string; nominal_bayar: number; metode_pembayaran: string; tanggal_pembayaran?: string; jenis_pembayaran?: string; catatan?: string }) => {
    const pay = await tambahPembayaran(p);
    setState((s) => ({
      ...s,
      payments: [
        {
          id: pay._id,
          code: pay.kode_pembayaran,
          bookingCode: pay.kode_booking,
          clientCode: pay.kode_client,
          clientName: pay.nama_client,
          totalDue: pay.total_tagihan,
          amountPaid: pay.nominal_bayar,
          remaining: pay.sisa_tagihan,
          paymentType: pay.jenis_pembayaran,
          method: pay.metode_pembayaran,
          paidDate: pay.tanggal_pembayaran,
          status: pay.status_pembayaran,
          note: pay.catatan,
        },
        ...s.payments,
      ],
    }));
  },

  updatePayment: async (id: string, p: Partial<{ nominal_bayar: number; metode_pembayaran: string; tanggal_pembayaran: string; catatan: string }>) => {
    const pay = await editPembayaran(id, p);
    setState((s) => ({
      ...s,
      payments: s.payments.map((x) =>
        x.id === id
          ? {
              id: pay._id,
              code: pay.kode_pembayaran,
              bookingCode: pay.kode_booking,
              clientCode: pay.kode_client,
              clientName: pay.nama_client,
              totalDue: pay.total_tagihan,
              amountPaid: pay.nominal_bayar,
              remaining: pay.sisa_tagihan,
              paymentType: pay.jenis_pembayaran,
              method: pay.metode_pembayaran,
              paidDate: pay.tanggal_pembayaran,
              status: pay.status_pembayaran,
              note: pay.catatan,
            }
          : x
      ),
    }));
  },

  deletePayment: async (id: string) => {
    await hapusPembayaran(id);
    setState((s) => ({ ...s, payments: s.payments.filter((p) => p.id !== id) }));
  },

  // Tahap 2: Master Katalog Client
  addAdat: async (payload: Omit<AdatConcept, "id">) => {
    const adat = await tambahAdat(payload);
    setState((s) => ({
      ...s,
      adat: [{ id: adat._id, ...adat }, ...s.adat],
    }));
  },
  updateAdat: async (id: string, payload: Partial<Omit<AdatConcept, "id">>) => {
    const adat = await editAdat(id, payload);
    setState((s) => ({
      ...s,
      adat: s.adat.map((a) => (a.id === id ? { id: adat._id, ...adat } : a)),
    }));
  },
  deleteAdat: async (id: string) => {
    await hapusAdat(id);
    setState((s) => ({ ...s, adat: s.adat.filter((a) => a.id !== id) }));
  },

  addKatalogBaju: async (payload: Omit<CatalogBaju, "id" | "adat_nama">) => {
    const baju = await tambahKatalogBaju(payload);
    setState((s) => ({
      ...s,
      katalogBaju: [
        {
          id: baju._id,
          nama_baju: baju.nama_baju,
          kategori: baju.kategori,
          adat_id: baju.adat_id?._id || baju.adat_id,
          adat_nama: baju.adat_id?.nama_adat,
          model: baju.model,
          warna: baju.warna,
          ukuran: baju.ukuran,
          foto: baju.foto,
          status: baju.status,
          catatan: baju.catatan,
        },
        ...s.katalogBaju,
      ],
    }));
  },
  updateKatalogBaju: async (id: string, payload: Partial<Omit<CatalogBaju, "id" | "adat_nama">>) => {
    const baju = await editKatalogBaju(id, payload);
    setState((s) => ({
      ...s,
      katalogBaju: s.katalogBaju.map((x) =>
        x.id === id
          ? {
              id: baju._id,
              nama_baju: baju.nama_baju,
              kategori: baju.kategori,
              adat_id: baju.adat_id?._id || baju.adat_id,
              adat_nama: baju.adat_id?.nama_adat,
              model: baju.model,
              warna: baju.warna,
              ukuran: baju.ukuran,
              foto: baju.foto,
              status: baju.status,
              catatan: baju.catatan,
            }
          : x
      ),
    }));
  },
  deleteKatalogBaju: async (id: string) => {
    await hapusKatalogBaju(id);
    setState((s) => ({ ...s, katalogBaju: s.katalogBaju.filter((x) => x.id !== id) }));
  },

  addKatalogDekorasi: async (payload: Omit<CatalogDekorasi, "id" | "adat_nama" | "vendor_nama">) => {
    const deco = await tambahKatalogDekorasi(payload);
    setState((s) => ({
      ...s,
      katalogDekorasi: [
        {
          id: deco._id,
          nama_dekorasi: deco.nama_dekorasi,
          tema: deco.tema,
          adat_id: deco.adat_id?._id || deco.adat_id,
          adat_nama: deco.adat_id?.nama_adat,
          warna_dominan: deco.warna_dominan,
          vendor_id: deco.vendor_id?._id || deco.vendor_id,
          vendor_nama: deco.vendor_id?.nama_vendor,
          harga: deco.harga || 0,
          foto: deco.foto,
          catatan: deco.catatan,
          status: deco.status,
        },
        ...s.katalogDekorasi,
      ],
    }));
  },
  updateKatalogDekorasi: async (id: string, payload: Partial<Omit<CatalogDekorasi, "id" | "adat_nama" | "vendor_nama">>) => {
    const deco = await editKatalogDekorasi(id, payload);
    setState((s) => ({
      ...s,
      katalogDekorasi: s.katalogDekorasi.map((x) =>
        x.id === id
          ? {
              id: deco._id,
              nama_dekorasi: deco.nama_dekorasi,
              tema: deco.tema,
              adat_id: deco.adat_id?._id || deco.adat_id,
              adat_nama: deco.adat_id?.nama_adat,
              warna_dominan: deco.warna_dominan,
              vendor_id: deco.vendor_id?._id || deco.vendor_id,
              vendor_nama: deco.vendor_id?.nama_vendor,
              harga: deco.harga || 0,
              foto: deco.foto,
              catatan: deco.catatan,
              status: deco.status,
            }
          : x
      ),
    }));
  },
  deleteKatalogDekorasi: async (id: string) => {
    await hapusKatalogDekorasi(id);
    setState((s) => ({ ...s, katalogDekorasi: s.katalogDekorasi.filter((x) => x.id !== id) }));
  },

  addKatalogMakeup: async (payload: Omit<CatalogMakeup, "id" | "vendor_mua_nama">) => {
    const mk = await tambahKatalogMakeup(payload);
    setState((s) => ({
      ...s,
      katalogMakeup: [
        {
          id: mk._id,
          nama_style: mk.nama_style,
          kategori: mk.kategori,
          vendor_mua_id: mk.vendor_mua_id?._id || mk.vendor_mua_id,
          vendor_mua_nama: mk.vendor_mua_id?.nama_vendor,
          foto: mk.foto,
          harga: mk.harga || 0,
          catatan: mk.catatan,
          status: mk.status,
        },
        ...s.katalogMakeup,
      ],
    }));
  },
  updateKatalogMakeup: async (id: string, payload: Partial<Omit<CatalogMakeup, "id" | "vendor_mua_nama">>) => {
    const mk = await editKatalogMakeup(id, payload);
    setState((s) => ({
      ...s,
      katalogMakeup: s.katalogMakeup.map((x) =>
        x.id === id
          ? {
              id: mk._id,
              nama_style: mk.nama_style,
              kategori: mk.kategori,
              vendor_mua_id: mk.vendor_mua_id?._id || mk.vendor_mua_id,
              vendor_mua_nama: mk.vendor_mua_id?.nama_vendor,
              foto: mk.foto,
              harga: mk.harga || 0,
              catatan: mk.catatan,
              status: mk.status,
            }
          : x
      ),
    }));
  },
  deleteKatalogMakeup: async (id: string) => {
    await hapusKatalogMakeup(id);
    setState((s) => ({ ...s, katalogMakeup: s.katalogMakeup.filter((x) => x.id !== id) }));
  },

  // Tahap 7: Referensi & Wishlist client
  addReferensiClient: async (payload: Omit<ClientReference, "id" | "status"> & { status?: ClientReference["status"] }) => {
    const ref = await tambahReferensiClient({
      kode_booking: payload.kode_booking,
      kategori: payload.kategori,
      upload_gambar: payload.upload_gambar,
      judul_referensi: payload.judul_referensi,
      catatan_client: payload.catatan_client,
      status: payload.status,
      catatan_staff: payload.catatan_staff,
    });
    setState((s) => ({
      ...s,
      referensiClient: [{ id: ref._id, ...ref }, ...s.referensiClient],
    }));
  },
  updateReferensiClient: async (id: string, payload: Partial<Omit<ClientReference, "id">>) => {
    const ref = await editReferensiClient(id, payload);
    setState((s) => ({
      ...s,
      referensiClient: s.referensiClient.map((x) => (x.id === id ? { id: ref._id, ...ref } : x)),
    }));
  },
  deleteReferensiClient: async (id: string) => {
    await hapusReferensiClient(id);
    setState((s) => ({ ...s, referensiClient: s.referensiClient.filter((x) => x.id !== id) }));
  },

  addWishlistClient: async (payload: Omit<ClientWishlist, "id" | "status"> & { status?: ClientWishlist["status"] }) => {
    const wl = await tambahWishlistClient({
      kode_booking: payload.kode_booking,
      kategori: payload.kategori,
      permintaan: payload.permintaan,
      prioritas: payload.prioritas,
      pic: payload.pic,
      status: payload.status,
      catatan_wo: payload.catatan_wo,
    });
    setState((s) => ({
      ...s,
      wishlistClient: [{ id: wl._id, ...wl }, ...s.wishlistClient],
    }));
  },
  updateWishlistClient: async (id: string, payload: Partial<Omit<ClientWishlist, "id">>) => {
    const wl = await editWishlistClient(id, payload);
    setState((s) => ({
      ...s,
      wishlistClient: s.wishlistClient.map((x) => (x.id === id ? { id: wl._id, ...wl } : x)),
    }));
  },
  deleteWishlistClient: async (id: string) => {
    await hapusWishlistClient(id);
    setState((s) => ({ ...s, wishlistClient: s.wishlistClient.filter((x) => x.id !== id) }));
  },

  // Tahap 8: Checklist Barang
  addChecklistBarang: async (payload: Omit<ChecklistBarang, "id">) => {
    const row = await tambahChecklistBarang(payload);
    setState((s) => ({ ...s, checklistBarang: [{ id: row._id, ...row }, ...s.checklistBarang] }));
  },
  updateChecklistBarang: async (id: string, payload: Partial<Omit<ChecklistBarang, "id">>) => {
    const row = await editChecklistBarang(id, payload);
    setState((s) => ({
      ...s,
      checklistBarang: s.checklistBarang.map((x) => (x.id === id ? { id: row._id, ...row } : x)),
    }));
  },
  deleteChecklistBarang: async (id: string) => {
    await hapusChecklistBarang(id);
    setState((s) => ({ ...s, checklistBarang: s.checklistBarang.filter((x) => x.id !== id) }));
  },

  // Tahap 9: Crew Assignment
  addCrewAssignment: async (payload: Omit<CrewAssignment, "id">) => {
    const row = await tambahCrewAssignment(payload);
    setState((s) => ({ ...s, crewAssignments: [{ id: row._id, ...row }, ...s.crewAssignments] }));
  },
  updateCrewAssignment: async (id: string, payload: Partial<Omit<CrewAssignment, "id">>) => {
    const row = await editCrewAssignment(id, payload);
    setState((s) => ({
      ...s,
      crewAssignments: s.crewAssignments.map((x) => (x.id === id ? { id: row._id, ...row } : x)),
    }));
  },
  deleteCrewAssignment: async (id: string) => {
    await hapusCrewAssignment(id);
    setState((s) => ({ ...s, crewAssignments: s.crewAssignments.filter((x) => x.id !== id) }));
  },

  // Tahap 10: Timeline Event
  addTimelineEventTask: async (payload: Omit<TimelineEventTask, "id">) => {
    const row = await tambahTimelineEvent(payload);
    setState((s) => ({ ...s, timelineEvent: [{ id: row._id, ...row }, ...s.timelineEvent] }));
  },
  updateTimelineEventTask: async (id: string, payload: Partial<Omit<TimelineEventTask, "id">>) => {
    const row = await editTimelineEvent(id, payload);
    setState((s) => ({
      ...s,
      timelineEvent: s.timelineEvent.map((x) => (x.id === id ? { id: row._id, ...row } : x)),
    }));
  },
  deleteTimelineEventTask: async (id: string) => {
    await hapusTimelineEvent(id);
    setState((s) => ({ ...s, timelineEvent: s.timelineEvent.filter((x) => x.id !== id) }));
  },

  // Tahap 12: Keuangan
  addKeuangan: async (payload: Omit<KeuanganTrx, "id" | "no_trx"> & { no_trx?: string }) => {
    const row = await tambahKeuangan(payload);
    setState((s) => ({ ...s, keuangan: [{ id: row._id, ...row }, ...s.keuangan] }));
  },
  updateKeuangan: async (id: string, payload: Partial<Omit<KeuanganTrx, "id" | "no_trx">>) => {
    const row = await editKeuangan(id, payload);
    setState((s) => ({
      ...s,
      keuangan: s.keuangan.map((x) => (x.id === id ? { id: row._id, ...row } : x)),
    }));
  },
  deleteKeuangan: async (id: string) => {
    await hapusKeuangan(id);
    setState((s) => ({ ...s, keuangan: s.keuangan.filter((x) => x.id !== id) }));
  },
};

export const useClients = () => {
  const [initialized, setInitialized] = useState(false);
  const clients = useSyncExternalStore(subscribe, () => state.clients, () => state.clients);
  useEffect(() => {
    if (!initialized) {
      ambilKlien().then((data) => {
        setState((s) => ({
          ...s,
          clients: data.map((c: any) => ({
            id: c._id,
            code: c.kode_client,
            name: c.nama_klien,
            partner: c.pasangan,
            email: c.email,
            phone: c.telepon,
            weddingDate: c.tanggal_pernikahan,
            packageId: c.id_paket,
            status: c.status,
            budget: c.anggaran,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return clients;
};
export const useVendors = () => {
  const [initialized, setInitialized] = useState(false);
  const vendors = useSyncExternalStore(subscribe, () => state.vendors, () => state.vendors);
  useEffect(() => {
    if (!initialized) {
      ambilVendor().then((data) => {
        setState((s) => ({
          ...s,
          vendors: data.map((v: any) => ({
            id: v._id,
            name: v.nama_vendor,
            category: v.kategori_vendor_nama || v.kategori_vendor_id?.nama_kategori || "-",
            categoryId: v.kategori_vendor_id?._id || v.kategori_vendor_id,
            contact: v.kontak,
            rating: v.rating || 0,
            priceRange: v.rentang_harga || "-",
            alamat: v.alamat,
            telepon: v.telepon,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return vendors;
};
export const usePackages = () => {
  const [initialized, setInitialized] = useState(false);
  const packages = useSyncExternalStore(subscribe, () => state.packages, () => state.packages);
  useEffect(() => {
    if (!initialized) {
      ambilPaket().then((data) => {
        setState((s) => ({
          ...s,
          packages: data.map((p: any) => ({
            id: p._id,
            name: p.nama_paket,
            tagline: p.tagline,
            price: p.harga,
            features: p.fitur,
            vendorIds: p.vendor_ids || [],
            popular: p.populer,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return packages;
};
export const useBookings = () => {
  const [initialized, setInitialized] = useState(false);
  const bookings = useSyncExternalStore(subscribe, () => state.bookings, () => state.bookings);
  useEffect(() => {
    if (!initialized) {
      ambilBooking().then((data) => {
        setState((s) => ({
          ...s,
          bookings: data.map((b: any) => ({
            id: b._id,
            code: b.kode_booking,
            clientCode: b.kode_client,
            clientName: b.nama_client,
            clientId: b.id_klien,
            packageId: b.id_paket,
            eventDate: b.tanggal_acara,
            venue: b.lokasi,
            guests: b.tamu,
            adatId: b.adat_id?._id || b.adat_id,
            pic: b.pic,
            eventStatus: b.status_event,
            note: b.catatan,
            vendorSelectedIds: b.vendor_dipilih_ids || [],
            packageSnapshot: b.paket_snapshot
              ? {
                  name: b.paket_snapshot.nama_paket,
                  tagline: b.paket_snapshot.tagline,
                  price: b.paket_snapshot.harga,
                  features: b.paket_snapshot.fitur,
                  vendorIds: b.paket_snapshot.vendor_ids,
                }
              : undefined,
            status: b.status,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return bookings;
};

export const usePayments = () => {
  const [initialized, setInitialized] = useState(false);
  const payments = useSyncExternalStore(subscribe, () => state.payments, () => state.payments);
  useEffect(() => {
    if (!initialized) {
      ambilPembayaran().then((data) => {
        setState((s) => ({
          ...s,
          payments: data.map((pay: any) => ({
            id: pay._id,
            code: pay.kode_pembayaran,
            bookingCode: pay.kode_booking,
            clientCode: pay.kode_client,
            clientName: pay.nama_client,
            totalDue: pay.total_tagihan,
            amountPaid: pay.nominal_bayar,
            remaining: pay.sisa_tagihan,
            paymentType: pay.jenis_pembayaran,
            method: pay.metode_pembayaran,
            paidDate: pay.tanggal_pembayaran,
            status: pay.status_pembayaran,
            note: pay.catatan,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return payments;
};
export const useInvoices = () => {
  const [initialized, setInitialized] = useState(false);
  const invoices = useSyncExternalStore(subscribe, () => state.invoices, () => state.invoices);
  useEffect(() => {
    if (!initialized) {
      ambilInvoice().then((data) => {
        setState((s) => ({
          ...s,
          invoices: data.map((i: any) => ({
            id: i._id,
            bookingId: i.id_booking,
            clientId: i.id_klien,
            amount: i.jumlah,
            paid: i.dibayar,
            dueDate: i.jatuh_tempo,
            status: i.status,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return invoices;
};
export const useChecklist = () => {
  const [initialized, setInitialized] = useState(false);
  const checklist = useSyncExternalStore(subscribe, () => state.checklist, () => state.checklist);
  useEffect(() => {
    if (!initialized) {
      ambilChecklist().then((data) => {
        setState((s) => ({
          ...s,
          checklist: data.map((c: any) => ({
            id: c._id,
            bookingId: c.id_booking || c.id_booking,
            title: c.judul,
            dueDate: c.tenggat,
            done: c.selesai,
            category: c.kategori,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return checklist;
};

// Tahap 7 hooks
export const useReferensiClient = () => {
  const [initialized, setInitialized] = useState(false);
  const data = useSyncExternalStore(subscribe, () => state.referensiClient, () => state.referensiClient);
  useEffect(() => {
    if (!initialized) {
      ambilReferensiClient()
        .then((rows) => {
          setState((s) => ({
            ...s,
            referensiClient: (rows || []).map((r: any) => ({ id: r._id, ...r })),
          }));
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [initialized]);
  return data;
};

export const useWishlistClient = () => {
  const [initialized, setInitialized] = useState(false);
  const data = useSyncExternalStore(subscribe, () => state.wishlistClient, () => state.wishlistClient);
  useEffect(() => {
    if (!initialized) {
      ambilWishlistClient()
        .then((rows) => {
          setState((s) => ({
            ...s,
            wishlistClient: (rows || []).map((r: any) => ({ id: r._id, ...r })),
          }));
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [initialized]);
  return data;
};

// Tahap 8 hooks
export const useChecklistBarang = () => {
  const [initialized, setInitialized] = useState(false);
  const data = useSyncExternalStore(subscribe, () => state.checklistBarang, () => state.checklistBarang);
  useEffect(() => {
    if (!initialized) {
      ambilChecklistBarang()
        .then((rows) => {
          setState((s) => ({
            ...s,
            checklistBarang: (rows || []).map((r: any) => ({ id: r._id, ...r })),
          }));
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [initialized]);
  return data;
};

// Tahap 9 hooks
export const useCrewAssignments = () => {
  const [initialized, setInitialized] = useState(false);
  const data = useSyncExternalStore(subscribe, () => state.crewAssignments, () => state.crewAssignments);
  useEffect(() => {
    if (!initialized) {
      ambilCrewAssignment()
        .then((rows) => {
          setState((s) => ({
            ...s,
            crewAssignments: (rows || []).map((r: any) => ({ id: r._id, ...r })),
          }));
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [initialized]);
  return data;
};

// Tahap 10 hooks
export const useTimelineEvent = () => {
  const [initialized, setInitialized] = useState(false);
  const data = useSyncExternalStore(subscribe, () => state.timelineEvent, () => state.timelineEvent);
  useEffect(() => {
    if (!initialized) {
      ambilTimelineEvent()
        .then((rows) => {
          setState((s) => ({
            ...s,
            timelineEvent: (rows || []).map((r: any) => ({ id: r._id, ...r })),
          }));
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [initialized]);
  return data;
};

export const useKeuangan = () => {
  const [initialized, setInitialized] = useState(false);
  const data = useSyncExternalStore(subscribe, () => state.keuangan, () => state.keuangan);
  useEffect(() => {
    if (!initialized) {
      ambilKeuangan()
        .then((rows) => {
          setState((s) => ({
            ...s,
            keuangan: (rows || []).map((r: any) => ({ id: r._id, ...r })),
          }));
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    }
  }, [initialized]);
  return data;
};

// Tahap 2 hooks
export const useAdat = () => {
  const [initialized, setInitialized] = useState(false);
  const adat = useSyncExternalStore(subscribe, () => state.adat, () => state.adat);
  useEffect(() => {
    if (!initialized) {
      ambilAdat().then((data) => {
        setState((s) => ({
          ...s,
          adat: data.map((a: any) => ({
            id: a._id,
            nama_adat: a.nama_adat,
            deskripsi: a.deskripsi,
            warna_tema: a.warna_tema,
            referensi_dekorasi: a.referensi_dekorasi,
            referensi_baju: a.referensi_baju,
            catatan: a.catatan,
            status: a.status,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return adat;
};

export const useKatalogBaju = () => {
  const [initialized, setInitialized] = useState(false);
  const list = useSyncExternalStore(subscribe, () => state.katalogBaju, () => state.katalogBaju);
  useEffect(() => {
    if (!initialized) {
      ambilKatalogBaju().then((data) => {
        setState((s) => ({
          ...s,
          katalogBaju: data.map((b: any) => ({
            id: b._id,
            nama_baju: b.nama_baju,
            kategori: b.kategori,
            adat_id: b.adat_id?._id || b.adat_id,
            adat_nama: b.adat_id?.nama_adat,
            model: b.model,
            warna: b.warna,
            ukuran: b.ukuran,
            foto: b.foto,
            status: b.status,
            catatan: b.catatan,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return list;
};

export const useKatalogDekorasi = () => {
  const [initialized, setInitialized] = useState(false);
  const list = useSyncExternalStore(subscribe, () => state.katalogDekorasi, () => state.katalogDekorasi);
  useEffect(() => {
    if (!initialized) {
      ambilKatalogDekorasi().then((data) => {
        setState((s) => ({
          ...s,
          katalogDekorasi: data.map((d: any) => ({
            id: d._id,
            nama_dekorasi: d.nama_dekorasi,
            tema: d.tema,
            adat_id: d.adat_id?._id || d.adat_id,
            adat_nama: d.adat_id?.nama_adat,
            warna_dominan: d.warna_dominan,
            vendor_id: d.vendor_id?._id || d.vendor_id,
            vendor_nama: d.vendor_id?.nama_vendor,
            harga: d.harga || 0,
            foto: d.foto,
            catatan: d.catatan,
            status: d.status,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return list;
};

export const useKatalogMakeup = () => {
  const [initialized, setInitialized] = useState(false);
  const list = useSyncExternalStore(subscribe, () => state.katalogMakeup, () => state.katalogMakeup);
  useEffect(() => {
    if (!initialized) {
      ambilKatalogMakeup().then((data) => {
        setState((s) => ({
          ...s,
          katalogMakeup: data.map((m: any) => ({
            id: m._id,
            nama_style: m.nama_style,
            kategori: m.kategori,
            vendor_mua_id: m.vendor_mua_id?._id || m.vendor_mua_id,
            vendor_mua_nama: m.vendor_mua_id?.nama_vendor,
            foto: m.foto,
            harga: m.harga || 0,
            catatan: m.catatan,
            status: m.status,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return list;
};
