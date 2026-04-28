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
import { store, useAdat, useKatalogDekorasi, useVendors, type CatalogDekorasi } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { uploadGambar } from "@/lib/api";
import { formatIDR } from "@/lib/mockData";
import { RupiahInput } from "@/components/RupiahInput";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

function DekorasiFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: CatalogDekorasi;
  trigger: React.ReactNode;
}) {
  const adat = useAdat();
  const vendors = useVendors();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    nama_dekorasi: "",
    tema: "",
    adat_id: "",
    warna_dominan: "",
    vendor_id: "",
    harga: 0,
    foto: "",
    catatan: "",
    status: "aktif",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      nama_dekorasi: initial?.nama_dekorasi ?? "",
      tema: initial?.tema ?? "",
      adat_id: initial?.adat_id ?? (adat[0]?.id ?? ""),
      warna_dominan: initial?.warna_dominan ?? "",
      vendor_id: initial?.vendor_id ?? "",
      harga: initial?.harga ?? 0,
      foto: initial?.foto ?? "",
      catatan: initial?.catatan ?? "",
      status: initial?.status ?? "aktif",
    });
  }, [open, initial, adat]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.nama_dekorasi) next.nama_dekorasi = "Nama dekorasi wajib diisi";
    if (!form.adat_id) next.adat_id = "Adat wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nama_dekorasi: form.nama_dekorasi,
        tema: form.tema,
        adat_id: form.adat_id,
        warna_dominan: form.warna_dominan,
        vendor_id: form.vendor_id || undefined,
        harga: Number(form.harga) || 0,
        foto: form.foto,
        catatan: form.catatan,
        status: form.status,
      };
      if (mode === "add") {
        await store.addKatalogDekorasi(payload);
        toast.success("Katalog dekorasi berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateKatalogDekorasi(initial.id, payload);
        toast.success("Katalog dekorasi berhasil diperbarui");
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
            {mode === "add" ? "Tambah Katalog Dekorasi" : "Edit Katalog Dekorasi"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Dekorasi</Label>
              <Input value={form.nama_dekorasi} onChange={(e) => setForm((f: any) => ({ ...f, nama_dekorasi: e.target.value }))} disabled={saving} />
              {errors.nama_dekorasi ? <div className="text-xs text-destructive">{errors.nama_dekorasi}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tema</Label>
              <Input value={form.tema} onChange={(e) => setForm((f: any) => ({ ...f, tema: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Warna Dominan</Label>
              <Input value={form.warna_dominan} onChange={(e) => setForm((f: any) => ({ ...f, warna_dominan: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
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
            <div className="space-y-1.5">
              <Label>Vendor (Opsional)</Label>
              <Select value={form.vendor_id || "__none__"} onValueChange={(v) => setForm((f: any) => ({ ...f, vendor_id: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih vendor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} · {v.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Harga</Label>
              <RupiahInput value={Number(form.harga) || 0} onValueChange={(v) => setForm((f: any) => ({ ...f, harga: v }))} disabled={saving} placeholder="Rp" />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Input value={form.catatan} onChange={(e) => setForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={saving} />
            </div>
          </div>

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
                <img src={`${API_ORIGIN}${form.foto}`} alt="Foto dekorasi" className="w-full h-44 object-cover" />
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (Detail)</Label>
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


const CatalogDekorasiPage = () => {
  const list = useKatalogDekorasi();
  const adat = useAdat();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = list.filter((d) => {
    const s = q.toLowerCase();
    return (
      d.nama_dekorasi.toLowerCase().includes(s) ||
      (d.adat_nama || adat.find((a) => a.id === d.adat_id)?.nama_adat || "").toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <PageHeader
        title="Katalog Dekorasi"
        subtitle={`${list.length} item`}
        actions={
          <DekorasiFormDialog
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
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari dekorasi / adat..." />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Adat</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {d.foto ? (
                        <img src={`${API_ORIGIN}${d.foto}`} alt={d.nama_dekorasi} className="w-10 h-10 rounded-md object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div>{d.nama_dekorasi}</div>
                        {d.tema ? <div className="text-xs text-muted-foreground">{d.tema}</div> : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{d.adat_nama || adat.find((a) => a.id === d.adat_id)?.nama_adat || "—"}</TableCell>
                  <TableCell>{d.vendor_nama || "—"}</TableCell>
                  <TableCell className="text-right">{formatIDR(d.harga || 0)}</TableCell>
                  <TableCell>{statusLabel(String(d.status || ""))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <DekorasiFormDialog
                        mode="edit"
                        initial={d}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus katalog dekorasi?"
                        description={`Data "${d.nama_dekorasi}" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteKatalogDekorasi(d.id);
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
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

export default CatalogDekorasiPage;
