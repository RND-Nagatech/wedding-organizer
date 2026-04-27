import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { store } from "@/lib/dataStore";
import { toast } from "sonner";

export const AddPackageDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("Lengkapi nama dan harga paket");
      return;
    }
    store.addPackage({
      name,
      tagline,
      price,
      features: features.split("\n").map((f) => f.trim()).filter(Boolean),
    });
    toast.success("Paket berhasil ditambahkan");
    setOpen(false);
    setName(""); setTagline(""); setPrice(0); setFeatures("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Paket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Tambah Paket</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Paket</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Diamond Royal" />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Pernikahan eksklusif" />
          </div>
          <div className="space-y-1.5">
            <Label>Harga (Rp)</Label>
            <Input type="number" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Fitur (satu per baris)</Label>
            <Textarea rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Hingga 200 tamu&#10;Dekorasi premium&#10;Fotografi 8 jam" />
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
