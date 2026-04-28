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
import { store, useBookings, useReferensiClient, type ClientReference } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { uploadGambar } from "@/lib/api";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

const kategoriOptions: ClientReference["kategori"][] = ["baju", "dekorasi", "makeup", "aksesori", "lainnya"];
const statusOptions: ClientReference["status"][] = ["diajukan", "disetujui", "ditolak", "revisi"];

function ReferenceFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: ClientReference;
  trigger: React.ReactNode;
}) {
  const bookings = useBookings();
  const bookingOptions = useMemo(
    () => bookings.map((b) => ({ code: b.code || "", label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"}` })).filter((x) => x.code),
    [bookings]
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    kategori: "baju",
    upload_gambar: "",
    judul_referensi: "",
    catatan_client: "",
    status: "diajukan",
    catatan_staff: "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      kode_booking: initial?.kode_booking ?? (bookingOptions[0]?.code ?? ""),
      kategori: initial?.kategori ?? "baju",
      upload_gambar: initial?.upload_gambar ?? "",
      judul_referensi: initial?.judul_referensi ?? "",
      catatan_client: initial?.catatan_client ?? "",
      status: initial?.status ?? "diajukan",
      catatan_staff: initial?.catatan_staff ?? "",
    });
  }, [open, initial, bookingOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib diisi";
    if (!form.kategori) next.kategori = "Kategori wajib dipilih";
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
        upload_gambar: form.upload_gambar || undefined,
        judul_referensi: form.judul_referensi || undefined,
        catatan_client: form.catatan_client || undefined,
        status: form.status,
        catatan_staff: form.catatan_staff || undefined,
      };
      if (mode === "add") {
        await store.addReferensiClient(payload);
        toast.success("Referensi berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateReferensiClient(initial.id, payload);
        toast.success("Referensi berhasil diperbarui");
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
            {mode === "add" ? "Tambah Referensi Client" : "Edit Referensi Client"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <Select value={form.kode_booking} onValueChange={(v) => setForm((f: any) => ({ ...f, kode_booking: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih booking" /></SelectTrigger>
                <SelectContent>
                  {bookingOptions.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input value={form.judul_referensi} onChange={(e) => setForm((f: any) => ({ ...f, judul_referensi: e.target.value }))} disabled={saving} />
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
          </div>

          <div className="space-y-1.5">
            <Label>Gambar (Opsional)</Label>
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
                  setForm((f: any) => ({ ...f, upload_gambar: url }));
                  toast.success("Gambar berhasil diupload");
                } catch (err: any) {
                  toast.error(err?.message || "Gagal upload gambar");
                } finally {
                  setUploading(false);
                }
              }}
            />
            {form.upload_gambar ? (
              <div className="mt-2 rounded-md border border-border overflow-hidden">
                <img src={`${API_ORIGIN}${form.upload_gambar}`} alt="Referensi" className="w-full h-44 object-cover" />
              </div>
            ) : null}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Catatan Client</Label>
              <Textarea value={form.catatan_client} onChange={(e) => setForm((f: any) => ({ ...f, catatan_client: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan Staff</Label>
              <Textarea value={form.catatan_staff} onChange={(e) => setForm((f: any) => ({ ...f, catatan_staff: e.target.value }))} disabled={saving} />
            </div>
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

const ClientReferencesPage = () => {
  const list = useReferensiClient();
  const bookings = useBookings();

  const [kodeBooking, setKodeBooking] = useState<string>("all");
  const [kategori, setKategori] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
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
    if (q) {
      const hay = `${r.judul_referensi || ""} ${r.catatan_client || ""} ${r.catatan_staff || ""}`.toLowerCase();
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
        title="Referensi Client"
        subtitle={`${list.length} referensi tersimpan`}
        actions={
          <ReferenceFormDialog
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
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Judul / catatan..." />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gambar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{(r.kode_booking || "—").toUpperCase()}</TableCell>
                  <TableCell>{r.kategori}</TableCell>
                  <TableCell>{r.judul_referensi || "—"}</TableCell>
                  <TableCell>{statusLabel(String(r.status || ""))}</TableCell>
                  <TableCell>
                    {r.upload_gambar ? (
                      <a className="inline-flex items-center gap-2 text-primary hover:underline" href={`${API_ORIGIN}${r.upload_gambar}`} target="_blank" rel="noreferrer">
                        <ImageIcon className="w-4 h-4" /> Lihat
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <ReferenceFormDialog
                        mode="edit"
                        initial={r}
                        trigger={
                          <Button size="icon" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus referensi?"
                        description="Data referensi client akan dihapus permanen."
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteReferensiClient(r.id);
                            toast.success("Referensi berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus referensi");
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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

export default ClientReferencesPage;
