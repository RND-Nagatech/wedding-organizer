// Reactive in-memory store untuk MVP (frontend-only)
import { useSyncExternalStore } from "react";
import {
  bookings as initialBookings,
  checklist as initialChecklist,
  clients as initialClients,
  invoices as initialInvoices,
  packages as initialPackages,
  vendors as initialVendors,
  type Booking,
  type ChecklistItem,
  type Client,
  type Invoice,
  type Package,
  type Vendor,
} from "./mockData";

type State = {
  clients: Client[];
  vendors: Vendor[];
  packages: Package[];
  bookings: Booking[];
  checklist: ChecklistItem[];
  invoices: Invoice[];
};

let state: State = {
  clients: [...initialClients],
  vendors: [...initialVendors],
  packages: [...initialPackages],
  bookings: [...initialBookings],
  checklist: [...initialChecklist],
  invoices: [...initialInvoices],
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

const getId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const store = {
  addClient: (c: Omit<Client, "id">) =>
    setState((s) => ({ ...s, clients: [{ ...c, id: getId("c") }, ...s.clients] })),
  addVendor: (v: Omit<Vendor, "id">) =>
    setState((s) => ({ ...s, vendors: [{ ...v, id: getId("v") }, ...s.vendors] })),
  addPackage: (p: Omit<Package, "id">) =>
    setState((s) => ({ ...s, packages: [...s.packages, { ...p, id: getId("pkg") }] })),
  addBooking: (b: Omit<Booking, "id">) =>
    setState((s) => ({ ...s, bookings: [{ ...b, id: getId("b") }, ...s.bookings] })),
};

export const useClients = () =>
  useSyncExternalStore(subscribe, () => state.clients, () => state.clients);
export const useVendors = () =>
  useSyncExternalStore(subscribe, () => state.vendors, () => state.vendors);
export const usePackages = () =>
  useSyncExternalStore(subscribe, () => state.packages, () => state.packages);
export const useBookings = () =>
  useSyncExternalStore(subscribe, () => state.bookings, () => state.bookings);
export const useInvoices = () =>
  useSyncExternalStore(subscribe, () => state.invoices, () => state.invoices);
export const useChecklist = () =>
  useSyncExternalStore(subscribe, () => state.checklist, () => state.checklist);
