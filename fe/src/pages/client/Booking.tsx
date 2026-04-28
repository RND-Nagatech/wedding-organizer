import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatIDR } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarDays, MapPin, Users as UsersIcon, Heart, ExternalLink, BadgeCheck } from "lucide-react";
import { store, useAdat, useBookings, useClients, useKatalogBaju, useKatalogDekorasi, useKatalogMakeup, usePackages } from "@/lib/dataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { clearBookingDraft, readBookingDraft } from "@/lib/bookingDraft";
import { statusLabel } from "@/lib/labels";

const sentinelNone = "__none__";

const ClientBooking = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  const cId = user?.clientId || "";
  const clients = useClients();
  const bookings = useBookings();
  const packages = usePackages();
  const adat = useAdat();
  const katalogBaju = useKatalogBaju();
  const katalogDekorasi = useKatalogDekorasi();
  const katalogMakeup = useKatalogMakeup();

  const client = clients.find((c) => c.id === cId);
  const booking = bookings.find((b) => b.clientId === cId);
  const pkg = packages.find((p) => p.id === client?.packageId);

  const draft = useMemo(() => readBookingDraft(), []);

  const [form, setForm] = useState({
    eventDate: "",
    venue: "",
    guests: 0,
    adatId: sentinelNone,
    note: "",
    bajuId: sentinelNone,
    dekorasiId: sentinelNone,
    makeupId: sentinelNone,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!client || booking) return;
    setForm((f) => ({
      ...f,
      eventDate: client.weddingDate || "",
      bajuId: draft.bajuId || sentinelNone,
      dekorasiId: draft.dekorasiId || sentinelNone,
      makeupId: draft.makeupId || sentinelNone,
    }));
  }, [client, booking, draft.bajuId, draft.dekorasiId, draft.makeupId]);

  const selectedBaju = katalogBaju.find((x) => x.id === form.bajuId);
  const selectedDekorasi = katalogDekorasi.find((x) => x.id === form.dekorasiId);
  const selectedMakeup = katalogMakeup.find((x) => x.id === form.makeupId);
  const viewSelectedBaju = booking?.preferensiKatalog?.bajuId ? katalogBaju.find((x) => x.id === booking.preferensiKatalog?.bajuId) : undefined;
  const viewSelectedDekorasi = booking?.preferensiKatalog?.dekorasiId ? katalogDekorasi.find((x) => x.id === booking.preferensiKatalog?.dekorasiId) : undefined;
  const viewSelectedMakeup = booking?.preferensiKatalog?.makeupId ? katalogMakeup.find((x) => x.id === booking.preferensiKatalog?.makeupId) : undefined;

  if (!booking) {
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
                  preferensiKatalog: {
                    bajuId: form.bajuId === sentinelNone ? undefined : form.bajuId,
                    dekorasiId: form.dekorasiId === sentinelNone ? undefined : form.dekorasiId,
                    makeupId: form.makeupId === sentinelNone ? undefined : form.makeupId,
                  },
                });
                clearBookingDraft();
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

            <Card className="p-4 border-border shadow-soft space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Preferensi Katalog</div>
                  <div className="text-sm text-muted-foreground">Pilih jika ada yang cocok. Anda bisa lihat katalog dulu.</div>
                </div>
                <Button type="button" variant="outline" onClick={() => {
                  setForm((f) => ({ ...f, bajuId: sentinelNone, dekorasiId: sentinelNone, makeupId: sentinelNone }));
                  clearBookingDraft();
                  toast.success("Preferensi katalog dikosongkan");
                }}>
                  Reset
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Baju</Label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => nav("/client/catalog-baju")}>
                      Lihat <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                  <Select value={form.bajuId} onValueChange={(v) => setForm((f) => ({ ...f, bajuId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih baju (opsional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={sentinelNone}>—</SelectItem>
                      {katalogBaju
                        .filter((x) => (x.status || "tersedia") === "tersedia")
                        .map((x) => (
                          <SelectItem key={x.id} value={x.id}>{x.nama_baju}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Dekorasi</Label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => nav("/client/catalog-dekorasi")}>
                      Lihat <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                  <Select value={form.dekorasiId} onValueChange={(v) => setForm((f) => ({ ...f, dekorasiId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih dekorasi (opsional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={sentinelNone}>—</SelectItem>
                      {katalogDekorasi
                        .filter((x) => (x.status || "aktif") === "aktif")
                        .map((x) => (
                          <SelectItem key={x.id} value={x.id}>{x.nama_dekorasi}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Makeup</Label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => nav("/client/catalog-makeup")}>
                      Lihat <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                  <Select value={form.makeupId} onValueChange={(v) => setForm((f) => ({ ...f, makeupId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih makeup (opsional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={sentinelNone}>—</SelectItem>
                      {katalogMakeup
                        .filter((x) => (x.status || "aktif") === "aktif")
                        .map((x) => (
                          <SelectItem key={x.id} value={x.id}>{x.nama_style}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <div className="space-y-1.5">
              <Label>Catatan untuk WO (Opsional)</Label>
              <Textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Request/notes khusus..." />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                {saving ? "Mengirim..." : "Kirim Booking"}
              </Button>
            </div>
          </form>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Booking Saya"
        subtitle={`${(booking.code || booking.id).toUpperCase()} · ${statusLabel(booking.reviewStatus || "menunggu_review")}`}
        actions={
          <Button asChild variant="outline">
            <Link to="/client/references">Upload Referensi</Link>
          </Button>
        }
      />

      <Card className="p-8 border-border shadow-elegant bg-gradient-card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Pernikahan</div>
            <h2 className="font-display text-3xl mt-1">{booking.clientName || client?.name} </h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.eventStatus || "draft"} />
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs bg-background">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" /> {statusLabel(booking.reviewStatus || "menunggu_review")}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><CalendarDays className="w-3.5 h-3.5" /> Tanggal</div>
            <div className="font-display text-lg mt-1">{formatDate(booking.eventDate)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Lokasi</div>
            <div className="font-display text-lg mt-1">{booking.venue}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><UsersIcon className="w-3.5 h-3.5" /> Tamu</div>
            <div className="font-display text-lg mt-1">{booking.guests || 0} orang</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border shadow-soft">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Paket Terpilih</div>
        <h3 className="font-display text-2xl mt-1">{booking.packageSnapshot?.name || pkg?.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{booking.packageSnapshot?.tagline || pkg?.tagline}</p>

        <ul className="mt-5 grid sm:grid-cols-2 gap-2">
          {(booking.packageSnapshot?.features || pkg?.features || []).map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Heart className="w-3.5 h-3.5 text-primary fill-primary mt-1 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 border-border shadow-soft mt-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Preferensi Katalog</div>
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg border border-border">
            <div className="text-xs text-muted-foreground">Baju</div>
            <div className="font-medium mt-1">{viewSelectedBaju?.nama_baju || "—"}</div>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="text-xs text-muted-foreground">Dekorasi</div>
            <div className="font-medium mt-1">{viewSelectedDekorasi?.nama_dekorasi || "—"}</div>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="text-xs text-muted-foreground">Makeup</div>
            <div className="font-medium mt-1">{viewSelectedMakeup?.nama_style || "—"}</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-3">
          Vendor final akan ditentukan oleh tim WO berdasarkan paket dan ketersediaan tanggal acara.
        </div>
      </Card>
    </>
  );
};

export default ClientBooking;
