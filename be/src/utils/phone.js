export function normalizePhoneID(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  // keep digits only
  let digits = s.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `${digits}@c.us`;
  // already has country code without 62 (rare) -> assume it's full
  return `${digits}@c.us`;
}

