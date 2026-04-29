// Draft booking client (auto-save) - per client/user

export type BookingDraft = {
  eventDate?: string;
  venue?: string;
  guests?: number;
  adatId?: string;
  note?: string;
  addonsQty?: Record<string, number>;
};

const KEY_PREFIX = "wo.bookingDraft.v2";
const LEGACY_KEY = "wo.bookingDraft.v1";

function keyFor(clientId: string) {
  return `${KEY_PREFIX}:${String(clientId || "anon")}`;
}

function safeParse(raw: string | null) {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readBookingDraft(clientId: string): BookingDraft {
  const parsed = safeParse(localStorage.getItem(keyFor(clientId)));
  if (!parsed) {
    // one-time migration from legacy (global) key
    const legacy = safeParse(localStorage.getItem(LEGACY_KEY));
    if (legacy) {
      const migrated: BookingDraft = {
        eventDate: typeof legacy.eventDate === "string" ? legacy.eventDate : undefined,
        venue: typeof legacy.venue === "string" ? legacy.venue : undefined,
        guests: typeof legacy.guests === "number" ? legacy.guests : undefined,
        adatId: typeof legacy.adatId === "string" ? legacy.adatId : undefined,
        note: typeof legacy.note === "string" ? legacy.note : undefined,
        addonsQty: typeof legacy.addonsQty === "object" && legacy.addonsQty ? legacy.addonsQty : undefined,
      };
      writeBookingDraft(clientId, migrated);
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
    return {};
  }

  const draft: BookingDraft = {};
  if (typeof parsed.eventDate === "string") draft.eventDate = parsed.eventDate;
  if (typeof parsed.venue === "string") draft.venue = parsed.venue;
  if (typeof parsed.guests === "number") draft.guests = parsed.guests;
  if (typeof parsed.adatId === "string") draft.adatId = parsed.adatId;
  if (typeof parsed.note === "string") draft.note = parsed.note;
  if (typeof parsed.addonsQty === "object" && parsed.addonsQty) draft.addonsQty = parsed.addonsQty;
  return draft;
}

export function writeBookingDraft(clientId: string, next: BookingDraft) {
  localStorage.setItem(keyFor(clientId), JSON.stringify(next || {}));
}

export function clearBookingDraft(clientId: string) {
  localStorage.removeItem(keyFor(clientId));
}
