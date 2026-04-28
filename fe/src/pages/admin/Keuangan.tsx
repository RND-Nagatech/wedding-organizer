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
import { store, useKeuangan, type KeuanganTrx } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate, formatIDR } from "@/lib/mockData";
import { RupiahInput } from "@/components/RupiahInput";

const kategoriOptions: KeuanganTrx["kategori"][] = ["DP", "cicilan", "pelunasan", "vendor", "operasional", "lainnya"];

function KeuanganFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: KeuanganTrx;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    tgl_trx: new Date().toISOString().slice(0, 10),
    kategori: "lainnya",
    keterangan: "",
    jumlah_in: 0,
    jumlah_out: 0,
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      tgl_trx: initial?.tgl_trx ?? new Date().toISOString().slice(0, 10),
      kategori: initial?.kategori ?? "lainnya",
      keterangan: initial?.keterangan ?? "",
      jumlah_in: initial?.jumlah_in ?? 0,
      jumlah_out: initial?.jumlah_out ?? 0,
    });
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.tgl_trx) next.tgl_trx = "Tanggal wajib diisi";
    if (!form.kategori) next.kategori = "Kategori wajib dipilih";
    if ((Number(form.jumlah_in) || 0) <= 0 && (Number(form.jumlah_out) || 0) <= 0) {
      next.jumlah = "Isi jumlah pemasukan atau pengeluaran";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    const payload = {
      tgl_trx: form.tgl_trx,
      kategori: form.kategori,
      keterangan: form.keterangan || undefined,
      jumlah_in: Number(form.jumlah_in) || 0,
      jumlah_out: Number(form.jumlah_out) || 0,
    };

    try {
      setSaving(true);
      if (mode === "add") {
        await store.addKeuangan(payload as any);
        toast.success("Transaksi keuangan berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateKeuangan(initial.id, payload as any);
        toast.success("Transaksi keuangan berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan transaksi");
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
            {mode === "add" ? "Tambah Transaksi Keuangan" : "Edit Transaksi Keuangan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={form.tgl_trx} onChange={(e) => setForm((f: any) => ({ ...f, tgl_trx: e.target.value }))} disabled={saving} />
              {errors.tgl_trx ? <div className="text-xs text-destructive">{errors.tgl_trx}</div> : null}
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
              <Label>Pemasukan</Label>
              <RupiahInput value={Number(form.jumlah_in) || 0} onValueChange={(v) => setForm((f: any) => ({ ...f, jumlah_in: v }))} disabled={saving} placeholder="Rp" />
            </div>
            <div className="space-y-1.5">
              <Label>Pengeluaran</Label>
              <RupiahInput value={Number(form.jumlah_out) || 0} onValueChange={(v) => setForm((f: any) => ({ ...f, jumlah_out: v }))} disabled={saving} placeholder="Rp" />
            </div>
          </div>
          {errors.jumlah ? <div className="text-xs text-destructive">{errors.jumlah}</div> : null}

          <div className="space-y-1.5">
            <Label>Keterangan (Opsional)</Label>
            <Textarea value={form.keterangan} onChange={(e) => setForm((f: any) => ({ ...f, keterangan: e.target.value }))} disabled={saving} />
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

const KeuanganPage = () => {
  const list = useKeuangan();

  const today = new Date().toISOString().slice(0, 10);
  const [tglFrom, setTglFrom] = useState<string>(today);
  const [tglTo, setTglTo] = useState<string>(today);
  const [kategori, setKategori] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return list.filter((r) => {
      if (tglFrom && r.tgl_trx < tglFrom) return false;
      if (tglTo && r.tgl_trx > tglTo) return false;
      if (kategori !== "all" && r.kategori !== kategori) return false;
      if (q) {
        const hay = `${r.no_trx} ${r.keterangan || ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [list, tglFrom, tglTo, kategori, q]);

  const totalIn = filtered.reduce((s, r) => s + (Number(r.jumlah_in) || 0), 0);
  const totalOut = filtered.reduce((s, r) => s + (Number(r.jumlah_out) || 0), 0);

  return (
    <>
      <PageHeader
        title="Keuangan"
        subtitle={`${list.length} transaksi`}
        actions={
          <KeuanganFormDialog
            mode="add"
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah
              </Button>
            }
          />
        }
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Pemasukan</div>
          <div className="font-display text-3xl text-success mt-2">{formatIDR(totalIn)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Pengeluaran</div>
          <div className="font-display text-3xl text-primary mt-2">{formatIDR(totalOut)}</div>
        </Card>
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Dari Tanggal</Label>
              <Input type="date" value={tglFrom} onChange={(e) => setTglFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sampai Tanggal</Label>
              <Input type="date" value={tglTo} onChange={(e) => setTglTo(e.target.value)} />
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
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="No trx / keterangan..." />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No Trx</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">In</TableHead>
                <TableHead className="text-right">Out</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const locked = r.ref_type === "payment";
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.no_trx}</TableCell>
                    <TableCell>{formatDate(r.tgl_trx)}</TableCell>
                    <TableCell>{r.kategori}</TableCell>
                    <TableCell className="max-w-[420px] truncate">{r.keterangan || "—"}</TableCell>
                    <TableCell className="text-right">{formatIDR(Number(r.jumlah_in) || 0)}</TableCell>
                    <TableCell className="text-right">{formatIDR(Number(r.jumlah_out) || 0)}</TableCell>
                    <TableCell className="text-right">
                      {locked ? (
                        <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                          <Lock className="w-4 h-4" /> Auto
                        </div>
                      ) : (
                        <div className="inline-flex gap-2">
                          <KeuanganFormDialog
                            mode="edit"
                            initial={r}
                            trigger={
                              <Button size="icon" variant="outline">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <ConfirmActionDialog
                            title="Hapus transaksi?"
                            description="Transaksi keuangan akan dihapus permanen."
                            confirmText="Hapus"
                            onConfirm={async () => {
                              try {
                                await store.deleteKeuangan(r.id);
                                toast.success("Transaksi berhasil dihapus");
                              } catch (err: any) {
                                toast.error(err?.message || "Gagal menghapus transaksi");
                              }
                            }}
                            trigger={
                              <Button size="icon" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            }
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
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
};

export default KeuanganPage;
