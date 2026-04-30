import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { store, usePackages } from "@/lib/dataStore";
import { toast } from "sonner";
import type { Client } from "@/lib/mockData";
import { RupiahInput } from "@/components/RupiahInput";

export const ClientFormDialog = ({
  mode,
  initial,
  triggerLabel,
  trigger,
  triggerVariant = "default",
}: {
  mode: "add" | "edit";
  initial?: Client;
  triggerLabel: string;
  trigger?: React.ReactNode;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
}) => {
  const packages = usePackages();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Omit<Client, "id">>({
    code: initial?.code,
    name: initial?.name ?? "",
    partner: initial?.partner ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    weddingDate: initial?.weddingDate ?? "",
    packageId: initial?.packageId ?? (packages[0]?.id ?? ""),
    status: initial?.status ?? "Lead",
    budget: initial?.budget ?? 0,
  });

  useEffect(() => {
    if (!open) return;
    if (!form.packageId && packages[0]?.id) {
      setForm((f) => ({ ...f, packageId: packages[0].id }));
    }
  }, [open, form.packageId, packages]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name) nextErrors.name = "Nama wajib diisi";
    if (!form.partner) nextErrors.partner = "Nama pasangan wajib diisi";
    if (!form.phone) nextErrors.phone = "No. HP wajib diisi";
    if (!form.weddingDate) nextErrors.weddingDate = "Tanggal pernikahan wajib diisi";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      if (mode === "add") {
        await store.addClient(form);
        toast.success("Klien berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateClient(initial.id, form);
        toast.success("Klien berhasil diperbarui");
      }
      setOpen(false);
      setErrors({});
      if (mode === "add") {
        setForm({ ...form, name: "", partner: "", email: "", phone: "", weddingDate: "", budget: 0 });
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan klien");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant={triggerVariant}
            className={triggerVariant === "default" ? "bg-primary hover:bg-primary/90" : ""}
          >
            {mode === "add" ? <Plus className="w-4 h-4 mr-1.5" /> : null}
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "add" ? "Tambah Klien Baru" : "Edit Klien"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Pengantin Wanita</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name ? <div className="text-xs text-destructive">{errors.name}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Nama Pengantin Pria</Label>
              <Input value={form.partner} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
              {errors.partner ? <div className="text-xs text-destructive">{errors.partner}</div> : null}
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
              {errors.phone ? <div className="text-xs text-destructive">{errors.phone}</div> : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Pernikahan</Label>
              <Input type="date" value={form.weddingDate} onChange={(e) => setForm({ ...form, weddingDate: e.target.value })} />
              {errors.weddingDate ? <div className="text-xs text-destructive">{errors.weddingDate}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Budget (Rp)</Label>
              <RupiahInput value={Number(form.budget) || 0} onValueChange={(v) => setForm({ ...form, budget: v })} placeholder="Rp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* <div className="space-y-1.5">
              <Label>Paket</Label>
              <Select value={form.packageId} onValueChange={(v) => setForm({ ...form, packageId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div> */}
            {/*
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Client["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Lead", "Booked", "Ongoing", "Completed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            */}
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

export const AddClientDialog = () => (
  <ClientFormDialog mode="add" triggerLabel="Tambah Klien" />
);
