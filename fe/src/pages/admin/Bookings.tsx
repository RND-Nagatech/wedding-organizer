import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/mockData";
import { store, useAdat, useBookings, useClients, usePackages, useVendors } from "@/lib/dataStore";
import { Eye, Trash2 } from "lucide-react";
import { AddBookingEventDialog, BookingEventFormDialog } from "@/components/dialogs/BookingEventFormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { toast } from "sonner";
import { formatIDR } from "@/lib/mockData";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { ambilVendorBooking, updateVendorBooking } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

function BookingDetailDialog({
  kodeBooking,
  pkgName,
  pkgPrice,
  pkgFeatures,
  allowedVendors,
  selectedVendors,
}: {
  kodeBooking: string;
  pkgName: string;
  pkgPrice: number;
  pkgFeatures: string[];
  allowedVendors: any[];
  selectedVendors: any[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !kodeBooking) return;
    (async () => {
      try {
        setLoading(true);
        const data = await ambilVendorBooking({ kode_booking: kodeBooking });
        setRows(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setRows([]);
        toast.error(err?.message || "Gagal mengambil daftar vendor booking");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, kodeBooking]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Detail Paket & Vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Paket</div>
            <div className="font-display text-xl">{pkgName}</div>
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Vendor dalam Paket</div>
              <ul className="space-y-1 text-sm">
                {allowedVendors.map((v) => (
                  <li key={v.id}>
                    <span className="font-medium">{v.name}</span>{" "}
                    <span className="text-muted-foreground">· {v.category}</span>
                  </li>
                ))}
                {allowedVendors.length === 0 ? <li className="text-muted-foreground">—</li> : null}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Vendor Dipilih</div>
              <ul className="space-y-1 text-sm">
                {selectedVendors.map((v) => (
                  <li key={v.id}>
                    <span className="font-medium">{v.name}</span>{" "}
                    <span className="text-muted-foreground">· {v.category}</span>
                  </li>
                ))}
                {selectedVendors.length === 0 ? <li className="text-muted-foreground">—</li> : null}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Vendor Booking</div>
                <div className="text-sm text-muted-foreground">Status vendor per tanggal acara (anti double booking)</div>
              </div>
            </div>

            {loading ? (
              <div className="text-sm text-muted-foreground">Memuat data...</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">Belum ada vendor booking.</div>
            ) : (
              <div className="space-y-2">
                {rows.map((r) => {
                  const id = String(r._id);
                  const saving = savingIds.has(id);
                  const vendorName = r.vendor_id?.nama_vendor || "—";
                  const kategoriName = r.kategori_vendor_id?.nama_kategori || r.vendor_id?.kategori_vendor_nama || "—";
                  return (
                    <div key={id} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between rounded-md border border-border bg-background px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{vendorName}</div>
                        <div className="text-xs text-muted-foreground truncate">{kategoriName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={r.status}
                          onValueChange={async (v) => {
                            try {
                              setSavingIds((s) => new Set([...Array.from(s), id]));
                              const updated = await updateVendorBooking(id, { status: v });
                              setRows((prev) => prev.map((x) => (String(x._id) === id ? { ...x, status: updated.status } : x)));
                              toast.success("Status vendor booking diperbarui");
                            } catch (err: any) {
                              toast.error(err?.message || "Gagal update status");
                            } finally {
                              setSavingIds((s) => {
                                const next = new Set(s);
                                next.delete(id);
                                return next;
                              });
                            }
                          }}
                          disabled={saving}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hold">Hold</SelectItem>
                            <SelectItem value="booked">Booked</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                            <SelectItem value="batal">Batal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Bookings = () => {

  const bookings = useBookings();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const clients = useClients();
  const packages = usePackages();
  const vendors = useVendors();
  const adat = useAdat();

  // Filtering
  const filteredBookings = bookings.filter((b) => {
    const client = clients.find((c) => c.id === b.clientId);
    const pkg = packages.find((p) => p.id === b.packageId);
    const kodeBooking = String(b.code || b.id || "").toLowerCase();
    const namaClient = (b.clientName || (client ? `${client.name} & ${client.partner}` : "")).toLowerCase();
    const tanggalAcara = b.eventDate ? formatDate(b.eventDate).toLowerCase() : "";
    const paket = (b.packageSnapshot?.name || pkg?.name || "").toLowerCase();
    const status = (b.eventStatus || "draft").toLowerCase();
    const q = search.toLowerCase();
    return (
      kodeBooking.includes(q) ||
      namaClient.includes(q) ||
      tanggalAcara.includes(q) ||
      paket.includes(q) ||
      status.includes(q)
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / perPage);
  const pagedBookings = filteredBookings.slice((page - 1) * perPage, page * perPage);

  // Reset page ke 1 jika search/perPage berubah
  useEffect(() => { setPage(1); }, [search, perPage]);

  return (
    <>

      <PageHeader
        title="Booking Event"
        subtitle={`${filteredBookings.length} booking ditemukan`}
        actions={<AddBookingEventDialog />}
      />

      <div className="mb-4 max-w-sm">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari kode booking, nama client, tanggal, paket, status..."
        />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Booking</th>
                <th className="text-left px-5 py-3 font-medium">Kode Client</th>
                <th className="text-left px-5 py-3 font-medium">Nama Client</th>
                <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                <th className="text-left px-5 py-3 font-medium">Lokasi</th>
                <th className="text-left px-5 py-3 font-medium">Paket</th>
                <th className="text-left px-5 py-3 font-medium">Konsep</th>
                <th className="text-left px-5 py-3 font-medium">PIC</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedBookings.map((b) => {
                const client = clients.find((c) => c.id === b.clientId);
                const pkg = packages.find((p) => p.id === b.packageId);
                const adatName = adat.find((a) => a.id === b.adatId)?.nama_adat || "—";
                const pkgName = b.packageSnapshot?.name || pkg?.name || "-";
                const pkgPrice = b.packageSnapshot?.price ?? pkg?.price ?? 0;
                const pkgFeatures = b.packageSnapshot?.features || pkg?.features || [];
                const allowedVendorIds = b.packageSnapshot?.vendorIds || pkg?.vendorIds || [];
                const allowedVendors = vendors.filter((v) => allowedVendorIds.includes(v.id));
                const selectedVendors = vendors.filter((v) => (b.vendorSelectedIds || []).includes(v.id));
                const kodeBooking = String(b.code || "");
                return (
                  <tr key={b.id} className="hover:bg-muted/30 transition-smooth">
                    <td className="px-5 py-4 font-medium">{(b.code || b.id).toUpperCase()}</td>
                    <td className="px-5 py-4">{b.clientCode || client?.code || "—"}</td>
                    <td className="px-5 py-4">
                      <div>{b.clientName || (client ? `${client.name} & ${client.partner}` : "-")}</div>
                    </td>
                    <td className="px-5 py-4">{formatDate(b.eventDate)}</td>
                    <td className="px-5 py-4">{b.venue}</td>
                    <td className="px-5 py-4 text-primary font-medium">{pkgName}</td>
                    <td className="px-5 py-4">{adatName}</td>
                    <td className="px-5 py-4">{b.pic || "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={b.eventStatus || "draft"} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <BookingDetailDialog
                          kodeBooking={kodeBooking}
                          pkgName={pkgName}
                          pkgPrice={pkgPrice}
                          pkgFeatures={pkgFeatures}
                          allowedVendors={allowedVendors}
                          selectedVendors={selectedVendors}
                        />

                        <BookingEventFormDialog
                          mode="edit"
                          initial={b}
                          trigger={
                            <Button size="icon" variant="outline">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          }
                        />

                        <ConfirmActionDialog
                          title="Hapus booking?"
                          description={`Booking ${(b.code || b.id).toUpperCase()} akan dibatalkan/dihapus.`}
                          confirmText="Hapus"
                          onConfirm={async () => {
                            try {
                              await store.deleteEventBooking(b.id);
                              toast.success("Booking berhasil dihapus");
                            } catch (err: any) {
                              toast.error(err?.message || "Gagal menghapus booking");
                            }
                          }}
                          trigger={
                            <Button size="icon" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Tampilkan</span>
          <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">per halaman</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            &lt;
          </Button>
          <span className="text-sm">Halaman {page} dari {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
            &gt;
          </Button>
        </div>
      </div>
    </>
  );
};

export default Bookings;
