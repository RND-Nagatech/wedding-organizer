import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatIDR } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarDays, MapPin, Users as UsersIcon, Heart } from "lucide-react";
import { store, useBookings, useClients, usePackages, useVendors } from "@/lib/dataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { ambilVendorAvailable } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ClientBooking = () => {
  const { user } = useAuth();
  const cId = user?.clientId || "";
  const clients = useClients();
  const bookings = useBookings();
  const packages = usePackages();
  const vendors = useVendors();

  const client = clients.find((c) => c.id === cId);
  const booking = bookings.find((b) => b.clientId === cId);
  const pkg = packages.find((p) => p.id === client?.packageId);

  const [form, setForm] = useState({
    eventDate: "",
    venue: "",
    guests: 0,
    vendorSelectedIds: [] as string[],
  });
  const [vendorsAvailable, setVendorsAvailable] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!client || booking) return;
    setForm((f) => ({
      ...f,
      eventDate: client.weddingDate || "",
    }));
  }, [client, booking]);

  useEffect(() => {
    if (!client || booking) return;
    if (!client.packageId || !form.eventDate) {
      setVendorsAvailable([]);
      return;
    }
    (async () => {
      try {
        setLoadingVendors(true);
        const data = await ambilVendorAvailable({ package_id: client.packageId, tanggal_acara: form.eventDate });
        setVendorsAvailable(data);
        setForm((f) => ({
          ...f,
          vendorSelectedIds: f.vendorSelectedIds.filter((id) => data.some((v: any) => v._id === id)),
        }));
      } catch {
        setVendorsAvailable([]);
      } finally {
        setLoadingVendors(false);
      }
    })();
  }, [client, booking, form.eventDate]);

  const allowedVendorIds = pkg?.vendorIds || [];
  const selectedVendors = vendors.filter((v) => (booking?.vendorSelectedIds || form.vendorSelectedIds).includes(v.id));

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
        <PageHeader title="Booking Saya" subtitle="Pilih vendor yang tersedia lalu buat booking" />

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
              if (!form.eventDate) next.eventDate = "Tanggal event wajib diisi";
              if (!form.venue) next.venue = "Venue wajib diisi";
              if (vendorsAvailable.length > 0 && form.vendorSelectedIds.length === 0) next.vendorSelectedIds = "Pilih minimal 1 vendor";
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
                  vendorSelectedIds: form.vendorSelectedIds,
                });
                toast.success("Booking berhasil dibuat");
              } catch (err: any) {
                toast.error(err?.message || "Gagal membuat booking");
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tanggal Event</Label>
                <Input type="date" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} />
                {errors.eventDate ? <div className="text-xs text-destructive">{errors.eventDate}</div> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah Tamu</Label>
                <Input type="number" value={form.guests || ""} onChange={(e) => setForm((f) => ({ ...f, guests: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} placeholder="Grand Ballroom" />
              {errors.venue ? <div className="text-xs text-destructive">{errors.venue}</div> : null}
            </div>

            <div className="space-y-2">
              <Label>Vendor Available (sesuai paket)</Label>
              <div className="max-h-56 overflow-auto rounded-md border border-border p-3 space-y-2">
                {!form.eventDate ? (
                  <div className="text-sm text-muted-foreground">Pilih tanggal event untuk melihat vendor available.</div>
                ) : loadingVendors ? (
                  <div className="text-sm text-muted-foreground">Memuat vendor...</div>
                ) : vendorsAvailable.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Tidak ada vendor available untuk tanggal ini.</div>
                ) : (
                  vendorsAvailable.map((v: any) => {
                    const checked = form.vendorSelectedIds.includes(v._id);
                    return (
                      <label key={v._id} className="flex items-center gap-3 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) => {
                            const next = Boolean(val);
                            setForm((f) => ({
                              ...f,
                              vendorSelectedIds: next
                                ? Array.from(new Set([...f.vendorSelectedIds, v._id]))
                                : f.vendorSelectedIds.filter((x) => x !== v._id),
                            }));
                          }}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="font-medium">{v.nama_vendor}</span>{" "}
                          <span className="text-muted-foreground">· {v.kategori_vendor_nama || v.kategori_vendor_id?.nama_kategori || "-"}</span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {errors.vendorSelectedIds ? <div className="text-xs text-destructive">{errors.vendorSelectedIds}</div> : null}
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                {saving ? "Menyimpan..." : "Buat Booking"}
              </Button>
            </div>
          </form>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Booking Saya" subtitle={`Konfirmasi: ${(booking.code || booking.id).toUpperCase()}`} />

      <Card className="p-8 border-border shadow-elegant bg-gradient-card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Pernikahan</div>
            <h2 className="font-display text-3xl mt-1">{client?.name} & {client?.partner}</h2>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><CalendarDays className="w-3.5 h-3.5" /> Tanggal</div>
            <div className="font-display text-lg mt-1">{formatDate(booking.eventDate)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Venue</div>
            <div className="font-display text-lg mt-1">{booking.venue}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><UsersIcon className="w-3.5 h-3.5" /> Tamu</div>
            <div className="font-display text-lg mt-1">{booking.guests} orang</div>
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
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Vendor Dipilih</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
          {selectedVendors.map((v) => (
            <div key={v.id} className="p-3 rounded-lg border border-border">
              <div className="font-medium">{v.name}</div>
              <div className="text-xs text-muted-foreground">{v.category}</div>
              <div className="text-xs text-muted-foreground mt-1">{v.priceRange}</div>
            </div>
          ))}
          {selectedVendors.length === 0 ? (
            <div className="text-muted-foreground">—</div>
          ) : null}
        </div>
      </Card>
    </>
  );
};

export default ClientBooking;
