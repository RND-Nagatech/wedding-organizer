import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { RupiahInput } from "@/components/RupiahInput";
import { store, useAddons, type Addon } from "@/lib/dataStore";
import { statusLabel } from "@/lib/labels";
import { formatIDR } from "@/lib/mockData";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function AddonFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: Addon;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nama_addon: "",
    kategori_addon: "",
    deskripsi: "",
    satuan: "",
    harga_satuan_default: 0,
    status: "aktif" as "aktif" | "nonaktif",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      nama_addon: initial?.nama_addon || "",
      kategori_addon: initial?.kategori_addon || "",
      deskripsi: initial?.deskripsi || "",
      satuan: initial?.satuan || "",
      harga_satuan_default: Number(initial?.harga_satuan_default) || 0,
      status: initial?.status || "aktif",
    });
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.nama_addon) next.nama_addon = "Nama add-on wajib diisi";
    if (Number(form.harga_satuan_default) < 0) next.harga_satuan_default = "Harga tidak valid";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nama_addon: form.nama_addon,
        kategori_addon: form.kategori_addon || undefined,
        deskripsi: form.deskripsi || undefined,
        satuan: form.satuan || undefined,
        harga_satuan_default: Number(form.harga_satuan_default) || 0,
        status: form.status,
      };
      if (mode === "add") {
        await store.addAddon(payload as any);
        toast.success("Add-on berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateAddon(initial.id, payload as any);
        toast.success("Add-on berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan add-on");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{mode === "add" ? "Tambah Add-on" : "Edit Add-on"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Add-on</Label>
              <Input value={form.nama_addon} onChange={(e) => setForm((f) => ({ ...f, nama_addon: e.target.value }))} disabled={saving} />
              {errors.nama_addon ? <div className="text-xs text-destructive">{errors.nama_addon}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Kategori (Opsional)</Label>
              <Input value={form.kategori_addon} onChange={(e) => setForm((f) => ({ ...f, kategori_addon: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Satuan (Opsional)</Label>
              <Input value={form.satuan} onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))} disabled={saving} placeholder="pcs / set / pax" />
            </div>
            <div className="space-y-1.5">
              <Label>Harga Satuan Default</Label>
              <RupiahInput value={Number(form.harga_satuan_default) || 0} onValueChange={(v) => setForm((f) => ({ ...f, harga_satuan_default: v }))} disabled={saving} placeholder="Rp" />
              {errors.harga_satuan_default ? <div className="text-xs text-destructive">{errors.harga_satuan_default}</div> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi (Opsional)</Label>
            <Textarea value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))} disabled={saving}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
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

export default function Addons() {
  const addons = useAddons();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return addons;
    return addons.filter((a) => {
      const hay = `${a.nama_addon} ${a.kategori_addon || ""} ${a.satuan || ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [addons, q]);

  return (
    <>
      <PageHeader
        title="Master Add-ons"
        subtitle={`${addons.length} add-on`}
        actions={
          <AddonFormDialog
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
          <div className="max-w-sm space-y-1.5">
            <Label>Search</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari add-on / kategori..." />
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <Table className="border border-border">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama Add-on</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Harga Default</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nama_addon}</TableCell>
                  <TableCell>{a.kategori_addon || "—"}</TableCell>
                  <TableCell>{a.satuan || "—"}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{formatIDR(Number(a.harga_satuan_default) || 0)}</TableCell>
                  <TableCell>{statusLabel(String(a.status || ""))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <AddonFormDialog
                        mode="edit"
                        initial={a}
                        trigger={
                          <Button size="icon" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus add-on?"
                        description={`Add-on "${a.nama_addon}" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteAddon(a.id);
                            toast.success("Add-on berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus add-on");
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Tidak ada data
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
