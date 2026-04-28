import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { store } from "@/lib/dataStore";
import { toast } from "sonner";
import type { Vendor } from "@/lib/mockData";
import { ambilKategoriVendor } from "@/lib/api";

export const VendorFormDialog = ({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: Vendor;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    name: initial?.name ?? "",
    categoryId: initial?.categoryId ?? "",
    // contact: initial?.contact ?? "",
    rating: initial?.rating ?? 4.5,
    priceRange: initial?.priceRange ?? "",
    alamat: initial?.alamat ?? "",
    telepon: initial?.telepon ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      name: initial?.name ?? "",
      categoryId: initial?.categoryId ?? "",
      // contact: initial?.contact ?? "",
      rating: initial?.rating ?? 4.5,
      priceRange: initial?.priceRange ?? "",
      alamat: initial?.alamat ?? "",
      telepon: initial?.telepon ?? "",
    });
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingCats(true);
        const data = await ambilKategoriVendor();
        setCategories(data);
        if (!form.categoryId && data[0]?._id) {
          setForm((f: any) => ({ ...f, categoryId: data[0]._id }));
        }
      } catch {
        // handled on submit
      } finally {
        setLoadingCats(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name) next.name = "Nama wajib diisi";
    if (!form.categoryId) next.categoryId = "Kategori wajib diisi";
    // if (!form.contact) next.contact = "Kontak wajib diisi";
    if (!form.alamat) next.alamat = "Alamat wajib diisi";
    if (!form.telepon) next.telepon = "Telepon wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }
    try {
      if (mode === "add") {
        await store.addVendor(form);
        toast.success("Vendor berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateVendor(initial.id, form);
        toast.success("Vendor berhasil diperbarui");
      }
      setOpen(false);
      if (mode === "add") {
        setForm({ name: "", categoryId: categories[0]?._id ?? "", contact: "", rating: 4.5, priceRange: "", alamat: "", telepon: "" });
      }
    } catch (err) {
      toast.error("Gagal menyimpan vendor ke server");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "add" ? "Tambah Vendor" : "Edit Vendor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Vendor</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name ? <div className="text-xs text-destructive">{errors.name}</div> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.nama_kategori}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.categoryId ? <div className="text-xs text-destructive">{errors.categoryId}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Rating (0-5)</Label>
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </div>
          </div>
          {/*
          <div className="space-y-1.5">
            <Label>Kontak</Label>
            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="0812-xxxx-xxxx" />
            {errors.contact ? <div className="text-xs text-destructive">{errors.contact}</div> : null}
          </div>
          */}
          <div className="space-y-1.5">
            <Label>Alamat</Label>
            <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat vendor" />
            {errors.alamat ? <div className="text-xs text-destructive">{errors.alamat}</div> : null}
          </div>
          <div className="space-y-1.5">
            <Label>Telepon</Label>
            <Input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} placeholder="Nomor telepon vendor" />
            {errors.telepon ? <div className="text-xs text-destructive">{errors.telepon}</div> : null}
          </div>
          <div className="space-y-1.5">
            <Label>Range Harga</Label>
            <Input value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} placeholder="Rp 10jt – 50jt" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AddVendorDialog = () => (
  <VendorFormDialog
    mode="add"
    trigger={
      <Button className="bg-primary hover:bg-primary/90">
        <Plus className="w-4 h-4 mr-1.5" /> Tambah Vendor
      </Button>
    }
  />
);
