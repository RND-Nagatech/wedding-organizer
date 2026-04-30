import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { store, useBookings, useWishlistClient, type ClientWishlist } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { statusLabel } from "@/lib/labels";
import { BookingSelect } from "@/components/BookingSelect";

const kategoriOptions: ClientWishlist["kategori"][] = ["baju", "dekorasi", "makeup", "aksesori", "rundown", "makanan", "lainnya"];
const prioritasOptions: ClientWishlist["prioritas"][] = ["rendah", "sedang", "tinggi"];
const statusOptions: ClientWishlist["status"][] = ["baru", "proses", "selesai", "tidak bisa"];

function WishlistFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: ClientWishlist;
  trigger: React.ReactNode;
}) {
  const bookings = useBookings();
  const bookingOptions = useMemo(
    () =>
      bookings
        .map((b) => {
          const date = String(b.eventDate || "");
          const clientName = String(b.clientName || "—");
          const code = String(b.code || "");
          return {
            code,
            label: `${code.toUpperCase()} · ${clientName} · ${date}`,
            searchText: `${code} ${clientName} ${date}`,
          };
        })
        .filter((x) => x.code),
    [bookings]
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    kategori: "rundown",
    permintaan: "",
    prioritas: "sedang",
    pic: "",
    status: "baru",
    catatan_wo: "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      kode_booking: initial?.kode_booking ?? "",
      kategori: initial?.kategori ?? "rundown",
      permintaan: initial?.permintaan ?? "",
      prioritas: initial?.prioritas ?? "sedang",
      pic: initial?.pic ?? "",
      status: initial?.status ?? "baru",
      catatan_wo: initial?.catatan_wo ?? "",
    });
  }, [open, initial, bookingOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib diisi";
    if (!form.kategori) next.kategori = "Kategori wajib dipilih";
    if (!form.permintaan) next.permintaan = "Permintaan wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        kode_booking: form.kode_booking,
        kategori: form.kategori,
        permintaan: form.permintaan,
        prioritas: form.prioritas,
        pic: form.pic || undefined,
        status: form.status,
        catatan_wo: form.catatan_wo || undefined,
      };
      if (mode === "add") {
        await store.addWishlistClient(payload);
        toast.success("Wishlist berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateWishlistClient(initial.id, payload);
        toast.success("Wishlist berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan data");
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
            {mode === "add" ? "Tambah Wishlist Client" : "Edit Wishlist Client"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <BookingSelect
                value={form.kode_booking}
                onValueChange={(v) => setForm((f: any) => ({ ...f, kode_booking: v }))}
                options={bookingOptions as any}
                placeholder="Pilih Booking"
              />
              {errors.kode_booking ? <div className="text-xs text-destructive">{errors.kode_booking}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm((f: any) => ({ ...f, kategori: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kategori ? <div className="text-xs text-destructive">{errors.kategori}</div> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Permintaan</Label>
            <Textarea value={form.permintaan} onChange={(e) => setForm((f: any) => ({ ...f, permintaan: e.target.value }))} disabled={saving} />
            {errors.permintaan ? <div className="text-xs text-destructive">{errors.permintaan}</div> : null}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select value={form.prioritas} onValueChange={(v) => setForm((f: any) => ({ ...f, prioritas: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {prioritasOptions.map((p) => (
                    <SelectItem key={p} value={p}>{statusLabel(String(p))}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>PIC (Opsional)</Label>
              <Input value={form.pic} onChange={(e) => setForm((f: any) => ({ ...f, pic: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Catatan WO (Opsional)</Label>
            <Textarea value={form.catatan_wo} onChange={(e) => setForm((f: any) => ({ ...f, catatan_wo: e.target.value }))} disabled={saving} />
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

const ClientWishlistPage = () => {
  const list = useWishlistClient();
  const bookings = useBookings();

  const [kodeBooking, setKodeBooking] = useState<string>("all");
  const [kategori, setKategori] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [prioritas, setPrioritas] = useState<string>("all");
  const [q, setQ] = useState("");

  const bookingOptions = useMemo(
    () => bookings.map((b) => ({ code: b.code || "", label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"}` })).filter((x) => x.code),
    [bookings]
  );


  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = list.filter((r) => {
    if (kodeBooking !== "all" && r.kode_booking !== kodeBooking) return false;
    if (kategori !== "all" && r.kategori !== kategori) return false;
    if (status !== "all" && r.status !== status) return false;
    if (prioritas !== "all" && r.prioritas !== prioritas) return false;
    if (q) {
      const hay = `${r.permintaan || ""} ${r.catatan_wo || ""} ${r.pic || ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page ke 1 jika filter berubah
  useEffect(() => { setPage(1); }, [kodeBooking, kategori, status, prioritas, q, perPage]);

  return (
    <>
      <PageHeader
        title="Wishlist Client"
        subtitle={`${list.length} item wishlist`}
        actions={
          <WishlistFormDialog
            mode="add"
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah
              </Button>
            }
          />
        }
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid sm:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <Select value={kodeBooking} onValueChange={setKodeBooking}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {bookingOptions.map((b) => (
                    <SelectItem key={b.code} value={b.code}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {kategoriOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select value={prioritas} onValueChange={setPrioritas}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {prioritasOptions.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Permintaan / catatan..." />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permintaan</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{(r.kode_booking || "—").toUpperCase()}</TableCell>
                  <TableCell>{r.kategori}</TableCell>
                  <TableCell className="capitalize">{r.prioritas}</TableCell>
                  <TableCell>{statusLabel(String(r.status || ""))}</TableCell>
                  <TableCell className="max-w-[420px] truncate">{r.permintaan}</TableCell>
                  <TableCell>{r.pic || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <WishlistFormDialog
                        mode="edit"
                        initial={r}
                        trigger={
                          <Button size="icon" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus wishlist?"
                        description="Data wishlist client akan dihapus permanen."
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteWishlistClient(r.id);
                            toast.success("Wishlist berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus wishlist");
                          }
                        }}
                        trigger={
                          <Button size="icon" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 pt-0">
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
      </Card>
    </>
  );
};

export default ClientWishlistPage;
