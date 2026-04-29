export function titleCaseWords(input: string) {
  return String(input || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const STATUS_LABELS: Record<string, string> = {
  menunggu_review: "Menunggu Review",
  approved: "Approved",
  rejected: "Rejected",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",

  belum_bayar: "Belum Bayar",
  "belum bayar": "Belum Bayar",
  DP: "DP",
  cicilan: "Cicilan",
  pelunasan: "Pelunasan",
  lunas: "Lunas",

  draft: "Draft",
  aktif: "Aktif",
  nonaktif: "Nonaktif",
  selesai: "Selesai",
  batal: "Batal",

  belum_dikerjakan: "Belum Dikerjakan",
  proses: "Dalam Proses",
  terlambat: "Terlambat",

  belum_siap: "Belum Siap",
  siap: "Siap",
  dibawa: "Dibawa",
  dikembalikan: "Dikembalikan",

  hold: "Hold",
  booked: "Booked",

  baru: "Baru",
  "tidak bisa": "Tidak Bisa",

  prospek: "Prospek",
  deal: "Deal",

  tersedia: "Tersedia",
  "tidak tersedia": "Tidak Tersedia",
};

export function statusLabel(status: string) {
  const raw = String(status || "");
  return STATUS_LABELS[raw] || titleCaseWords(raw);
}
