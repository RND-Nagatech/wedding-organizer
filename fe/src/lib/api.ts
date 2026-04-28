// Profil Bisnis (tp_system)
export async function ambilProfilBisnis() {
  const res = await fetch(`${API_BASE}/tp_system`);
  if (!res.ok) throw new Error("Gagal mengambil profil bisnis");
  return res.json();
}

export async function updateProfilBisnis(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tp_system/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal update profil bisnis");
  return res.json();
}

export async function tambahProfilBisnis(data: any) {
  const res = await fetch(`${API_BASE}/tp_system`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal tambah profil bisnis");
  return res.json();
}
// User (tm_user)
export async function ambilUser() {
  const res = await fetch(`${API_BASE}/tm_user`);
  if (!res.ok) throw new Error("Gagal mengambil data user");
  return res.json();
}

export async function tambahUser(data: any) {
  const res = await fetch(`${API_BASE}/tm_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah user");
  return res.json();
}

export async function editUser(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_user/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit user");
  return res.json();
}

export async function hapusUser(id: string) {
  const res = await fetch(`${API_BASE}/tm_user/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus user");
  return res.json();
}
// Kategori Vendor
export async function ambilKategoriVendor() {
  const res = await fetch(`${API_BASE}/tm_kat_vendor`);
  if (!res.ok) throw new Error("Gagal mengambil data kategori vendor");
  return res.json();
}

export async function tambahKategoriVendor(data: any) {
  const res = await fetch(`${API_BASE}/tm_kat_vendor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah kategori vendor");
  return res.json();
}

export async function editKategoriVendor(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_kat_vendor/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit kategori vendor");
  return res.json();
}

export async function hapusKategoriVendor(id: string) {
  const res = await fetch(`${API_BASE}/tm_kat_vendor/${id}`, {
    method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus kategori vendor");
  return res.json();
}

// Klien
export async function editKlien(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_client/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit klien");
  return res.json();
}

export async function hapusKlien(id: string) {
  const res = await fetch(`${API_BASE}/tm_client/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus klien");
  return res.json();
}

// Vendor
export async function editVendor(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_vendor/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit vendor");
  return res.json();
}

export async function hapusVendor(id: string) {
  const res = await fetch(`${API_BASE}/tm_vendor/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus vendor");
  return res.json();
}

// Paket
export async function ambilPaket() {
  const res = await fetch(`${API_BASE}/tm_package`);
  if (!res.ok) throw new Error("Gagal mengambil data paket");
  return res.json();
}

export async function tambahPaket(data: any) {
  const res = await fetch(`${API_BASE}/tm_package`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah paket");
  return res.json();
}

export async function editPaket(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_package/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit paket");
  return res.json();
}

export async function hapusPaket(id: string) {
  const res = await fetch(`${API_BASE}/tm_package/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus paket");
  return res.json();
}

// Booking
export async function ambilBooking() {
  const res = await fetch(`${API_BASE}/tt_booking`);
  if (!res.ok) throw new Error("Gagal mengambil data booking");
  return res.json();
}

export async function tambahBooking(data: any) {
  const res = await fetch(`${API_BASE}/tt_booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah booking");
  return res.json();
}

export async function editBooking(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_booking/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit booking");
  return res.json();
}

export async function hapusBooking(id: string) {
  const res = await fetch(`${API_BASE}/tt_booking/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus booking");
  return res.json();
}

export async function ambilVendorAvailable(params: { package_id: string; tanggal_acara: string }) {
  const qs = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/tt_booking/available-vendors?${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil vendor available");
  return res.json();
}

export async function ambilVendorAvailableByKategori(params: { package_id: string; tanggal_acara: string; kategori_vendor_id: string }) {
  const qs = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/tt_booking/available-vendors?${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil vendor available");
  return res.json();
}

// Vendor booking (tt_vendor_booking)
export async function ambilVendorBooking(params?: { kode_booking?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/tt_vendor_booking${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil data vendor booking");
  return res.json();
}

export async function updateVendorBooking(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_vendor_booking/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit vendor booking");
  return res.json();
}

// Referensi client (tt_referensi_client)
export async function ambilReferensiClient(params?: { kode_booking?: string; kategori?: string; status?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/tt_referensi_client${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil data referensi client");
  return res.json();
}

export async function tambahReferensiClient(data: any) {
  const res = await fetch(`${API_BASE}/tt_referensi_client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah referensi client");
  return res.json();
}

export async function editReferensiClient(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_referensi_client/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit referensi client");
  return res.json();
}

export async function hapusReferensiClient(id: string) {
  const res = await fetch(`${API_BASE}/tt_referensi_client/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus referensi client");
  return res.json();
}

// Wishlist client (tt_wishlist_client)
export async function ambilWishlistClient(params?: { kode_booking?: string; kategori?: string; status?: string; prioritas?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/tt_wishlist_client${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil data wishlist client");
  return res.json();
}

export async function tambahWishlistClient(data: any) {
  const res = await fetch(`${API_BASE}/tt_wishlist_client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah wishlist client");
  return res.json();
}

export async function editWishlistClient(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_wishlist_client/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit wishlist client");
  return res.json();
}

export async function hapusWishlistClient(id: string) {
  const res = await fetch(`${API_BASE}/tt_wishlist_client/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus wishlist client");
  return res.json();
}

// Pembayaran
export async function ambilPembayaran() {
  const res = await fetch(`${API_BASE}/tt_payment`);
  if (!res.ok) throw new Error("Gagal mengambil data pembayaran");
  return res.json();
}

export async function tambahPembayaran(data: any) {
  const res = await fetch(`${API_BASE}/tt_payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah pembayaran");
  return res.json();
}

export async function editPembayaran(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_payment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit pembayaran");
  return res.json();
}

export async function hapusPembayaran(id: string) {
  const res = await fetch(`${API_BASE}/tt_payment/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus pembayaran");
  return res.json();
}

// Invoice
export async function ambilInvoice() {
  const res = await fetch(`${API_BASE}/tt_invoice`);
  if (!res.ok) throw new Error("Gagal mengambil data invoice");
  return res.json();
}

export async function tambahInvoice(data: any) {
  const res = await fetch(`${API_BASE}/tt_invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah invoice");
  return res.json();
}

// Checklist
export async function ambilChecklist() {
  const res = await fetch(`${API_BASE}/tt_checklist`);
  if (!res.ok) throw new Error("Gagal mengambil data checklist");
  return res.json();
}

export async function tambahChecklist(data: any) {
  const res = await fetch(`${API_BASE}/tt_checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah checklist");
  return res.json();
}

// Tahap 8: Checklist Barang (tt_checklist_barang)
export async function ambilChecklistBarang(params?: { kode_booking?: string; kategori_barang?: string; status?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/tt_checklist_barang${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil checklist barang");
  return res.json();
}

export async function tambahChecklistBarang(data: any) {
  const res = await fetch(`${API_BASE}/tt_checklist_barang`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah checklist barang");
  return res.json();
}

export async function editChecklistBarang(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_checklist_barang/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit checklist barang");
  return res.json();
}

export async function hapusChecklistBarang(id: string) {
  const res = await fetch(`${API_BASE}/tt_checklist_barang/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus checklist barang");
  return res.json();
}

// Tahap 9: Crew Assignment (tt_crew_assignment)
export async function ambilCrewAssignment(params?: { kode_booking?: string; tanggal_tugas?: string; role?: string; status_hadir?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/tt_crew_assignment${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil data crew assignment");
  return res.json();
}

export async function tambahCrewAssignment(data: any) {
  const res = await fetch(`${API_BASE}/tt_crew_assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah crew assignment");
  return res.json();
}

export async function editCrewAssignment(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_crew_assignment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit crew assignment");
  return res.json();
}

export async function hapusCrewAssignment(id: string) {
  const res = await fetch(`${API_BASE}/tt_crew_assignment/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus crew assignment");
  return res.json();
}

// Tahap 10: Timeline Event (tt_timeline_event)
export async function ambilTimelineEvent(params?: { kode_booking?: string; pic?: string; status?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/tt_timeline_event${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil timeline event");
  return res.json();
}

export async function tambahTimelineEvent(data: any) {
  const res = await fetch(`${API_BASE}/tt_timeline_event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah timeline event");
  return res.json();
}

export async function editTimelineEvent(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_timeline_event/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit timeline event");
  return res.json();
}

export async function hapusTimelineEvent(id: string) {
  const res = await fetch(`${API_BASE}/tt_timeline_event/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus timeline event");
  return res.json();
}

// Tahap 12: Keuangan (tt_keuangan)
export async function ambilKeuangan(params?: { tgl_from?: string; tgl_to?: string; kategori?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/tt_keuangan${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil data keuangan");
  return res.json();
}

export async function tambahKeuangan(data: any) {
  const res = await fetch(`${API_BASE}/tt_keuangan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah transaksi keuangan");
  return res.json();
}

export async function editKeuangan(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tt_keuangan/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit transaksi keuangan");
  return res.json();
}

export async function hapusKeuangan(id: string) {
  const res = await fetch(`${API_BASE}/tt_keuangan/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus transaksi keuangan");
  return res.json();
}

// Tahap 13: Reports
export async function reportEvents(params?: { tgl_from?: string; tgl_to?: string; status_event?: string; paket_id?: string; pic?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/reports/events${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil laporan event");
  return res.json();
}

export async function reportPayments(params?: { tgl_from?: string; tgl_to?: string; status?: string; kode_client?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/reports/payments${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil laporan pembayaran");
  return res.json();
}

export async function reportKeuanganDetail(params?: { tgl_from?: string; tgl_to?: string; kategori?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/reports/keuangan-detail${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil laporan keuangan detail");
  return res.json();
}

export async function reportKeuanganRekap(params?: { tgl_from?: string; tgl_to?: string }) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const res = await fetch(`${API_BASE}/reports/keuangan-rekap${qs}`);
  if (!res.ok) throw new Error("Gagal mengambil laporan keuangan rekap");
  return res.json();
}

// Auth
export async function loginApp(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => null))?.pesan;
    throw new Error(msg || "Gagal login");
  }
  return res.json();
}

export async function registerClientApp(data: { nama_klien: string; pasangan: string; email: string; telepon: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/register-client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => null))?.pesan;
    throw new Error(msg || "Gagal register klien");
  }
  return res.json();
}
// API helper untuk FE
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Upload image
export async function uploadGambar(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Gagal upload gambar");
  return res.json() as Promise<{ url: string }>;
}

// Adat / Konsep
export async function ambilAdat() {
  const res = await fetch(`${API_BASE}/tm_adat`);
  if (!res.ok) throw new Error("Gagal mengambil data adat");
  return res.json();
}
export async function tambahAdat(data: any) {
  const res = await fetch(`${API_BASE}/tm_adat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah adat");
  return res.json();
}
export async function editAdat(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_adat/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit adat");
  return res.json();
}
export async function hapusAdat(id: string) {
  const res = await fetch(`${API_BASE}/tm_adat/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus adat");
  return res.json();
}

// Katalog Baju
export async function ambilKatalogBaju() {
  const res = await fetch(`${API_BASE}/tm_katalog_baju`);
  if (!res.ok) throw new Error("Gagal mengambil katalog baju");
  return res.json();
}
export async function tambahKatalogBaju(data: any) {
  const res = await fetch(`${API_BASE}/tm_katalog_baju`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah katalog baju");
  return res.json();
}
export async function editKatalogBaju(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_katalog_baju/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit katalog baju");
  return res.json();
}
export async function hapusKatalogBaju(id: string) {
  const res = await fetch(`${API_BASE}/tm_katalog_baju/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus katalog baju");
  return res.json();
}

// Katalog Dekorasi
export async function ambilKatalogDekorasi() {
  const res = await fetch(`${API_BASE}/tm_katalog_dekorasi`);
  if (!res.ok) throw new Error("Gagal mengambil katalog dekorasi");
  return res.json();
}
export async function tambahKatalogDekorasi(data: any) {
  const res = await fetch(`${API_BASE}/tm_katalog_dekorasi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah katalog dekorasi");
  return res.json();
}
export async function editKatalogDekorasi(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_katalog_dekorasi/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit katalog dekorasi");
  return res.json();
}
export async function hapusKatalogDekorasi(id: string) {
  const res = await fetch(`${API_BASE}/tm_katalog_dekorasi/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus katalog dekorasi");
  return res.json();
}

// Katalog Makeup
export async function ambilKatalogMakeup() {
  const res = await fetch(`${API_BASE}/tm_katalog_makeup`);
  if (!res.ok) throw new Error("Gagal mengambil katalog makeup");
  return res.json();
}
export async function tambahKatalogMakeup(data: any) {
  const res = await fetch(`${API_BASE}/tm_katalog_makeup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah katalog makeup");
  return res.json();
}
export async function editKatalogMakeup(id: string, data: any) {
  const res = await fetch(`${API_BASE}/tm_katalog_makeup/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengedit katalog makeup");
  return res.json();
}
export async function hapusKatalogMakeup(id: string) {
  const res = await fetch(`${API_BASE}/tm_katalog_makeup/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus katalog makeup");
  return res.json();
}

export async function ambilVendor() {
  const res = await fetch(`${API_BASE}/tm_vendor`);
  if (!res.ok) throw new Error("Gagal mengambil data vendor");
  return res.json();
}

export async function tambahVendor(data: any) {
  const res = await fetch(`${API_BASE}/tm_vendor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah vendor");
  return res.json();
}

export async function ambilKlien() {
  const res = await fetch(`${API_BASE}/tm_client`);
  if (!res.ok) throw new Error("Gagal mengambil data klien");
  return res.json();
}

export async function tambahKlien(data: any) {
  const res = await fetch(`${API_BASE}/tm_client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah klien");
  return res.json();
}
