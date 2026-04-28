import { toast } from "sonner";

type BookingDraft = {
  bajuId?: string;
  dekorasiId?: string;
  makeupId?: string;
};

const KEY = "wo.bookingDraft.v1";

export function readBookingDraft(): BookingDraft {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return {
      bajuId: typeof parsed.bajuId === "string" ? parsed.bajuId : undefined,
      dekorasiId: typeof parsed.dekorasiId === "string" ? parsed.dekorasiId : undefined,
      makeupId: typeof parsed.makeupId === "string" ? parsed.makeupId : undefined,
    };
  } catch {
    return {};
  }
}

export function writeBookingDraft(next: BookingDraft) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearBookingDraft() {
  localStorage.removeItem(KEY);
}

export function pickDraftItem(kind: "baju" | "dekorasi" | "makeup", id: string) {
  const draft = readBookingDraft();
  const next: BookingDraft = { ...draft };
  if (kind === "baju") next.bajuId = id;
  if (kind === "dekorasi") next.dekorasiId = id;
  if (kind === "makeup") next.makeupId = id;
  writeBookingDraft(next);
  toast.success("Preferensi tersimpan. Lanjutkan ke Booking.");
}

