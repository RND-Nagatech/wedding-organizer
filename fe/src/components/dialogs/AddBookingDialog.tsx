import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { store, useClients, usePackages } from "@/lib/dataStore";
import { toast } from "sonner";
import type { Booking } from "@/lib/mockData";

export const AddBookingDialog = () => {
  const clients = useClients();
  const packages = usePackages();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Booking, "id">>({
    clientId: clients[0]?.id ?? "",
    packageId: packages[0]?.id ?? "",
    eventDate: "",
    venue: "",
    guests: 0,
    status: "Pending",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.eventDate || !form.venue) {
      toast.error("Lengkapi klien, tanggal, dan venue");
      return;
    }
    store.addBooking(form);
    toast.success("Booking berhasil ditambahkan");
    setOpen(false);
    setForm({ ...form, eventDate: "", venue: "", guests: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> Booking Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Tambah Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Klien</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} & {c.partner}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Paket</Label>
              <Select value={form.packageId} onValueChange={(v) => setForm({ ...form, packageId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Event</Label>
              <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Jumlah Tamu</Label>
              <Input type="number" value={form.guests || ""} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Venue</Label>
            <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Grand Ballroom" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Booking["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Pending", "Confirmed", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
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
