import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  // State untuk input sementara sebelum ditambah ke list
  const [inputKategori, setInputKategori] = useState<string>("");
  const [inputVendorIds, setInputVendorIds] = useState<string[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null); // index data yang sedang diedit
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
      setVendorByCategory([]);
    }
    setInputKategori("");
    setInputVendorIds([]);
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
            <Label>Tambah Kategori & Vendor</Label>
            <div className="border rounded-lg p-4 bg-background space-y-4">
              <div className="flex flex-col gap-2">
                <div>
                  <Label className="mb-1 block">Kategori Vendor</Label>
                  <Select
                    value={inputKategori}
                    onValueChange={(v) => {
                      setInputKategori(v);
                      setInputVendorIds([]);
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
                <div>
                  <Label className="mb-1 block">Vendor</Label>
                  {inputKategori ? (
                    <div className="border rounded-md p-2 max-h-48 overflow-auto bg-muted/30">
                      <label className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Checkbox
                          checked={inputVendorIds.length === vendors.filter((v) => String(v.categoryId) === inputKategori).length}
                          indeterminate={inputVendorIds.length > 0 && inputVendorIds.length < vendors.filter((v) => String(v.categoryId) === inputKategori).length}
                          onCheckedChange={(val) => {
                            const allVendors = vendors.filter((v) => String(v.categoryId) === inputKategori).map((v) => v.id);
                            setInputVendorIds(val ? allVendors : []);
                          }}
                        />
                        Semua Vendor
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2">
                        {vendors.filter((v) => String(v.categoryId) === inputKategori).map((v) => (
                          <label key={v.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={inputVendorIds.includes(v.id)}
                              onCheckedChange={(val) => {
                                setInputVendorIds((prev) =>
                                  val ? Array.from(new Set([...prev, v.id])) : prev.filter((x) => x !== v.id)
                                );
                              }}
                            />
                            <span>{v.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Pilih kategori terlebih dahulu</div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="w-full mt-2"
                  disabled={!inputKategori || inputVendorIds.length === 0 || (editIdx === null && vendorByCategory.some((r) => r.kategoriVendorId === inputKategori))}
                  onClick={() => {
                    if (editIdx !== null) {
                      setVendorByCategory((rows) => rows.map((r, i) => i === editIdx ? { kategoriVendorId: inputKategori, vendorIds: inputVendorIds } : r));
                    } else {
                      setVendorByCategory((rows) => [...rows, { kategoriVendorId: inputKategori, vendorIds: inputVendorIds }]);
                    }
                    setInputKategori("");
                    setInputVendorIds([]);
                    setEditIdx(null);
                  }}
                >
                  {editIdx !== null ? "Simpan Perubahan" : "Tambah"}
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Label>List Kategori & Vendor yang Ditambahkan</Label>
              {vendorByCategory.length === 0 ? (
                <div className="text-sm text-muted-foreground">Belum ada kategori/vendor yang ditambahkan.</div>
              ) : (
                <div className="space-y-3">
                  {vendorByCategory.map((row, idx) => {
                    const selectedCategoryId = row.kategoriVendorId;
                    const categoryName = kategoriOptions.find((x) => String(x._id) === String(selectedCategoryId))?.nama_kategori || "—";
                    const vendorsInCategory = vendors.filter((v) => row.vendorIds.includes(v.id));
                    return (
                      <Card key={`${idx}-${selectedCategoryId || "x"}`} className="p-3 relative">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium mb-1">{categoryName}</div>
                            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                              {vendorsInCategory.map((v) => (
                                <span key={v.id} className="bg-muted px-2 py-0.5 rounded">{v.name}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              title="Edit"
                              className="text-primary hover:text-primary-foreground p-1 rounded"
                              onClick={() => {
                                setInputKategori(row.kategoriVendorId);
                                setInputVendorIds(row.vendorIds);
                                setEditIdx(idx);
                              }}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              title="Hapus"
                              className="text-destructive hover:text-destructive-foreground p-1 rounded"
                              onClick={() => {
                                setVendorByCategory((rows) => rows.filter((_, i) => i !== idx));
                                // Jika sedang edit data ini, reset input
                                if (editIdx === idx) {
                                  setInputKategori("");
                                  setInputVendorIds([]);
                                  setEditIdx(null);
                                }
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
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
