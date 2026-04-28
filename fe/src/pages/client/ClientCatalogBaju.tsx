import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdat, useKatalogBaju } from "@/lib/dataStore";
import { pickDraftItem } from "@/lib/bookingDraft";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

export default function ClientCatalogBaju() {
  const adat = useAdat();
  const list = useKatalogBaju();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [filterAdat, setFilterAdat] = useState<string>("all");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [filterWarna, setFilterWarna] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const rows = useMemo(() => {
    return list
      .filter((x) => (x.status || "tersedia") === "tersedia")
      .filter((x) => (filterAdat === "all" ? true : String(x.adat_id || "") === filterAdat))
      .filter((x) => (filterKategori === "all" ? true : String(x.kategori || "") === filterKategori))
      .filter((x) => (!filterWarna.trim() ? true : String(x.warna || "").toLowerCase().includes(filterWarna.trim().toLowerCase())))
      .filter((x) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        return (
          String(x.nama_baju || "").toLowerCase().includes(needle) ||
          String(x.model || "").toLowerCase().includes(needle) ||
          String(x.ukuran || "").toLowerCase().includes(needle)
        );
      });
  }, [list, filterAdat, filterKategori, filterWarna, q]);

  return (
    <>
      <PageHeader title="Katalog Baju" subtitle={`${rows.length} item tersedia`} />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 grid sm:grid-cols-4 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Cari</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama/model/ukuran..." />
          </div>
          <div className="space-y-1.5">
            <Label>Adat</Label>
            <Select value={filterAdat} onValueChange={setFilterAdat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {adat.filter((a) => a.status === "aktif").map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.nama_adat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="akad">akad</SelectItem>
                <SelectItem value="resepsi">resepsi</SelectItem>
                <SelectItem value="prewedding">prewedding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Warna</Label>
            <Input value={filterWarna} onChange={(e) => setFilterWarna(e.target.value)} placeholder="contoh: putih" />
          </div>
        </div>

        <div className="p-4 pt-0">
          {rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">Tidak ada data.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {rows.map((x) => {
                const src = x.foto ? `${API_ORIGIN}${x.foto}` : "";
                return (
                  <button
                    key={x.id}
                    type="button"
                    className="text-left rounded-xl overflow-hidden border border-border bg-background hover:shadow-elegant transition-smooth"
                    onClick={() => {
                      setSelected(x);
                      setOpen(true);
                    }}
                  >
                    <div className="aspect-square bg-muted/30">
                      {src ? (
                        <img src={src} alt={x.nama_baju} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-medium truncate">{x.nama_baju}</div>
                      <div className="text-xs text-muted-foreground truncate capitalize">
                        {x.kategori} · {x.warna || "—"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Detail Baju</DialogTitle>
          </DialogHeader>

          {!selected ? null : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
                {selected.foto ? (
                  <img src={`${API_ORIGIN}${selected.foto}`} alt={selected.nama_baju} className="w-full h-[420px] object-cover" />
                ) : (
                  <div className="w-full h-[420px] flex items-center justify-center text-sm text-muted-foreground">No Photo</div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Nama</div>
                  <div className="font-display text-2xl">{selected.nama_baju}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Kategori</div>
                    <div className="font-medium capitalize">{selected.kategori}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Adat</div>
                    <div className="font-medium">{selected.adat_nama || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Model</div>
                    <div className="font-medium">{selected.model || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Ukuran</div>
                    <div className="font-medium">{selected.ukuran || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Warna</div>
                    <div className="font-medium">{selected.warna || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium">{statusLabel(String(selected.status || ""))}</div>
                  </div>
                </div>
                {selected.catatan ? (
                  <div className="text-sm">
                    <div className="text-xs text-muted-foreground">Catatan</div>
                    <div className="whitespace-pre-wrap">{selected.catatan}</div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (!selected) return;
                pickDraftItem("baju", selected.id);
                setOpen(false);
                nav("/client/booking");
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Pilih
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
