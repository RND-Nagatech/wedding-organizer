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
// API helper untuk FE
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
