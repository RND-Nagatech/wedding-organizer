import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { store, useAdat, useClients, usePackages, useVendors } from "@/lib/dataStore";
import { toast } from "sonner";
import { formatIDR } from "@/lib/mockData";
import type { Booking } from "@/lib/mockData";
import { Eye, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ambilKategoriVendor, ambilVendorAvailableByKategori } from "@/lib/api";

export function BookingEventFormDialog(props: {
  mode: "add" | "edit";
  initial?: Booking;
  trigger: React.ReactNode;
}) {
  const { mode, initial, trigger } = props;
  const clients = useClients();
  const packages = usePackages();
  const adat = useAdat();
  const vendors = useVendors();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPkgDetail, setShowPkgDetail] = useState(false);
  const [kategoriVendor, setKategoriVendor] = useState<any[]>([]);
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>("");
  const [vendorsAvailable, setVendorsAvailable] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    clientId: "",
    packageId: "",
    adatId: "",
    eventDate: "",
    venue: "",
    pic: "",
    eventStatus: "draft" as "draft" | "aktif" | "selesai" | "batal",
    note: "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setShowPkgDetail(false);
    setSelectedKategoriId("");
    setVendorsAvailable([]);
    setForm({
      clientId: initial?.clientId ?? (mode === "add" ? "" : clients[0]?.id ?? ""),
      packageId: initial?.packageId ?? (packages[0]?.id ?? ""),
      adatId: initial?.adatId ?? (adat[0]?.id ?? ""),
      eventDate: mode === "add" ? "" : (initial?.eventDate ?? ""),
      venue: initial?.venue ?? "",
      pic: initial?.pic ?? "",
      eventStatus: initial?.eventStatus ?? "draft",
      note: initial?.note ?? "",
    });
    setSelectedVendorIds(initial?.vendorSelectedIds ?? []);
  }, [open, initial, clients, packages, adat]);

  useEffect(() => {
    if (!open) return;
    ambilKategoriVendor()
      .then((data) => setKategoriVendor(data))
      .catch(() => setKategoriVendor([]));
  }, [open]);

  const selectedPackage = packages.find((p) => p.id === form.packageId);
  const packageName = initial?.packageSnapshot?.name || selectedPackage?.name || "-";
  const packageTagline = initial?.packageSnapshot?.tagline || selectedPackage?.tagline || "";
  const packagePrice = initial?.packageSnapshot?.price ?? selectedPackage?.price ?? 0;
  const packageFeatures = initial?.packageSnapshot?.features || selectedPackage?.features || [];
  const packageVendorIds = initial?.packageSnapshot?.vendorIds || selectedPackage?.vendorIds || [];
  const packageVendors = vendors.filter((v) => packageVendorIds.includes(v.id));

  const packageKategoriIds = Array.from(new Set(packageVendors.map((v) => v.categoryId).filter(Boolean)));
  const kategoriOptions = kategoriVendor.filter((k) => packageKategoriIds.includes(k._id));

  useEffect(() => {
    if (!open) return;
    // Jika paket berubah, pastikan vendor yang sudah dipilih masih termasuk paket
    setSelectedVendorIds((prev) => prev.filter((id) => packageVendorIds.includes(id)));
    // Reset kategori yang sedang dilihat jika sudah tidak relevan
    if (selectedKategoriId && !packageKategoriIds.includes(selectedKategoriId)) {
      setSelectedKategoriId("");
      setVendorsAvailable([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.packageId]);

  useEffect(() => {
    if (!open) return;
    if (!selectedKategoriId || !form.packageId || !form.eventDate) {
      setVendorsAvailable([]);
      return;
    }
    (async () => {
      try {
        setLoadingVendors(true);
        const list = await ambilVendorAvailableByKategori({
          package_id: form.packageId,
          tanggal_acara: form.eventDate,
          kategori_vendor_id: selectedKategoriId,
        });
        setVendorsAvailable(list);
      } catch {
        setVendorsAvailable([]);
      } finally {
        setLoadingVendors(false);
      }
    })();
  }, [open, selectedKategoriId, form.packageId, form.eventDate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.clientId) next.clientId = "Klien wajib dipilih";
    if (!form.packageId) next.packageId = "Paket wajib dipilih";
    if (!form.eventDate) next.eventDate = "Tanggal acara wajib diisi";
    if (!form.venue) next.venue = "Lokasi acara wajib diisi";
    if (selectedVendorIds.length === 0) next.vendor = "Pilih minimal 1 vendor";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      if (mode === "add") {
        await store.addEventBooking({
          clientId: form.clientId,
          packageId: form.packageId,
          adatId: form.adatId || undefined,
          eventDate: form.eventDate,
          venue: form.venue,
          pic: form.pic || undefined,
          eventStatus: form.eventStatus,
          note: form.note || undefined,
          vendorSelectedIds: selectedVendorIds,
        });
        toast.success("Booking/event berhasil dibuat");
      } else if (initial?.id) {
        await store.updateEventBooking(initial.id, {
          clientId: form.clientId,
          packageId: form.packageId,
          adatId: form.adatId || undefined,
          eventDate: form.eventDate,
          venue: form.venue,
          pic: form.pic || undefined,
          eventStatus: form.eventStatus,
          note: form.note || undefined,
          vendorSelectedIds: selectedVendorIds,
        });
        toast.success("Booking/event berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan booking/event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "add" ? "Buat Booking / Event" : "Edit Booking / Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Klien</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                <SelectContent>
                  {/* Searchable input */}
                  <div className="px-2 py-1 sticky top-0 z-10 bg-popover">
                    <input
                      type="text"
                      className="w-full rounded border px-2 py-1 text-sm focus:outline-none"
                      placeholder="Cari klien..."
                      value={form._searchClient || ""}
                      onChange={e => setForm((f) => ({ ...f, _searchClient: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  {(clients.filter(c => {
                    const search = (form._searchClient || "").toLowerCase();
                    return !search ||
                      (c.code?.toLowerCase().includes(search)) ||
                      (c.name?.toLowerCase().includes(search)) ||
                      (c.partner?.toLowerCase().includes(search));
                  })).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(c.code ? `${c.code} · ` : "") + `${c.name} & ${c.partner}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId ? <div className="text-xs text-destructive">{errors.clientId}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Paket</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={form.packageId} onValueChange={(v) => setForm((f) => ({ ...f, packageId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
                    <SelectContent>
                      {packages.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowPkgDetail((v) => !v)} disabled={!form.packageId}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              {errors.packageId ? <div className="text-xs text-destructive">{errors.packageId}</div> : null}
            </div>
          </div>

          {showPkgDetail ? (
            <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Detail Paket</div>
                <div className="font-display text-xl">{packageName}</div>
                {packageTagline ? <div className="text-sm text-muted-foreground">{packageTagline}</div> : null}
                <div className="text-sm font-medium text-primary mt-1">{formatIDR(packagePrice)}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Fasilitas</div>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                  {packageFeatures.length ? packageFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{f}</span>
                    </li>
                  )) : <li className="text-muted-foreground">—</li>}
                </ul>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Vendor dalam Paket</div>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                  {packageVendors.length ? packageVendors.map((v) => (
                    <li key={v.id}>
                      <span className="font-medium">{v.name}</span>{" "}
                      <span className="text-muted-foreground">· {v.category}</span>
                    </li>
                  )) : <li className="text-muted-foreground">—</li>}
                </ul>
              </div>
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Acara</Label>
              <Input type="date" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} disabled={saving} />
              {errors.eventDate ? <div className="text-xs text-destructive">{errors.eventDate}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Lokasi Acara</Label>
              <Input value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} disabled={saving} placeholder="Lokasi acara" />
              {errors.venue ? <div className="text-xs text-destructive">{errors.venue}</div> : null}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Pilih Vendor</div>
                <div className="text-sm text-muted-foreground">
                  Hanya vendor dalam paket & available di tanggal acara yang muncul.
                </div>
              </div>
              <div className="text-sm font-medium">
                Dipilih: <span className="text-primary">{selectedVendorIds.length}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kategori Vendor</Label>
                <Select
                  value={selectedKategoriId}
                  onValueChange={(v) => setSelectedKategoriId(v)}
                  disabled={saving || !form.packageId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.packageId ? "Pilih kategori vendor" : "Pilih paket dulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriOptions.map((k) => (
                      <SelectItem key={k._id} value={k._id}>
                        {k.nama_kategori}
                      </SelectItem>
                    ))}
                    {kategoriOptions.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        Paket ini belum punya vendor
                      </SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Vendor (per kategori)</Label>
                <div className="rounded-md border border-border p-3 min-h-[96px] bg-background">
                  {!form.eventDate ? (
                    <div className="text-sm text-muted-foreground">Isi tanggal acara dulu</div>
                  ) : !selectedKategoriId ? (
                    <div className="text-sm text-muted-foreground">Pilih kategori vendor</div>
                  ) : loadingVendors ? (
                    <div className="text-sm text-muted-foreground">Memuat vendor...</div>
                  ) : vendorsAvailable.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Tidak ada vendor available</div>
                  ) : (
                    <div className="space-y-2">
                      {vendorsAvailable.map((v: any) => {
                        const id = String(v._id);
                        const checked = selectedVendorIds.includes(id);
                        return (
                          <label key={id} className="flex items-start gap-2 cursor-pointer select-none">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) => {
                                const nextChecked = Boolean(val);
                                setSelectedVendorIds((prev) => {
                                  if (nextChecked) return Array.from(new Set([...prev, id]));
                                  return prev.filter((x) => x !== id);
                                });
                              }}
                            />
                            <div className="leading-tight">
                              <div className="text-sm font-medium">{v.nama_vendor}</div>
                              <div className="text-xs text-muted-foreground">{v.kategori_vendor_nama || v.kategori_vendor_id?.nama_kategori || "—"}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                {errors.vendor ? <div className="text-xs text-destructive">{errors.vendor}</div> : null}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Adat / Konsep (Opsional)</Label>
              <Select value={form.adatId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, adatId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih adat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {adat.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nama_adat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status Event</Label>
              <Select value={form.eventStatus} onValueChange={(v) => setForm((f) => ({ ...f, eventStatus: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="batal">Batal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>PIC (Opsional)</Label>
              <Input value={form.pic} onChange={(e) => setForm((f) => ({ ...f, pic: e.target.value }))} disabled={saving} placeholder="Nama PIC" />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan (Opsional)</Label>
              <Textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddBookingEventDialog() {
  return (
    <BookingEventFormDialog
      mode="add"
      trigger={
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> Booking Baru
        </Button>
      }
    />
  );
}
