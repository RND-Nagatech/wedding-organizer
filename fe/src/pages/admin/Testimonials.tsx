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
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ambilTestimoni, editTestimoni, hapusTestimoni, tambahTestimoni, uploadGambar } from "@/lib/api";
import { statusLabel } from "@/lib/labels";

type Testimoni = {
  _id?: string;
  id?: string;
  nama: string;
  jabatan?: string;
  isi_testimoni: string;
  foto?: string;
  status: "aktif" | "nonaktif";
  createdAt?: string;
};

function getId(x: any) {
  return String(x?._id || x?.id || "");
}

const API_ORIGIN = (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api$/, "") : "") || "http://localhost:5001";

function TestimoniFormDialog({
  mode,
  initial,
  onSaved,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: Testimoni;
  onSaved: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    nama: "",
    jabatan: "",
    isi_testimoni: "",
    foto: "",
    status: "aktif",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFile(null);
    setForm({
      nama: initial?.nama ?? "",
      jabatan: initial?.jabatan ?? "",
      isi_testimoni: initial?.isi_testimoni ?? "",
      foto: initial?.foto ?? "",
      status: initial?.status ?? "aktif",
    });
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.nama) next.nama = "Nama wajib diisi";
    if (!form.isi_testimoni) next.isi_testimoni = "Isi testimoni wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }
    try {
      setSaving(true);
      let fotoUrl = String(form.foto || "");
      if (file) {
        const up = await uploadGambar(file);
        fotoUrl = up.url;
      }
      const payload = {
        nama: String(form.nama).trim(),
        jabatan: form.jabatan ? String(form.jabatan).trim() : undefined,
        isi_testimoni: String(form.isi_testimoni).trim(),
        foto: fotoUrl || undefined,
        status: form.status,
      };
      if (mode === "add") {
        await tambahTestimoni(payload);
        toast.success("Testimoni berhasil ditambahkan");
      } else if (initial) {
        await editTestimoni(getId(initial), payload);
        toast.success("Testimoni berhasil diperbarui");
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan testimoni");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{mode === "add" ? "Tambah Testimoni" : "Edit Testimoni"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama</Label>
              <Input value={form.nama} onChange={(e) => setForm((f: any) => ({ ...f, nama: e.target.value }))} disabled={saving} />
              {errors.nama ? <div className="text-xs text-destructive">{errors.nama}</div> : null}
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
            <Label>Jabatan / Keterangan (Opsional)</Label>
            <Input value={form.jabatan} onChange={(e) => setForm((f: any) => ({ ...f, jabatan: e.target.value }))} disabled={saving} placeholder="Contoh: Bride, Desember 2025" />
          </div>

          <div className="space-y-1.5">
            <Label>Isi Testimoni</Label>
            <Textarea value={form.isi_testimoni} onChange={(e) => setForm((f: any) => ({ ...f, isi_testimoni: e.target.value }))} disabled={saving} />
            {errors.isi_testimoni ? <div className="text-xs text-destructive">{errors.isi_testimoni}</div> : null}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Foto (Opsional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={saving} />
              <div className="text-xs text-muted-foreground">Kosongkan jika tidak ingin mengubah foto.</div>
            </div>
            <div className="space-y-1.5">
              <Label>Preview</Label>
              <div className="rounded-lg border border-border bg-muted/20 h-20 overflow-hidden flex items-center justify-center">
                {file ? (
                  <div className="text-xs text-muted-foreground">Foto baru siap diupload</div>
                ) : form.foto ? (
                  <img src={`${API_ORIGIN}${form.foto}`} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-muted-foreground">Tidak ada foto</div>
                )}
              </div>
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

export default function Testimonials() {
  const [rows, setRows] = useState<Testimoni[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await ambilTestimoni();
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setRows([]);
      toast.error(err?.message || "Gagal mengambil data testimoni");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => `${r.nama} ${r.jabatan || ""} ${r.isi_testimoni}`.toLowerCase().includes(s));
  }, [rows, q]);

  return (
    <>
      <PageHeader
        title="Master Testimoni"
        subtitle={`${rows.length} data`}
        actions={
          <TestimoniFormDialog
            mode="add"
            onSaved={load}
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah
              </Button>
            }
          />
        }
      />

      <div className="mb-4 max-w-sm">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari testimoni..." />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={getId(r)} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">
                    <div>{r.nama}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{r.isi_testimoni}</div>
                  </TableCell>
                  <TableCell>{r.jabatan || "—"}</TableCell>
                  <TableCell>{statusLabel(String(r.status || ""))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <TestimoniFormDialog
                        mode="edit"
                        initial={r}
                        onSaved={load}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus testimoni?"
                        description={`Testimoni "${r.nama}" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await hapusTestimoni(getId(r));
                            toast.success("Testimoni berhasil dihapus");
                            await load();
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus testimoni");
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
                    {loading ? "Memuat..." : "Belum ada data."}
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
