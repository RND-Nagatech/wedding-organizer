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
import { store, useKatalogMakeup, useVendors, type CatalogMakeup } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { uploadGambar } from "@/lib/api";
import { formatIDR } from "@/lib/mockData";
import { RupiahInput } from "@/components/RupiahInput";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const SENTINEL_NONE = "__none__";

function MakeupFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: CatalogMakeup;
  trigger: React.ReactNode;
}) {
  const vendors = useVendors();
  const vendorMuaOptions = useMemo(
    () => vendors.filter((v) => (v.category || "").toLowerCase().includes("mua")),
    [vendors]
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    nama_style: "",
    kategori: SENTINEL_NONE,
    vendor_mua_id: SENTINEL_NONE,
    foto: "",
    harga: 0,
    catatan: "",
    status: "aktif",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      nama_style: initial?.nama_style ?? "",
      kategori: initial?.kategori ?? SENTINEL_NONE,
      vendor_mua_id: initial?.vendor_mua_id ?? SENTINEL_NONE,
      foto: initial?.foto ?? "",
      harga: initial?.harga ?? 0,
      catatan: initial?.catatan ?? "",
      status: initial?.status ?? "aktif",
    });
  }, [open, initial, vendorMuaOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.nama_style) next.nama_style = "Nama style wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nama_style: form.nama_style,
        kategori: form.kategori === SENTINEL_NONE ? undefined : form.kategori,
        vendor_mua_id: form.vendor_mua_id === SENTINEL_NONE ? undefined : form.vendor_mua_id,
        foto: form.foto,
        harga: Number(form.harga) || 0,
        catatan: form.catatan,
        status: form.status,
      };
      if (mode === "add") {
        await store.addKatalogMakeup(payload);
        toast.success("Katalog makeup berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateKatalogMakeup(initial.id, payload);
        toast.success("Katalog makeup berhasil diperbarui");
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "add" ? "Tambah Katalog Makeup" : "Edit Katalog Makeup"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Style</Label>
              <Input value={form.nama_style} onChange={(e) => setForm((f: any) => ({ ...f, nama_style: e.target.value }))} disabled={saving} />
              {errors.nama_style ? <div className="text-xs text-destructive">{errors.nama_style}</div> : null}
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
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm((f: any) => ({ ...f, kategori: v }))}>
                <SelectTrigger><SelectValue placeholder="(Opsional) Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={SENTINEL_NONE}>—</SelectItem>
                  {["natural", "bold", "glam", "adat", "modern"].map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vendor MUA</Label>
              <Select value={form.vendor_mua_id} onValueChange={(v) => setForm((f: any) => ({ ...f, vendor_mua_id: v }))}>
                <SelectTrigger><SelectValue placeholder="(Opsional) Pilih vendor MUA" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={SENTINEL_NONE}>—</SelectItem>
                  {vendorMuaOptions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
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
                <img src={`${API_ORIGIN}${form.foto}`} alt="Foto makeup" className="w-full h-44 object-cover" />
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


const CatalogMakeupPage = () => {
  const list = useKatalogMakeup();
  const vendors = useVendors();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = list.filter((m) => m.nama_style.toLowerCase().includes(q.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <PageHeader
        title="Katalog Makeup"
        subtitle={`${list.length} item`}
        actions={
          <MakeupFormDialog
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
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari nama style..." />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Vendor MUA</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((m) => (
                <TableRow key={m.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {m.foto ? (
                        <img src={`${API_ORIGIN}${m.foto}`} alt={m.nama_style} className="w-10 h-10 rounded-md object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>{m.nama_style}</div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{m.kategori}</TableCell>
                  <TableCell>{m.vendor_mua_nama || vendors.find((v) => v.id === m.vendor_mua_id)?.name || "—"}</TableCell>
                  <TableCell className="text-right">{formatIDR(m.harga || 0)}</TableCell>
                  <TableCell>{statusLabel(String(m.status || ""))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <MakeupFormDialog
                        mode="edit"
                        initial={m}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus katalog makeup?"
                        description={`Data "${m.nama_style}" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteKatalogMakeup(m.id);
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

export default CatalogMakeupPage;
