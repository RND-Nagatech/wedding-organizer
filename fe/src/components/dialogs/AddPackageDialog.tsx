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
import { RupiahInput } from "@/components/RupiahInput";
import { ambilKategoriVendor } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

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
  const [kategoriOptions, setKategoriOptions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState("");
  const [vendorByCategory, setVendorByCategory] = useState<Array<{ kategoriVendorId: string; vendorIds: string[] }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setTagline(initial?.tagline ?? "");
    setPrice(initial?.price ?? 0);
    setFeatures((initial?.features ?? []).join("\n"));
    if (initial?.vendorByCategory && initial.vendorByCategory.length > 0) {
      setVendorByCategory(
        initial.vendorByCategory.map((row) => ({
          kategoriVendorId: String(row.kategoriVendorId),
          vendorIds: (row.vendorIds || []).map(String),
        }))
      );
    } else {
      const selected = new Set((initial?.vendorIds || []).map(String));
      const grouped = new Map<string, string[]>();
      vendors.forEach((v) => {
        if (!selected.has(v.id)) return;
        const key = String(v.categoryId || "");
        if (!key) return;
        grouped.set(key, [...(grouped.get(key) || []), v.id]);
      });
      const rows = Array.from(grouped.entries()).map(([kategoriVendorId, vendorIds]) => ({ kategoriVendorId, vendorIds }));
      setVendorByCategory(rows);
    }
    setErrors({});
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    ambilKategoriVendor()
      .then((data) => setKategoriOptions(Array.isArray(data) ? data : []))
      .catch(() => setKategoriOptions([]));
  }, [open]);

  const vendorUnionIds = Array.from(new Set(vendorByCategory.flatMap((r) => r.vendorIds)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name) next.name = "Nama paket wajib diisi";
    if (!price || Number(price) <= 0) next.price = "Harga paket wajib diisi";
    if (vendorUnionIds.length === 0) next.vendorIds = "Pilih minimal 1 vendor dalam paket";
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
        vendorIds: vendorUnionIds,
        vendorByCategory,
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
            <RupiahInput value={Number(price) || 0} onValueChange={(v) => setPrice(v)} placeholder="Rp" />
            {errors.price ? <div className="text-xs text-destructive">{errors.price}</div> : null}
          </div>
          <div className="space-y-1.5">
            <Label>Fitur (satu per baris)</Label>
            <Textarea rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Hingga 200 tamu&#10;Dekorasi premium&#10;Fotografi 8 jam" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label>Vendor dalam Paket (berdasarkan kategori)</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVendorByCategory((rows) => [...rows, { kategoriVendorId: "", vendorIds: [] }])}
              >
                + Tambah Kategori
              </Button>
            </div>

            {vendorByCategory.length === 0 ? (
              <div className="text-sm text-muted-foreground">Tambahkan kategori vendor untuk memilih vendor.</div>
            ) : (
              <div className="space-y-3">
                {vendorByCategory.map((row, idx) => {
                  const selectedCategoryId = row.kategoriVendorId;
                  const categoryName =
                    kategoriOptions.find((x) => String(x._id) === String(selectedCategoryId))?.nama_kategori || "—";
                  const vendorsInCategory = vendors.filter((v) => String(v.categoryId || "") === String(selectedCategoryId));
                  return (
                    <Card key={`${idx}-${selectedCategoryId || "x"}`} className="p-4 border-border shadow-soft space-y-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-[240px] flex-1 space-y-1.5">
                          <Label>Kategori Vendor</Label>
                          <Select
                            value={selectedCategoryId || ""}
                            onValueChange={(v) => {
                              setVendorByCategory((rows) =>
                                rows.map((r, i) =>
                                  i !== idx
                                    ? r
                                    : {
                                        kategoriVendorId: v,
                                        vendorIds: [],
                                      }
                                )
                              );
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori vendor" />
                            </SelectTrigger>
                            <SelectContent>
                              {kategoriOptions.map((k) => (
                                <SelectItem key={k._id} value={String(k._id)}>
                                  {k.nama_kategori}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => setVendorByCategory((rows) => rows.filter((_, i) => i !== idx))}
                        >
                          Hapus Kategori
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {selectedCategoryId ? `Kategori: ${categoryName}` : "Pilih kategori dulu untuk menampilkan vendor."}
                      </div>

                      <div className="max-h-48 overflow-auto rounded-md border border-border p-3 space-y-2">
                        {!selectedCategoryId ? (
                          <div className="text-sm text-muted-foreground">Pilih kategori vendor.</div>
                        ) : vendorsInCategory.length === 0 ? (
                          <div className="text-sm text-muted-foreground">Belum ada vendor pada kategori ini.</div>
                        ) : (
                          vendorsInCategory.map((v) => {
                            const checked = row.vendorIds.includes(v.id);
                            return (
                              <label key={v.id} className="flex items-center gap-3 text-sm">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(val) => {
                                    const next = Boolean(val);
                                    setVendorByCategory((rows) =>
                                      rows.map((r, i) =>
                                        i !== idx
                                          ? r
                                          : {
                                              ...r,
                                              vendorIds: next
                                                ? Array.from(new Set([...r.vendorIds, v.id]))
                                                : r.vendorIds.filter((x) => x !== v.id),
                                            }
                                      )
                                    );
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
                      <div className="text-xs text-muted-foreground">{row.vendorIds.length} vendor dipilih pada kategori ini</div>
                    </Card>
                  );
                })}
              </div>
            )}
            {errors.vendorIds ? <div className="text-xs text-destructive">{errors.vendorIds}</div> : null}
            <div className="text-xs text-muted-foreground">{vendorUnionIds.length} vendor dipilih (total)</div>
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
