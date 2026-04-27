import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { store } from "@/lib/dataStore";
import { toast } from "sonner";
import type { Vendor } from "@/lib/mockData";

const categories: Vendor["category"][] = ["Catering", "Dekorasi", "Fotografi", "MUA", "Venue", "Musik"];

export const AddVendorDialog = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Vendor, "id">>({
    name: "",
    category: "Catering",
    contact: "",
    rating: 4.5,
    priceRange: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact) {
      toast.error("Lengkapi nama dan kontak vendor");
      return;
    }
    store.addVendor(form);
    toast.success("Vendor berhasil ditambahkan");
    setOpen(false);
    setForm({ name: "", category: "Catering", contact: "", rating: 4.5, priceRange: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Tambah Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Vendor</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Vendor["category"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Rating (0-5)</Label>
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kontak</Label>
            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="0812-xxxx-xxxx" />
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
