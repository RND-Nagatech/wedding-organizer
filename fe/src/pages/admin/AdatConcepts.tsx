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
import { store, useAdat, type AdatConcept } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

function AdatFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: AdatConcept;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    nama_adat: "",
    deskripsi: "",
    warna_tema: "",
    referensi_dekorasi: "",
    referensi_baju: "",
    catatan: "",
    status: "aktif",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      nama_adat: initial?.nama_adat ?? "",
      deskripsi: initial?.deskripsi ?? "",
      warna_tema: initial?.warna_tema ?? "",
      referensi_dekorasi: initial?.referensi_dekorasi ?? "",
      referensi_baju: initial?.referensi_baju ?? "",
      catatan: initial?.catatan ?? "",
      status: initial?.status ?? "aktif",
    });
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.nama_adat) next.nama_adat = "Nama adat wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }
    try {
      setSaving(true);
      if (mode === "add") {
        await store.addAdat(form);
        toast.success("Adat/konsep berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateAdat(initial.id, form);
        toast.success("Adat/konsep berhasil diperbarui");
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
            {mode === "add" ? "Tambah Adat / Konsep" : "Edit Adat / Konsep"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Adat</Label>
              <Input value={form.nama_adat} onChange={(e) => setForm((f: any) => ({ ...f, nama_adat: e.target.value }))} disabled={saving} />
              {errors.nama_adat ? <div className="text-xs text-destructive">{errors.nama_adat}</div> : null}
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

          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea value={form.deskripsi} onChange={(e) => setForm((f: any) => ({ ...f, deskripsi: e.target.value }))} disabled={saving} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Warna Tema</Label>
              <Input value={form.warna_tema} onChange={(e) => setForm((f: any) => ({ ...f, warna_tema: e.target.value }))} disabled={saving} placeholder="Cream, Gold, Maroon" />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Input value={form.catatan} onChange={(e) => setForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={saving} placeholder="Catatan khusus" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Referensi Dekorasi</Label>
              <Input value={form.referensi_dekorasi} onChange={(e) => setForm((f: any) => ({ ...f, referensi_dekorasi: e.target.value }))} disabled={saving} placeholder="Link / catatan referensi" />
            </div>
            <div className="space-y-1.5">
              <Label>Referensi Baju</Label>
              <Input value={form.referensi_baju} onChange={(e) => setForm((f: any) => ({ ...f, referensi_baju: e.target.value }))} disabled={saving} placeholder="Link / catatan referensi" />
            </div>
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

const AdatConcepts = () => {
  const adat = useAdat();
  const [q, setQ] = useState("");
  const filtered = adat.filter((a) => a.nama_adat.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Adat / Konsep Pernikahan"
        subtitle={`${adat.length} data`}
        actions={
          <AdatFormDialog
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
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama adat..." />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Warna Tema</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">
                    <div>{a.nama_adat}</div>
                    {a.deskripsi ? <div className="text-xs text-muted-foreground line-clamp-1">{a.deskripsi}</div> : null}
                  </TableCell>
                  <TableCell>{a.warna_tema || "—"}</TableCell>
                  <TableCell className="capitalize">{a.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <AdatFormDialog
                        mode="edit"
                        initial={a}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus data adat?"
                        description={`Data "${a.nama_adat}" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteAdat(a.id);
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Belum ada data.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
};

export default AdatConcepts;

