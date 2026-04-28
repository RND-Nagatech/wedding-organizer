import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKatalogMakeup } from "@/lib/dataStore";
import { pickDraftItem } from "@/lib/bookingDraft";
import { formatIDR } from "@/lib/mockData";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

const kategoriOptions = ["natural", "bold", "glam", "adat", "modern"] as const;

export default function ClientCatalogMakeup() {
  const list = useKatalogMakeup();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const rows = useMemo(() => {
    return list
      .filter((x) => (x.status || "aktif") === "aktif")
      .filter((x) => (filterKategori === "all" ? true : String(x.kategori || "") === filterKategori))
      .filter((x) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        return (
          String(x.nama_style || "").toLowerCase().includes(needle) ||
          String(x.vendor_mua_nama || "").toLowerCase().includes(needle)
        );
      });
  }, [list, filterKategori, q]);

  return (
    <>
      <PageHeader title="Katalog Makeup" subtitle={`${rows.length} item aktif`} />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 grid sm:grid-cols-4 gap-3">
          <div className="space-y-1.5 sm:col-span-3">
            <Label>Cari</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama style / MUA..." />
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {kategoriOptions.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                        <img src={src} alt={x.nama_style} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-medium truncate">{x.nama_style}</div>
                      <div className="text-xs text-muted-foreground truncate capitalize">
                        {x.kategori} · {x.vendor_mua_nama || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{formatIDR(x.harga || 0)}</div>
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
            <DialogTitle className="font-display text-2xl">Detail Makeup</DialogTitle>
          </DialogHeader>

          {!selected ? null : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
                {selected.foto ? (
                  <img src={`${API_ORIGIN}${selected.foto}`} alt={selected.nama_style} className="w-full h-[420px] object-cover" />
                ) : (
                  <div className="w-full h-[420px] flex items-center justify-center text-sm text-muted-foreground">No Photo</div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Nama Style</div>
                  <div className="font-display text-2xl">{selected.nama_style}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Kategori</div>
                    <div className="font-medium capitalize">{selected.kategori}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">MUA</div>
                    <div className="font-medium">{selected.vendor_mua_nama || "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Harga</div>
                    <div className="font-medium text-primary">{formatIDR(selected.harga || 0)}</div>
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
                pickDraftItem("makeup", selected.id);
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
