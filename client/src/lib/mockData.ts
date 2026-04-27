// Mock data untuk MVP Wedding Organizer (frontend-only)

export type Role = "owner" | "admin" | "staff" | "client";

// Permissions untuk setiap menu admin area
export type Permission =
  | "dashboard"
  | "clients"
  | "vendors"
  | "packages"
  | "bookings"
  | "timeline"
  | "invoices"
  | "reports"
  | "settings";

export const rolePermissions: Record<Exclude<Role, "client">, Permission[]> = {
  owner: ["dashboard", "clients", "vendors", "packages", "bookings", "timeline", "invoices", "reports", "settings"],
  admin: ["dashboard", "clients", "vendors", "packages", "bookings", "timeline", "invoices", "reports"],
  staff: ["dashboard", "clients", "vendors", "bookings", "timeline"],
};

export const roleLabel: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  client: "Klien",
};

export const can = (role: Role, perm: Permission): boolean => {
  if (role === "client") return false;
  return rolePermissions[role].includes(perm);
};

export type Client = {
  id: string;
  name: string;
  partner: string;
  email: string;
  phone: string;
  weddingDate: string;
  packageId: string;
  status: "Lead" | "Booked" | "Ongoing" | "Completed";
  budget: number;
};

export type Vendor = {
  id: string;
  name: string;
  category: "Catering" | "Dekorasi" | "Fotografi" | "MUA" | "Venue" | "Musik";
  contact: string;
  rating: number;
  priceRange: string;
};

export type Package = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  features: string[];
  popular?: boolean;
};

export type Booking = {
  id: string;
  clientId: string;
  packageId: string;
  eventDate: string;
  venue: string;
  guests: number;
  status: "Pending" | "Confirmed" | "Done";
};

export type ChecklistItem = {
  id: string;
  bookingId: string;
  title: string;
  dueDate: string;
  done: boolean;
  category: string;
};

export type Invoice = {
  id: string;
  bookingId: string;
  clientId: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: "Unpaid" | "Partial" | "Paid";
};

export const packages: Package[] = [
  {
    id: "pkg-silver",
    name: "Silver Romance",
    tagline: "Pernikahan intim yang berkesan",
    price: 45_000_000,
    features: [
      "Hingga 100 tamu",
      "Dekorasi pelaminan minimalis",
      "Fotografi 6 jam",
      "MC & koordinator hari-H",
      "Catering basic 100 pax",
    ],
  },
  {
    id: "pkg-gold",
    name: "Gold Elegance",
    tagline: "Paket favorit kami",
    price: 95_000_000,
    popular: true,
    features: [
      "Hingga 300 tamu",
      "Dekorasi premium + bunga segar",
      "Fotografi & videografi sinematik",
      "Live music akustik",
      "Catering prasmanan 300 pax",
      "Wedding planner dedicated",
    ],
  },
  {
    id: "pkg-platinum",
    name: "Platinum Luxury",
    tagline: "Pernikahan mewah tanpa kompromi",
    price: 175_000_000,
    features: [
      "Hingga 500 tamu",
      "Dekorasi mewah custom design",
      "Tim foto/video premium",
      "Live band + DJ",
      "Catering premium 500 pax",
      "Wedding planner + asisten",
      "Honeymoon package gratis",
    ],
  },
];

export const clients: Client[] = [
  {
    id: "c-001",
    name: "Anindya Putri",
    partner: "Reza Hakim",
    email: "anindya@mail.com",
    phone: "0812-3456-7890",
    weddingDate: "2026-06-12",
    packageId: "pkg-gold",
    status: "Booked",
    budget: 100_000_000,
  },
  {
    id: "c-002",
    name: "Sarah Wijaya",
    partner: "Daniel Tanaka",
    email: "sarah.w@mail.com",
    phone: "0813-2222-1111",
    weddingDate: "2026-08-20",
    packageId: "pkg-platinum",
    status: "Ongoing",
    budget: 200_000_000,
  },
  {
    id: "c-003",
    name: "Maya Lestari",
    partner: "Bayu Pratama",
    email: "maya.l@mail.com",
    phone: "0856-7788-9900",
    weddingDate: "2026-05-03",
    packageId: "pkg-silver",
    status: "Lead",
    budget: 50_000_000,
  },
  {
    id: "c-004",
    name: "Citra Dewi",
    partner: "Aldo Mahendra",
    email: "citra@mail.com",
    phone: "0821-3344-5566",
    weddingDate: "2025-12-10",
    packageId: "pkg-gold",
    status: "Completed",
    budget: 95_000_000,
  },
];

export const vendors: Vendor[] = [
  { id: "v-1", name: "Aroma Catering", category: "Catering", contact: "021-555-1010", rating: 4.8, priceRange: "Rp 75rb–150rb /pax" },
  { id: "v-2", name: "Bloom & Petals", category: "Dekorasi", contact: "0812-1111-2222", rating: 4.9, priceRange: "Rp 15jt–60jt" },
  { id: "v-3", name: "Frame Studio", category: "Fotografi", contact: "0813-3333-4444", rating: 4.7, priceRange: "Rp 8jt–35jt" },
  { id: "v-4", name: "Glow Artistry", category: "MUA", contact: "0856-5555-6666", rating: 5.0, priceRange: "Rp 5jt–20jt" },
  { id: "v-5", name: "Grand Ballroom Sentosa", category: "Venue", contact: "021-777-8899", rating: 4.6, priceRange: "Rp 30jt–120jt" },
  { id: "v-6", name: "Harmoni Music", category: "Musik", contact: "0821-9999-0000", rating: 4.8, priceRange: "Rp 6jt–25jt" },
];

export const bookings: Booking[] = [
  { id: "b-001", clientId: "c-001", packageId: "pkg-gold", eventDate: "2026-06-12", venue: "Grand Ballroom Sentosa", guests: 280, status: "Confirmed" },
  { id: "b-002", clientId: "c-002", packageId: "pkg-platinum", eventDate: "2026-08-20", venue: "The Ritz Pavilion", guests: 450, status: "Confirmed" },
  { id: "b-003", clientId: "c-003", packageId: "pkg-silver", eventDate: "2026-05-03", venue: "Garden House", guests: 90, status: "Pending" },
  { id: "b-004", clientId: "c-004", packageId: "pkg-gold", eventDate: "2025-12-10", venue: "Lotus Hall", guests: 250, status: "Done" },
];

export const checklist: ChecklistItem[] = [
  { id: "t-1", bookingId: "b-001", title: "Tanda tangan kontrak vendor catering", dueDate: "2026-01-15", done: true, category: "Vendor" },
  { id: "t-2", bookingId: "b-001", title: "Fitting baju pengantin", dueDate: "2026-03-10", done: true, category: "Pakaian" },
  { id: "t-3", bookingId: "b-001", title: "Sebar undangan", dueDate: "2026-04-20", done: false, category: "Undangan" },
  { id: "t-4", bookingId: "b-001", title: "Final meeting dengan WO", dueDate: "2026-05-25", done: false, category: "Koordinasi" },
  { id: "t-5", bookingId: "b-001", title: "Gladi resik", dueDate: "2026-06-10", done: false, category: "Acara" },
  { id: "t-6", bookingId: "b-001", title: "Hari pernikahan 💍", dueDate: "2026-06-12", done: false, category: "Acara" },
];

export const invoices: Invoice[] = [
  { id: "INV-001", bookingId: "b-001", clientId: "c-001", amount: 95_000_000, paid: 47_500_000, dueDate: "2026-05-12", status: "Partial" },
  { id: "INV-002", bookingId: "b-002", clientId: "c-002", amount: 175_000_000, paid: 50_000_000, dueDate: "2026-07-20", status: "Partial" },
  { id: "INV-003", bookingId: "b-003", clientId: "c-003", amount: 45_000_000, paid: 0, dueDate: "2026-04-01", status: "Unpaid" },
  { id: "INV-004", bookingId: "b-004", clientId: "c-004", amount: 95_000_000, paid: 95_000_000, dueDate: "2025-11-10", status: "Paid" },
];

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
