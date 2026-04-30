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
import { store, useBookings, useChecklistBarang, type ChecklistBarang } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { uploadGambar } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { BookingSelect } from "@/components/BookingSelect";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

const kategoriOptions: ChecklistBarang["kategori_barang"][] = ["baju", "aksesori", "dekorasi", "dokumen", "lainnya"];
const statusOptions: ChecklistBarang["status"][] = ["belum_siap", "siap", "dibawa", "dikembalikan"];

function ChecklistBarangFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: ChecklistBarang;
  trigger: React.ReactNode;
}) {
  const bookings = useBookings();
  const bookingOptions = useMemo(
    () =>
      bookings
        .map((b) => ({
          code: b.code || "",
          label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"} · ${String(b.eventDate || "")}`,
          searchText: `${b.code || ""} ${b.clientName || ""} ${String(b.eventDate || "")}`,
        }))
        .filter((x) => x.code),
    [bookings]
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    nama_barang: "",
    kategori_barang: "lainnya",
    jumlah: 1,
    untuk_siapa: "",
    pic: "",
    status: "belum_siap",
    foto_barang: "",
    catatan: "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      kode_booking: initial?.kode_booking ?? "",
      nama_barang: initial?.nama_barang ?? "",
      kategori_barang: initial?.kategori_barang ?? "lainnya",
      jumlah: initial?.jumlah ?? 1,
      untuk_siapa: initial?.untuk_siapa ?? "",
      pic: initial?.pic ?? "",
      status: initial?.status ?? "belum_siap",
      foto_barang: initial?.foto_barang ?? "",
      catatan: initial?.catatan ?? "",
    });
  }, [open, initial, bookingOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib diisi";
    if (!form.nama_barang) next.nama_barang = "Nama barang wajib diisi";
    if (!form.kategori_barang) next.kategori_barang = "Kategori barang wajib dipilih";
    if (!form.jumlah || Number(form.jumlah) <= 0) next.jumlah = "Jumlah minimal 1";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        kode_booking: form.kode_booking,
        nama_barang: form.nama_barang,
        kategori_barang: form.kategori_barang,
        jumlah: Number(form.jumlah) || 1,
        untuk_siapa: form.untuk_siapa || undefined,
        pic: form.pic || undefined,
        status: form.status,
        foto_barang: form.foto_barang || undefined,
        catatan: form.catatan || undefined,
      };
      if (mode === "add") {
        await store.addChecklistBarang(payload);
        toast.success("Checklist barang berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateChecklistBarang(initial.id, payload);
        toast.success("Checklist barang berhasil diperbarui");
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
            {mode === "add" ? "Tambah Checklist Barang" : "Edit Checklist Barang"}
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
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Barang</Label>
              <Input value={form.nama_barang} onChange={(e) => setForm((f: any) => ({ ...f, nama_barang: e.target.value }))} disabled={saving} />
              {errors.nama_barang ? <div className="text-xs text-destructive">{errors.nama_barang}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Kategori Barang</Label>
              <Select value={form.kategori_barang} onValueChange={(v) => setForm((f: any) => ({ ...f, kategori_barang: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kategori_barang ? <div className="text-xs text-destructive">{errors.kategori_barang}</div> : null}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Jumlah</Label>
              <Input type="number" value={form.jumlah} onChange={(e) => setForm((f: any) => ({ ...f, jumlah: Number(e.target.value) }))} disabled={saving} />
              {errors.jumlah ? <div className="text-xs text-destructive">{errors.jumlah}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Untuk Siapa (Opsional)</Label>
              <Input value={form.untuk_siapa} onChange={(e) => setForm((f: any) => ({ ...f, untuk_siapa: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>PIC (Opsional)</Label>
              <Input value={form.pic} onChange={(e) => setForm((f: any) => ({ ...f, pic: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Foto Barang (Opsional)</Label>
            <Input
              type="file"
              accept="image/*"
              disabled={saving || uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploading(true);
                  const { url } = await uploadGambar(file);
                  setForm((f: any) => ({ ...f, foto_barang: url }));
                  toast.success("Foto berhasil diupload");
                } catch (err: any) {
                  toast.error(err?.message || "Gagal upload foto");
                } finally {
                  setUploading(false);
                }
              }}
            />
            {form.foto_barang ? (
              <div className="mt-2 rounded-md border border-border overflow-hidden">
                <img src={`${API_ORIGIN}${form.foto_barang}`} alt="Foto barang" className="w-full h-44 object-cover" />
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (Opsional)</Label>
            <Textarea value={form.catatan} onChange={(e) => setForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={saving} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving || uploading}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const ChecklistBarangPage = () => {
  const list = useChecklistBarang();
  const bookings = useBookings();

  const [kodeBooking, setKodeBooking] = useState<string>("all");
  const [kategori, setKategori] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");

  const bookingOptions = useMemo(
    () =>
      bookings
        .map((b) => ({ code: b.code || "", label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"}` }))
        .filter((x) => x.code),
    [bookings]
  );


  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = list.filter((r) => {
    if (kodeBooking !== "all" && r.kode_booking !== kodeBooking) return false;
    if (kategori !== "all" && r.kategori_barang !== kategori) return false;
    if (status !== "all" && r.status !== status) return false;
    if (q) {
      const hay = `${r.nama_barang} ${r.untuk_siapa || ""} ${r.pic || ""} ${r.catatan || ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page ke 1 jika filter berubah
  useEffect(() => { setPage(1); }, [kodeBooking, kategori, status, q, perPage]);

  return (
    <>
      <PageHeader
        title="Checklist Barang / Aksesori"
        subtitle={`${list.length} item`}
        actions={
          <ChecklistBarangFormDialog
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
          <div className="grid sm:grid-cols-4 gap-3">
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
                    <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nama barang / PIC / catatan..." />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Untuk</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{(r.kode_booking || "—").toUpperCase()}</TableCell>
                  <TableCell>{r.nama_barang}</TableCell>
                  <TableCell>{r.kategori_barang}</TableCell>
                  <TableCell>{r.jumlah}</TableCell>
                  <TableCell>{r.untuk_siapa || "—"}</TableCell>
                  <TableCell>{r.pic || "—"}</TableCell>
                  <TableCell className="capitalize">{r.status.replaceAll("_", " ")}</TableCell>
                  <TableCell>
                    {r.foto_barang ? (
                      <a className="inline-flex items-center gap-2 text-primary hover:underline" href={`${API_ORIGIN}${r.foto_barang}`} target="_blank" rel="noreferrer">
                        <ImageIcon className="w-4 h-4" /> Lihat
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <ChecklistBarangFormDialog
                        mode="edit"
                        initial={r}
                        trigger={
                          <Button size="icon" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus item checklist?"
                        description="Data checklist barang akan dihapus permanen."
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteChecklistBarang(r.id);
                            toast.success("Item checklist berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus item checklist");
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
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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

export default ChecklistBarangPage;
