import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { store, usePackages } from "@/lib/dataStore";
import { toast } from "sonner";
import type { Client } from "@/lib/mockData";

export const AddClientDialog = () => {
  const packages = usePackages();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Client, "id">>({
    name: "",
    partner: "",
    email: "",
    phone: "",
    weddingDate: "",
    packageId: packages[0]?.id ?? "",
    status: "Lead",
    budget: 0,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.partner || !form.weddingDate) {
      toast.error("Lengkapi nama, pasangan, dan tanggal");
      return;
    }
    store.addClient(form);
    toast.success("Klien berhasil ditambahkan");
    setOpen(false);
    setForm({ ...form, name: "", partner: "", email: "", phone: "", weddingDate: "", budget: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Klien
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Tambah Klien Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Pasangan</Label>
              <Input value={form.partner} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>No. HP</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Pernikahan</Label>
              <Input type="date" value={form.weddingDate} onChange={(e) => setForm({ ...form, weddingDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Budget (Rp)</Label>
              <Input type="number" value={form.budget || ""} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Paket</Label>
              <Select value={form.packageId} onValueChange={(v) => setForm({ ...form, packageId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Client["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Lead", "Booked", "Ongoing", "Completed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
