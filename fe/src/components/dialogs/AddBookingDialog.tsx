import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { store, useClients, usePackages } from "@/lib/dataStore";
import { toast } from "sonner";
import type { Booking } from "@/lib/mockData";
import { Checkbox } from "@/components/ui/checkbox";
import { ambilVendorAvailable } from "@/lib/api";

export const AddBookingDialog = () => {
  const clients = useClients();
  const packages = usePackages();
  const [open, setOpen] = useState(false);
  const [vendorsAvailable, setVendorsAvailable] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Omit<Booking, "id">>({
    clientId: clients[0]?.id ?? "",
    packageId: packages[0]?.id ?? "",
    eventDate: "",
    venue: "",
    guests: 0,
    vendorSelectedIds: [],
    status: "Pending",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setVendorsAvailable([]);
    setForm((f) => ({
      ...f,
      clientId: clients[0]?.id ?? "",
      packageId: packages[0]?.id ?? "",
      eventDate: "",
      venue: "",
      guests: 0,
      vendorSelectedIds: [],
      status: "Pending",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!form.packageId || !form.eventDate) {
      setVendorsAvailable([]);
      return;
    }
    (async () => {
      try {
        setLoadingVendors(true);
        const vendors = await ambilVendorAvailable({ package_id: form.packageId, tanggal_acara: form.eventDate });
        setVendorsAvailable(vendors);
        setForm((f) => ({
          ...f,
          vendorSelectedIds: (f.vendorSelectedIds || []).filter((id) => vendors.some((v: any) => v._id === id)),
        }));
      } catch {
        setVendorsAvailable([]);
      } finally {
        setLoadingVendors(false);
      }
    })();
  }, [open, form.packageId, form.eventDate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.clientId) next.clientId = "Klien wajib diisi";
    if (!form.packageId) next.packageId = "Paket wajib diisi";
    if (!form.eventDate) next.eventDate = "Tanggal event wajib diisi";
    if (!form.venue) next.venue = "Venue wajib diisi";
    const hasVendorChoices = vendorsAvailable.length > 0;
    if (hasVendorChoices && (!form.vendorSelectedIds || form.vendorSelectedIds.length === 0)) {
      next.vendorSelectedIds = "Pilih minimal 1 vendor";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }
    try {
      await store.addBooking(form);
      toast.success("Booking berhasil ditambahkan");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menambah booking");
    }
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
              {errors.clientId ? <div className="text-xs text-destructive">{errors.clientId}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Paket</Label>
              <Select value={form.packageId} onValueChange={(v) => setForm({ ...form, packageId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.packageId ? <div className="text-xs text-destructive">{errors.packageId}</div> : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Event</Label>
              <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
              {errors.eventDate ? <div className="text-xs text-destructive">{errors.eventDate}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Jumlah Tamu</Label>
              <Input type="number" value={form.guests || ""} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Venue</Label>
            <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Grand Ballroom" />
            {errors.venue ? <div className="text-xs text-destructive">{errors.venue}</div> : null}
          </div>

          <div className="space-y-2">
            <Label>Vendor Available (sesuai paket)</Label>
            <div className="max-h-52 overflow-auto rounded-md border border-border p-3 space-y-2">
              {!form.eventDate || !form.packageId ? (
                <div className="text-sm text-muted-foreground">Pilih paket dan tanggal event untuk melihat vendor available.</div>
              ) : loadingVendors ? (
                <div className="text-sm text-muted-foreground">Memuat vendor...</div>
              ) : vendorsAvailable.length === 0 ? (
                <div className="text-sm text-muted-foreground">Tidak ada vendor available untuk paket/tanggal ini.</div>
              ) : (
                vendorsAvailable.map((v: any) => {
                  const checked = (form.vendorSelectedIds || []).includes(v._id);
                  return (
                    <label key={v._id} className="flex items-center gap-3 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => {
                          const next = Boolean(val);
                          setForm((f) => ({
                            ...f,
                            vendorSelectedIds: next
                              ? Array.from(new Set([...(f.vendorSelectedIds || []), v._id]))
                              : (f.vendorSelectedIds || []).filter((x) => x !== v._id),
                          }));
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="font-medium">{v.nama_vendor}</span>{" "}
                        <span className="text-muted-foreground">· {v.kategori_vendor_nama || v.kategori_vendor_id?.nama_kategori || "-"}</span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            {errors.vendorSelectedIds ? <div className="text-xs text-destructive">{errors.vendorSelectedIds}</div> : null}
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
