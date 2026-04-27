import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { tambahKategoriVendor, editKategoriVendor } from "@/lib/api";

export function VendorCategoryFormDialog(props: {
  mode: "add" | "edit";
  initial?: { id: string; kode_kategori: string; nama_kategori: string };
  trigger: React.ReactNode;
  onSaved: () => Promise<void> | void;
}) {
  const { mode, initial, trigger, onSaved } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setKode(initial?.kode_kategori ?? "");
      setNama(initial?.nama_kategori ?? "");
      setErrors({});
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!kode) next.kode = "Kode wajib diisi";
    if (!nama) next.nama = "Nama wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);
      if (mode === "add") {
        await tambahKategoriVendor({ kode_kategori: kode, nama_kategori: nama });
        toast.success("Kategori vendor berhasil ditambahkan");
      } else if (initial?.id) {
        await editKategoriVendor(initial.id, { kode_kategori: kode, nama_kategori: nama });
        toast.success("Kategori vendor berhasil diperbarui");
      }
      await onSaved();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan kategori vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "add" ? "Tambah Kategori Vendor" : "Edit Kategori Vendor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kode</Label>
              <Input value={kode} onChange={(e) => setKode(e.target.value)} disabled={loading} />
              {errors.kode ? <div className="text-xs text-destructive">{errors.kode}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Nama Kategori</Label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} disabled={loading} />
              {errors.nama ? <div className="text-xs text-destructive">{errors.nama}</div> : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

