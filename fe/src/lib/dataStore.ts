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
import { ambilPembayaran, tambahPembayaran } from "./api";

export type Payment = {
  id: string;
  code: string;
  bookingCode: string;
  clientCode: string;
  clientName: string;
  totalDue: number;
  amountPaid: number;
  remaining: number;
  method: string;
  paidDate: string;
  status: "belum bayar" | "DP" | "cicilan" | "lunas";
};

type State = {
  clients: Client[];
  vendors: Vendor[];
  packages: Package[];
  bookings: Booking[];
  checklist: ChecklistItem[];
  invoices: Invoice[];
  payments: Payment[];
};

let state: State = {
  clients: [],
  vendors: [],
  packages: [],
  bookings: [],
  checklist: [],
  invoices: [],
  payments: [],
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
      kontak: v.contact,
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
        contact: vendor.kontak,
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
      kontak: v.contact,
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
              contact: vendor.kontak,
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
        clientId: booking.id_klien,
        packageId: booking.id_paket,
        eventDate: booking.tanggal_acara,
        venue: booking.lokasi,
        guests: booking.tamu,
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
              clientId: booking.id_klien,
              packageId: booking.id_paket,
              eventDate: booking.tanggal_acara,
              venue: booking.lokasi,
              guests: booking.tamu,
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
  addPayment: async (p: { kode_booking: string; nominal_bayar: number; metode_pembayaran: string; tanggal_pembayaran?: string }) => {
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
          method: pay.metode_pembayaran,
          paidDate: pay.tanggal_pembayaran,
          status: pay.status_pembayaran,
        },
        ...s.payments,
      ],
    }));
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
            clientId: b.id_klien,
            packageId: b.id_paket,
            eventDate: b.tanggal_acara,
            venue: b.lokasi,
            guests: b.tamu,
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

export const usePayments = () => {
  const [initialized, setInitialized] = useState(false);
  const payments = useSyncExternalStore(subscribe, () => state.payments, () => state.payments);
  useEffect(() => {
    if (!initialized) {
      ambilPembayaran().then((data) => {
        setState((s) => ({
          ...s,
          payments: data.map((p: any) => ({
            id: p._id,
            code: p.kode_pembayaran,
            bookingCode: p.kode_booking,
            clientCode: p.kode_client,
            clientName: p.nama_client,
            totalDue: p.total_tagihan,
            amountPaid: p.nominal_bayar,
            remaining: p.sisa_tagihan,
            method: p.metode_pembayaran,
            paidDate: p.tanggal_pembayaran,
            status: p.status_pembayaran,
          })),
        }));
        setInitialized(true);
      });
    }
  }, [initialized]);
  return payments;
};
