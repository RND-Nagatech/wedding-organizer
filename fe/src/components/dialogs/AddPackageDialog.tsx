import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { store, useVendors } from "@/lib/dataStore";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import type { Package } from "@/lib/mockData";

export const PackageFormDialog = ({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: Package;
  trigger: React.ReactNode;
}) => {
  const vendors = useVendors();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState("");
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setTagline(initial?.tagline ?? "");
    setPrice(initial?.price ?? 0);
    setFeatures((initial?.features ?? []).join("\n"));
    setVendorIds(initial?.vendorIds ?? []);
    setErrors({});
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name) next.name = "Nama paket wajib diisi";
    if (!price || Number(price) <= 0) next.price = "Harga paket wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }
    try {
      const payload = {
        name,
        tagline,
        price: Number(price),
        features: features.split("\n").map((f) => f.trim()).filter(Boolean),
        vendorIds,
      };
      if (mode === "add") {
        await store.addPackage(payload);
        toast.success("Paket berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updatePackage(initial.id, payload);
        toast.success("Paket berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan paket");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "add" ? "Tambah Paket" : "Edit Paket"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Paket</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Diamond Royal" />
            {errors.name ? <div className="text-xs text-destructive">{errors.name}</div> : null}
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Pernikahan eksklusif" />
          </div>
          <div className="space-y-1.5">
            <Label>Harga (Rp)</Label>
            <Input type="number" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} />
            {errors.price ? <div className="text-xs text-destructive">{errors.price}</div> : null}
          </div>
          <div className="space-y-1.5">
            <Label>Fitur (satu per baris)</Label>
            <Textarea rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Hingga 200 tamu&#10;Dekorasi premium&#10;Fotografi 8 jam" />
          </div>
          <div className="space-y-2">
            <Label>Vendor yang Boleh Masuk Paket</Label>
            <div className="max-h-52 overflow-auto rounded-md border border-border p-3 space-y-2">
              {vendors.length === 0 ? (
                <div className="text-sm text-muted-foreground">Belum ada master vendor.</div>
              ) : (
                vendors.map((v) => {
                  const checked = vendorIds.includes(v.id);
                  return (
                    <label key={v.id} className="flex items-center gap-3 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => {
                          const next = Boolean(val);
                          setVendorIds((ids) => (next ? Array.from(new Set([...ids, v.id])) : ids.filter((x) => x !== v.id)));
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="font-medium">{v.name}</span>{" "}
                        <span className="text-muted-foreground">· {v.category}</span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            <div className="text-xs text-muted-foreground">{vendorIds.length} vendor dipilih</div>
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

export const AddPackageDialog = () => (
  <PackageFormDialog
    mode="add"
    trigger={
      <Button className="bg-primary hover:bg-primary/90">
        <Plus className="w-4 h-4 mr-1.5" /> Tambah Paket
      </Button>
    }
  />
);
