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
import { store, useAdat, useKatalogBaju, type CatalogBaju } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { uploadGambar } from "@/lib/api";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

function CatalogBajuFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: CatalogBaju;
  trigger: React.ReactNode;
}) {
  const adat = useAdat();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    nama_baju: "",
    kategori: "akad",
    adat_id: "",
    model: "",
    warna: "",
    ukuran: "",
    foto: "",
    status: "tersedia",
    catatan: "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      nama_baju: initial?.nama_baju ?? "",
      kategori: initial?.kategori ?? "akad",
      adat_id: initial?.adat_id ?? (adat[0]?.id ?? ""),
      model: initial?.model ?? "",
      warna: initial?.warna ?? "",
      ukuran: initial?.ukuran ?? "",
      foto: initial?.foto ?? "",
      status: initial?.status ?? "tersedia",
      catatan: initial?.catatan ?? "",
    });
  }, [open, initial, adat]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.nama_baju) next.nama_baju = "Nama baju wajib diisi";
    if (!form.kategori) next.kategori = "Kategori wajib diisi";
    if (!form.adat_id) next.adat_id = "Adat wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        nama_baju: form.nama_baju,
        kategori: form.kategori,
        adat_id: form.adat_id,
        model: form.model,
        warna: form.warna,
        ukuran: form.ukuran,
        foto: form.foto,
        status: form.status,
        catatan: form.catatan,
      };
      if (mode === "add") {
        await store.addKatalogBaju(payload);
        toast.success("Katalog baju berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateKatalogBaju(initial.id, payload);
        toast.success("Katalog baju berhasil diperbarui");
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
            {mode === "add" ? "Tambah Katalog Baju" : "Edit Katalog Baju"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Baju</Label>
              <Input value={form.nama_baju} onChange={(e) => setForm((f: any) => ({ ...f, nama_baju: e.target.value }))} disabled={saving} />
              {errors.nama_baju ? <div className="text-xs text-destructive">{errors.nama_baju}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tersedia">Tersedia</SelectItem>
                  <SelectItem value="tidak tersedia">Tidak tersedia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm((f: any) => ({ ...f, kategori: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="akad">Akad</SelectItem>
                  <SelectItem value="resepsi">Resepsi</SelectItem>
                  <SelectItem value="prewedding">Prewedding</SelectItem>
                </SelectContent>
              </Select>
              {errors.kategori ? <div className="text-xs text-destructive">{errors.kategori}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Adat</Label>
              <Select value={form.adat_id} onValueChange={(v) => setForm((f: any) => ({ ...f, adat_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih adat" /></SelectTrigger>
                <SelectContent>
                  {adat.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nama_adat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.adat_id ? <div className="text-xs text-destructive">{errors.adat_id}</div> : null}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input value={form.model} onChange={(e) => setForm((f: any) => ({ ...f, model: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Warna</Label>
              <Input value={form.warna} onChange={(e) => setForm((f: any) => ({ ...f, warna: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Ukuran</Label>
              <Input value={form.ukuran} onChange={(e) => setForm((f: any) => ({ ...f, ukuran: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Foto</Label>
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
                    setForm((f: any) => ({ ...f, foto: url }));
                    toast.success("Foto berhasil diupload");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal upload foto");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {form.foto ? (
                <div className="mt-2 rounded-md border border-border overflow-hidden">
                  <img src={`${API_ORIGIN}${form.foto}`} alt="Foto baju" className="w-full h-40 object-cover" />
                </div>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea value={form.catatan} onChange={(e) => setForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={saving} />
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


const CatalogBajuPage = () => {
  const list = useKatalogBaju();
  const adat = useAdat();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = list.filter((b) => {
    const search = q.toLowerCase();
    return (
      b.nama_baju.toLowerCase().includes(search) ||
      (b.adat_nama || adat.find((a) => a.id === b.adat_id)?.nama_adat || "").toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <PageHeader
        title="Katalog Baju"
        subtitle={`${list.length} item`}
        actions={
          <CatalogBajuFormDialog
            mode="add"
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah
              </Button>
            }
          />
        }
      />

      <div className="mb-4 max-w-sm">
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari baju / adat..." />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Adat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((b) => (
                <TableRow key={b.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {b.foto ? (
                        <img src={`${API_ORIGIN}${b.foto}`} alt={b.nama_baju} className="w-10 h-10 rounded-md object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div>{b.nama_baju}</div>
                        {(b.model || b.warna || b.ukuran) ? (
                          <div className="text-xs text-muted-foreground">
                            {[b.model, b.warna, b.ukuran].filter(Boolean).join(" · ")}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{b.kategori}</TableCell>
                  <TableCell>{b.adat_nama || adat.find((a) => a.id === b.adat_id)?.nama_adat || "—"}</TableCell>
                  <TableCell>{statusLabel(String(b.status || ""))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <CatalogBajuFormDialog
                        mode="edit"
                        initial={b}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus katalog baju?"
                        description={`Data "${b.nama_baju}" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteKatalogBaju(b.id);
                            toast.success("Data berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus data");
                          }
                        }}
                        trigger={
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Belum ada data.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Tampilkan</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
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

export default CatalogBajuPage;
