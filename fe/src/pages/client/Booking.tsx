import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatIDR } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarDays, MapPin, Users as UsersIcon, Heart, BadgeCheck } from "lucide-react";
import { store, useAdat, useAddons, useBookings, useClients, useKatalogBaju, useKatalogDekorasi, useKatalogMakeup, usePackages } from "@/lib/dataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { clearBookingDraft, readBookingDraft, writeBookingDraft } from "@/lib/bookingDraft";
import { statusLabel } from "@/lib/labels";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";

const sentinelNone = "__none__";

const ClientBooking = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  const cId = user?.clientId || "";
  const clients = useClients();
  const bookings = useBookings();
  const packages = usePackages();
  const adat = useAdat();
  const addons = useAddons();
  // keep katalog loaded for other client pages; booking does not select katalog as final
  useKatalogBaju();
  useKatalogDekorasi();
  useKatalogMakeup();

  const client = clients.find((c) => c.id === cId);
  const myBookings = useMemo(() => bookings.filter((b) => b.clientId === cId), [bookings, cId]);
  const activeBooking = useMemo(
    () => myBookings.find((b) => !["cancelled", "completed", "rejected"].includes(String(b.statusBooking || ""))),
    [myBookings]
  );
  const historyBookings = useMemo(
    () =>
      myBookings
        .filter((b) => ["cancelled", "completed", "rejected"].includes(String(b.statusBooking || "")))
        .sort((a, b) => String(b.eventDate || "").localeCompare(String(a.eventDate || ""))),
    [myBookings]
  );
  const pkg = packages.find((p) => p.id === client?.packageId);

  const draft = useMemo(() => readBookingDraft(cId), [cId]);

  const [form, setForm] = useState({
    eventDate: "",
    venue: "",
    guests: 0,
    adatId: sentinelNone,
    note: "",
    addonsQty: {} as Record<string, number>,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // default values when starting a new booking
  useEffect(() => {
    if (!client || activeBooking) return;
    setForm((f) => ({
      ...f,
      eventDate: "",
    }));
  }, [client?.id, activeBooking?.id]);

  // load saved draft (per client) into form
  useEffect(() => {
    if (!client || activeBooking) return;
    setForm((f) => ({
      ...f,
      eventDate: typeof draft.eventDate === "string" ? draft.eventDate : f.eventDate,
      venue: typeof draft.venue === "string" ? draft.venue : f.venue,
      guests: typeof draft.guests === "number" ? draft.guests : f.guests,
      adatId: typeof draft.adatId === "string" ? draft.adatId : f.adatId,
      note: typeof draft.note === "string" ? draft.note : f.note,
      addonsQty: typeof draft.addonsQty === "object" && draft.addonsQty ? (draft.addonsQty as any) : f.addonsQty,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id, activeBooking?.id, cId]);

  // autosave draft while booking not submitted
  useEffect(() => {
    if (!client || activeBooking) return;
    try {
      writeBookingDraft(cId, {
        eventDate: form.eventDate || undefined,
        venue: form.venue || undefined,
        guests: Number(form.guests || 0) || 0,
        adatId: form.adatId && form.adatId !== sentinelNone ? form.adatId : undefined,
        note: form.note || undefined,
        addonsQty: form.addonsQty || {},
      });
    } catch {
      // ignore storage error
    }
  }, [client?.id, activeBooking?.id, cId, form]);

  if (!activeBooking) {
    if (!client) {
      return (
        <>
          <PageHeader title="Booking Saya" />
          <Card className="p-12 text-center border-border shadow-soft">
            <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Data klien tidak ditemukan.</p>
          </Card>
        </>
      );
    }

    if (!client.packageId) {
      return (
        <>
          <PageHeader title="Booking Saya" />
          <Card className="p-12 text-center border-border shadow-soft">
            <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Belum memilih paket. Silakan pilih paket terlebih dahulu.</p>
            <div className="mt-4">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/client/packages">Pilih Paket</Link>
              </Button>
            </div>
          </Card>
        </>
      );
    }

    return (
      <>
        <PageHeader title="Buat Booking" subtitle="Isi preferensi Anda. Vendor final akan dipilih oleh tim WO saat review." />

        <Card className="p-6 border-border shadow-soft space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Paket</div>
            <div className="font-display text-2xl mt-1">{pkg?.name || "-"}</div>
            <div className="text-sm text-muted-foreground">{formatIDR(pkg?.price || 0)}</div>
          </div>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const next: Record<string, string> = {};
              if (!form.eventDate) next.eventDate = "Tanggal acara wajib diisi";
              if (!form.venue) next.venue = "Lokasi acara wajib diisi";
              if (form.adatId === sentinelNone) next.adatId = "Adat/konsep wajib dipilih";
              setErrors(next);
              if (Object.keys(next).length) {
                toast.error("Lengkapi field yang wajib diisi");
                return;
              }

              try {
                setSaving(true);
                const pickedAddons = Object.entries(form.addonsQty || {})
                  .map(([addonId, qty]) => ({ addonId, qty: Math.max(0, Math.floor(Number(qty || 0))) }))
                  .filter((x) => x.addonId && x.qty > 0);
                await store.addBooking({
                  clientId: client.id,
                  packageId: client.packageId,
                  eventDate: form.eventDate,
                  venue: form.venue,
                  guests: form.guests,
                  status: "Pending",
                  eventStatus: "draft",
                  reviewStatus: "menunggu_review",
                  adatId: form.adatId === sentinelNone ? undefined : form.adatId,
                  note: form.note || undefined,
                  vendorSelectedIds: [],
                  addons: pickedAddons,
                });
                clearBookingDraft(cId);
                toast.success("Booking berhasil dikirim. Menunggu review WO.");
              } catch (err: any) {
                toast.error(err?.message || "Gagal membuat booking");
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tanggal Acara</Label>
                <Input type="date" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} />
                {errors.eventDate ? <div className="text-xs text-destructive">{errors.eventDate}</div> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah Tamu (Opsional)</Label>
                <Input type="number" value={form.guests || ""} onChange={(e) => setForm((f) => ({ ...f, guests: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Lokasi Acara</Label>
              <Input value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} placeholder="Gedung/Alamat acara" />
              {errors.venue ? <div className="text-xs text-destructive">{errors.venue}</div> : null}
            </div>

            <div className="space-y-2">
              <Label>Add-ons (Opsional)</Label>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground">
                  Harga paket adalah estimasi “mulai dari”. Harga final akan direview WO sebelum approval.
                </div>
                <div className="p-3 space-y-2">
                  {addons.filter((a) => a.status === "aktif").length === 0 ? (
                    <div className="text-sm text-muted-foreground">Belum ada master add-ons aktif.</div>
                  ) : (
                    addons
                      .filter((a) => a.status === "aktif")
                      .map((a) => {
                        const qty = Number(form.addonsQty?.[a.id] || 0);
                        return (
                          <div key={a.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-md border border-border px-3 py-2">
                            <div className="sm:col-span-7 min-w-0">
                              <div className="text-sm font-medium truncate">{a.nama_addon}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {a.kategori_addon ? `${a.kategori_addon} · ` : ""}Default: {formatIDR(a.harga_satuan_default || 0)}
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <Input
                                type="number"
                                min={0}
                                value={qty || ""}
                                onChange={(e) => {
                                  const nextQty = Math.max(0, Math.floor(Number(e.target.value || 0)));
                                  setForm((f) => ({
                                    ...f,
                                    addonsQty: { ...(f.addonsQty || {}), [a.id]: nextQty },
                                  }));
                                }}
                                placeholder="Qty"
                              />
                            </div>
                            <div className="sm:col-span-2 text-right text-sm font-medium text-primary">
                              {formatIDR((a.harga_satuan_default || 0) * (qty || 0))}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Adat / Konsep</Label>
              <Select value={form.adatId} onValueChange={(v) => setForm((f) => ({ ...f, adatId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih adat/konsep" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={sentinelNone} disabled>Pilih adat/konsep</SelectItem>
                  {adat.filter((a) => a.status === "aktif").map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.nama_adat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.adatId ? <div className="text-xs text-destructive">{errors.adatId}</div> : null}
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/10">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Katalog Inspirasi</div>
                  <div className="text-sm text-muted-foreground">
                    Baju/dekorasi/makeup tidak dipilih sebagai final di booking. Silakan tandai favorit dari katalog untuk referensi tim WO.
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={() => nav("/client/favorites")}>
                  Favorit Saya
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Catatan untuk WO (Opsional)</Label>
              <Textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Request/notes khusus..." />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearBookingDraft(cId);
                  setForm({
                    eventDate: "",
                    venue: "",
                    guests: 0,
                    adatId: sentinelNone,
                    note: "",
                    addonsQty: {},
                  });
                  toast.success("Draft booking dikosongkan");
                }}
              >
                Clear Draft
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                {saving ? "Mengirim..." : "Kirim Booking"}
              </Button>
            </div>
          </form>
        </Card>

        {historyBookings.length > 0 ? (
          <Card className="p-6 border-border shadow-soft mt-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">Riwayat Booking</div>
                <div className="text-sm text-muted-foreground">Booking yang sudah selesai/dibatalkan/ditolak.</div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/client/history-bookings">Lihat Semua</Link>
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {historyBookings.slice(0, 3).map((b) => (
                <div key={b.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Kode Booking</div>
                    <div className="font-display text-xl mt-1">{String(b.code || b.id).toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(b.eventDate)} · {b.packageSnapshot?.name || "-"} · {statusLabel(b.statusBooking || "")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Booking Saya"
        subtitle={`${(activeBooking.code || activeBooking.id).toUpperCase()} · ${statusLabel(activeBooking.statusBooking || "menunggu_review")}`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/client/references">Upload Referensi</Link>
            </Button>
            {["draft", "menunggu_review"].includes(String(activeBooking.statusBooking || "")) ? (
              <ConfirmActionDialog
                title="Batalkan booking?"
                description="Booking akan dibatalkan. Anda bisa membuat booking baru setelahnya."
                confirmText="Batalkan"
                onConfirm={async () => {
                  try {
                    await store.updateBookingStatus(activeBooking.id, "cancelled");
                    toast.success("Booking berhasil dibatalkan");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal membatalkan booking");
                  }
                }}
                trigger={<Button variant="destructive">Batalkan Booking</Button>}
              />
            ) : null}
          </div>
        }
      />

      <Card className="p-8 border-border shadow-elegant bg-gradient-card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Pernikahan</div>
            <h2 className="font-display text-3xl mt-1">{activeBooking.clientName || client?.name} </h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={activeBooking.statusBooking || "menunggu_review"} />
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs bg-background">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" /> {statusLabel(activeBooking.statusBooking || "menunggu_review")}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><CalendarDays className="w-3.5 h-3.5" /> Tanggal</div>
            <div className="font-display text-lg mt-1">{formatDate(activeBooking.eventDate)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Lokasi</div>
            <div className="font-display text-lg mt-1">{activeBooking.venue}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><UsersIcon className="w-3.5 h-3.5" /> Tamu</div>
            <div className="font-display text-lg mt-1">{activeBooking.guests || 0} orang</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border shadow-soft">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Paket Terpilih</div>
        <h3 className="font-display text-2xl mt-1">{activeBooking.packageSnapshot?.name || pkg?.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{activeBooking.packageSnapshot?.tagline || pkg?.tagline}</p>

        <ul className="mt-5 grid sm:grid-cols-2 gap-2">
          {(activeBooking.packageSnapshot?.features || pkg?.features || []).map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Heart className="w-3.5 h-3.5 text-primary fill-primary mt-1 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Favorit katalog tidak ditampilkan di card booking */}

      {historyBookings.length > 0 ? (
        <Card className="p-6 border-border shadow-soft mt-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-medium">Riwayat Booking</div>
              <div className="text-sm text-muted-foreground">Booking yang sudah selesai/dibatalkan/ditolak.</div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/client/history-bookings">Lihat Semua</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {historyBookings.slice(0, 3).map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Kode Booking</div>
                  <div className="font-display text-xl mt-1">{String(b.code || b.id).toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatDate(b.eventDate)} · {b.packageSnapshot?.name || "-"} · {statusLabel(b.statusBooking || "")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </>
  );
};

export default ClientBooking;
