import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, useKatalogFavorit, useKatalogMakeup } from "@/lib/dataStore";
import { formatIDR } from "@/lib/mockData";
import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

const kategoriOptions = ["natural", "bold", "glam", "adat", "modern"] as const;

export default function ClientCatalogMakeup() {
  const { user } = useAuth();
  const clientId = String(user?.clientId || "");
  const list = useKatalogMakeup();
  const favs = useKatalogFavorit();

  const [q, setQ] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all" | "fav">("all");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const favSet = useMemo(() => {
    const ids = favs
      .filter((f) => f.client_id === clientId && f.katalog_type === "makeup")
      .map((f) => String(f.katalog_id));
    return new Set(ids);
  }, [favs, clientId]);

  const rows = useMemo(() => {
    const onlyFav = filterMode === "fav";
    return list
      .filter((x) => (x.status || "aktif") === "aktif")
      .filter((x) => (filterKategori === "all" ? true : String(x.kategori || "") === filterKategori))
      .filter((x) => (onlyFav ? favSet.has(String(x.id)) : true))
      .filter((x) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        return (
          String(x.nama_style || "").toLowerCase().includes(needle) ||
          String(x.vendor_mua_nama || "").toLowerCase().includes(needle)
        );
      });
  }, [list, filterKategori, q, filterMode, favSet]);

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
            <Label>Mode</Label>
            <Select value={filterMode} onValueChange={(v: any) => setFilterMode(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Katalog</SelectItem>
                <SelectItem value="fav">Favorit Saya</SelectItem>
              </SelectContent>
            </Select>
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
                const isFav = favSet.has(String(x.id));
                return (
                  <div key={x.id} className="relative">
                    <button
                      type="button"
                      className="w-full text-left rounded-xl overflow-hidden border border-border bg-background hover:shadow-elegant transition-smooth"
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

                    <button
                      type="button"
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-background/90 border border-border shadow-sm"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!clientId) return;
                        try {
                          const res = await store.toggleKatalogFavorit({ client_id: clientId, katalog_type: "makeup", katalog_id: String(x.id) });
                          toast.success(res.action === "added" ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
                        } catch (err: any) {
                          toast.error(err?.message || "Gagal update favorit");
                        }
                      }}
                      aria-label={isFav ? "Hapus favorit" : "Tambah favorit"}
                      title={isFav ? "Hapus favorit" : "Tambah favorit"}
                    >
                      <Heart className={isFav ? "w-4 h-4 text-primary fill-primary" : "w-4 h-4 text-muted-foreground"} />
                    </button>
                  </div>
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
              onClick={async () => {
                if (!selected) return;
                if (!clientId) return;
                try {
                  const res = await store.toggleKatalogFavorit({ client_id: clientId, katalog_type: "makeup", katalog_id: String(selected.id) });
                  toast.success(res.action === "added" ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
                  if (filterMode === "fav" && res.action === "removed") setOpen(false);
                } catch (err: any) {
                  toast.error(err?.message || "Gagal update favorit");
                }
              }}
            >
              <Heart className="w-4 h-4 mr-1.5" /> {selected && favSet.has(String(selected.id)) ? "Hapus Favorit" : "Tambah Favorit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
