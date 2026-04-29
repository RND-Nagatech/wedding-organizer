import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { formatDate, formatIDR } from "@/lib/mockData";
import { store, useBookings, usePackages, useVendors, useReferensiClient } from "@/lib/dataStore";
import { ambilFormulirDigitalByBooking, ambilKategoriVendor, ambilVendorAvailableByKategori } from "@/lib/api";
import { toast } from "sonner";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

function ReviewDialog({ bookingId }: { bookingId: string }) {
  const bookings = useBookings();
  const packages = usePackages();
  const vendors = useVendors();
  const references = useReferensiClient();

  const booking = bookings.find((b) => b.id === bookingId);
  const pkg = packages.find((p) => p.id === booking?.packageId);
  const kodeBooking = String(booking?.code || "");

  const [open, setOpen] = useState(false);
  const [kategoriOptions, setKategoriOptions] = useState<any[]>([]);
  const [availableByKategori, setAvailableByKategori] = useState<Record<string, any[]>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formulir, setFormulir] = useState<any>(null);
  const [loadingFormulir, setLoadingFormulir] = useState(false);

  const kategoriRows = useMemo(() => {
    const rows = pkg?.vendorByCategory || [];
    return rows.filter((r) => r.kategoriVendorId);
  }, [pkg?.vendorByCategory]);

  const refsForBooking = useMemo(() => {
    if (!kodeBooking) return [];
    return references.filter((r) => String(r.kode_booking || "").toLowerCase() === kodeBooking.toLowerCase());
  }, [references, kodeBooking]);

  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelectedVendorIds((booking?.vendorSelectedIds || []).map(String));
  }, [open, booking?.vendorSelectedIds]);

  useEffect(() => {
    if (!open) return;
    ambilKategoriVendor()
      .then((data) => setKategoriOptions(Array.isArray(data) ? data : []))
      .catch(() => setKategoriOptions([]));
  }, [open]);

  useEffect(() => {
    if (!open || !booking || !pkg) return;
    if (!booking.eventDate) return;
    (async () => {
      try {
        setLoadingAvail(true);
        const next: Record<string, any[]> = {};
        for (const row of kategoriRows) {
          const kategoriId = String(row.kategoriVendorId);
          if (!kategoriId) continue;
          const data = await ambilVendorAvailableByKategori({
            package_id: pkg.id,
            tanggal_acara: booking.eventDate,
            kategori_vendor_id: kategoriId,
          });
          next[kategoriId] = Array.isArray(data) ? data : [];
        }
        setAvailableByKategori(next);
      } catch (err: any) {
        setAvailableByKategori({});
        toast.error(err?.message || "Gagal mengambil vendor available");
      } finally {
        setLoadingAvail(false);
      }
    })();
  }, [open, booking?.id, booking?.eventDate, pkg?.id, kategoriRows]);

  useEffect(() => {
    if (!open || !kodeBooking) return;
    (async () => {
      try {
        setLoadingFormulir(true);
        const data = await ambilFormulirDigitalByBooking(kodeBooking);
        setFormulir(data || null);
      } catch {
        setFormulir(null);
      } finally {
        setLoadingFormulir(false);
      }
    })();
  }, [open, kodeBooking]);

  if (!booking) return null;

  const pkgName = booking.packageSnapshot?.name || pkg?.name || "-";
  const pkgPrice = booking.packageSnapshot?.price ?? pkg?.price ?? 0;
  const pkgFeatures = booking.packageSnapshot?.features || pkg?.features || [];

  const kategoriName = (kategoriId: string) =>
    kategoriOptions.find((x) => String(x._id) === String(kategoriId))?.nama_kategori || "—";

  const vendorNameFromId = (id: string) => vendors.find((v) => v.id === id)?.name || id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Review Booking</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 border-border shadow-soft space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Booking</div>
              <div className="font-display text-xl">{(booking.code || booking.id).toUpperCase()}</div>
              <div className="text-sm text-muted-foreground">{booking.clientName || "—"}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Tanggal</div>
                <div className="font-medium">{formatDate(booking.eventDate)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="font-medium">{booking.venue || "—"}</div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Paket</div>
              <div className="font-medium text-primary">{pkgName}</div>
              <div className="text-sm text-muted-foreground">{formatIDR(pkgPrice)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Fasilitas</div>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                {pkgFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{f}</span>
                  </li>
                ))}
                {pkgFeatures.length === 0 ? <li className="text-muted-foreground">—</li> : null}
              </ul>
            </div>
          </Card>

          <Card className="p-4 border-border shadow-soft space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Preferensi Katalog</div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">Baju</div>
                <div className="font-medium mt-1">{booking.preferensiKatalogSnapshot?.baju?.nama_baju || "—"}</div>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">Dekorasi</div>
                <div className="font-medium mt-1">{booking.preferensiKatalogSnapshot?.dekorasi?.nama_dekorasi || "—"}</div>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">Makeup</div>
                <div className="font-medium mt-1">{booking.preferensiKatalogSnapshot?.makeup?.nama_style || "—"}</div>
              </div>
            </div>

            {refsForBooking.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Referensi Gambar</div>
                <ul className="space-y-1 text-sm">
                  {refsForBooking.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{r.kategori} · {r.judul_referensi || "—"}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.catatan_client || "—"}</div>
                      </div>
                      {r.upload_gambar ? (
                        <a className="text-primary hover:underline" href={`${API_ORIGIN}${r.upload_gambar}`} target="_blank" rel="noreferrer">
                          Lihat
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Belum ada referensi gambar.</div>
            )}

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Formulir Digital</div>
              {loadingFormulir ? (
                <div className="text-sm text-muted-foreground">Memuat formulir...</div>
              ) : formulir ? (
                <div className="text-sm">
                  <div className="font-medium">{formulir.nama_pengantin_pria || "—"} & {formulir.nama_pengantin_wanita || "—"}</div>
                  <div className="text-xs text-muted-foreground">Tamu: {formulir.jumlah_tamu || "—"} · Warna: {formulir.warna_tema || "—"}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Belum diisi.</div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-4 border-border shadow-soft space-y-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Pilih Vendor Final</div>
            <div className="text-sm text-muted-foreground">Vendor yang tampil sudah difilter: masuk paket + sesuai kategori + available tanggal acara.</div>
          </div>

          {kategoriRows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Paket ini belum memiliki konfigurasi vendor per kategori.</div>
          ) : loadingAvail ? (
            <div className="text-sm text-muted-foreground">Memuat vendor available...</div>
          ) : (
            <div className="space-y-3">
              {kategoriRows.map((row) => {
                const kategoriId = String(row.kategoriVendorId);
                const avail = availableByKategori[kategoriId] || [];
                const allowedIds = new Set((row.vendorIds || []).map(String));
                return (
                  <div key={kategoriId} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="font-medium">{kategoriName(kategoriId)}</div>
                    <div className="max-h-44 overflow-auto rounded-md border border-border p-3 space-y-2">
                      {avail.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Tidak ada vendor available.</div>
                      ) : (
                        avail
                          .filter((v: any) => allowedIds.has(String(v._id)))
                          .map((v: any) => {
                            const id = String(v._id);
                            const checked = selectedVendorIds.includes(id);
                            return (
                              <label key={id} className="flex items-center gap-3 text-sm">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(val) => {
                                    const next = Boolean(val);
                                    setSelectedVendorIds((ids) =>
                                      next ? Array.from(new Set([...ids, id])) : ids.filter((x) => x !== id)
                                    );
                                  }}
                                />
                                <span className="flex-1 min-w-0">
                                  <span className="font-medium">{v.nama_vendor}</span>{" "}
                                  <span className="text-muted-foreground">· {v.kategori_vendor_nama || v.kategori_vendor_id?.nama_kategori || "—"}</span>
                                </span>
                              </label>
                            );
                          })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Terpilih: {selectedVendorIds.length} vendor
            {selectedVendorIds.length > 0 ? ` · ${selectedVendorIds.map(vendorNameFromId).slice(0, 3).join(", ")}${selectedVendorIds.length > 3 ? "..." : ""}` : ""}
          </div>
        </Card>

        <DialogFooter className="gap-2 sm:gap-2">
          <ConfirmActionDialog
            title="Tolak booking?"
            description="Booking akan ditandai rejected."
            confirmText="Tolak"
            onConfirm={async () => {
              try {
                setSaving(true);
                await store.updateEventBooking(booking.id, {
                  clientId: booking.clientId,
                  packageId: booking.packageId,
                  eventDate: booking.eventDate,
                  venue: booking.venue,
                  adatId: booking.adatId,
                  vendorSelectedIds: [],
                });
                await store.updateBookingStatus(booking.id, "rejected");
                toast.success("Booking ditolak");
                setOpen(false);
              } catch (err: any) {
                toast.error(err?.message || "Gagal menolak booking");
              } finally {
                setSaving(false);
              }
            }}
            trigger={
              <Button type="button" variant="destructive" disabled={saving}>
                <XCircle className="w-4 h-4 mr-1.5" /> Tolak
              </Button>
            }
          />

          <Button
            type="button"
            className="bg-primary hover:bg-primary/90"
            disabled={saving}
            onClick={async () => {
              if (kategoriRows.length > 0 && selectedVendorIds.length === 0) {
                toast.error("Pilih minimal 1 vendor final sebelum approve.");
                return;
              }
              try {
                setSaving(true);
                await store.updateEventBooking(booking.id, {
                  clientId: booking.clientId,
                  packageId: booking.packageId,
                  eventDate: booking.eventDate,
                  venue: booking.venue,
                  adatId: booking.adatId,
                  vendorSelectedIds: selectedVendorIds,
                });
                await store.updateBookingStatus(booking.id, "approved");
                toast.success("Booking di-approve dan vendor final tersimpan");
                setOpen(false);
              } catch (err: any) {
                toast.error(err?.message || "Gagal approve booking");
              } finally {
                setSaving(false);
              }
            }}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingReview() {
  const bookings = useBookings();
  const packages = usePackages();

  const rows = useMemo(() => bookings.filter((b) => (b.statusBooking || "menunggu_review") === "menunggu_review"), [bookings]);

  return (
    <>
      <PageHeader title="Review Booking" subtitle={`${rows.length} menunggu review`} />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Booking</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Status Booking</TableHead>
                <TableHead className="text-right w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => {
                const pkg = packages.find((p) => p.id === b.packageId);
                const pkgName = b.packageSnapshot?.name || pkg?.name || "-";
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{(b.code || b.id).toUpperCase()}</TableCell>
                    <TableCell>{b.clientName || "—"}</TableCell>
                    <TableCell>{formatDate(b.eventDate)}</TableCell>
                    <TableCell className="text-primary font-medium">{pkgName}</TableCell>
                    <TableCell>{statusLabel(String(b.statusBooking || "menunggu_review"))}</TableCell>
                    <TableCell className="text-right">
                      <ReviewDialog bookingId={b.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Tidak ada booking yang menunggu review.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
