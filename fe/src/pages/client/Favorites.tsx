import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { store, useKatalogBaju, useKatalogDekorasi, useKatalogFavorit, useKatalogMakeup } from "@/lib/dataStore";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { formatIDR } from "@/lib/mockData";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

type FilterType = "all" | "baju" | "dekorasi" | "makeup";

export default function Favorites() {
  const { user } = useAuth();
  const clientId = String(user?.clientId || "");

  const favs = useKatalogFavorit();
  const baju = useKatalogBaju();
  const dekorasi = useKatalogDekorasi();
  const makeup = useKatalogMakeup();

  const [filterType, setFilterType] = useState<FilterType>("all");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const rows = useMemo(() => {
    const mine = favs.filter((f) => f.client_id === clientId);
    const filtered = filterType === "all" ? mine : mine.filter((f) => f.katalog_type === filterType);
    return filtered;
  }, [favs, clientId, filterType]);

  const items = useMemo(() => {
    return rows
      .map((f) => {
        const id = String(f.katalog_id);
        if (f.katalog_type === "baju") {
          const x = baju.find((r) => String(r.id) === id);
          return x ? { favId: f.id, type: f.katalog_type, data: x } : null;
        }
        if (f.katalog_type === "dekorasi") {
          const x = dekorasi.find((r) => String(r.id) === id);
          return x ? { favId: f.id, type: f.katalog_type, data: x } : null;
        }
        if (f.katalog_type === "makeup") {
          const x = makeup.find((r) => String(r.id) === id);
          return x ? { favId: f.id, type: f.katalog_type, data: x } : null;
        }
        return null;
      })
      .filter(Boolean) as any[];
  }, [rows, baju, dekorasi, makeup]);

  return (
    <>
      <PageHeader title="Favorit Saya" subtitle={`${items.length} item`} />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Filter</Label>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="baju">Baju</SelectItem>
                <SelectItem value="dekorasi">Dekorasi</SelectItem>
                <SelectItem value="makeup">Makeup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 pt-0">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">Belum ada favorit.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((it) => {
                const x = it.data;
                const src = x.foto ? `${API_ORIGIN}${x.foto}` : "";
                const title =
                  it.type === "baju" ? x.nama_baju : it.type === "dekorasi" ? x.nama_dekorasi : x.nama_style;
                const subtitle =
                  it.type === "baju"
                    ? `${x.kategori} · ${x.warna || "—"}`
                    : it.type === "dekorasi"
                      ? `${x.tema || "—"} · ${x.warna_dominan || "—"}`
                      : `${x.kategori} · ${x.vendor_mua_nama || "—"}`;
                return (
                  <div key={it.favId} className="relative">
                    <button
                      type="button"
                      className="w-full text-left rounded-xl overflow-hidden border border-border bg-background hover:shadow-elegant transition-smooth"
                      onClick={() => {
                        setSelected(it);
                        setOpen(true);
                      }}
                    >
                      <div className="aspect-square bg-muted/30">
                        {src ? (
                          <img src={src} alt={title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="font-medium truncate">{title}</div>
                        <div className="text-xs text-muted-foreground truncate capitalize">{subtitle}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-background/90 border border-border shadow-sm"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await store.deleteKatalogFavorit(String(it.favId));
                          toast.success("Dihapus dari favorit");
                        } catch (err: any) {
                          toast.error(err?.message || "Gagal hapus favorit");
                        }
                      }}
                      aria-label="Hapus favorit"
                      title="Hapus favorit"
                    >
                      <Heart className="w-4 h-4 text-primary fill-primary" />
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
            <DialogTitle className="font-display text-2xl">Detail Favorit</DialogTitle>
          </DialogHeader>
          {!selected ? null : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
                {selected.data?.foto ? (
                  <img src={`${API_ORIGIN}${selected.data.foto}`} alt="Foto" className="w-full h-[420px] object-cover" />
                ) : (
                  <div className="w-full h-[420px] flex items-center justify-center text-sm text-muted-foreground">No Photo</div>
                )}
              </div>
              <div className="space-y-3">
                {selected.type === "baju" ? (
                  <>
                    <div className="font-display text-2xl">{selected.data.nama_baju}</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Kategori</div>
                        <div className="font-medium capitalize">{selected.data.kategori}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Adat</div>
                        <div className="font-medium">{selected.data.adat_nama || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Warna</div>
                        <div className="font-medium">{selected.data.warna || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className="font-medium">{statusLabel(String(selected.data.status || ""))}</div>
                      </div>
                    </div>
                  </>
                ) : selected.type === "dekorasi" ? (
                  <>
                    <div className="font-display text-2xl">{selected.data.nama_dekorasi}</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Tema</div>
                        <div className="font-medium">{selected.data.tema || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Adat</div>
                        <div className="font-medium">{selected.data.adat_nama || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Warna</div>
                        <div className="font-medium">{selected.data.warna_dominan || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Harga</div>
                        <div className="font-medium text-primary">{formatIDR(selected.data.harga || 0)}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-display text-2xl">{selected.data.nama_style}</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Kategori</div>
                        <div className="font-medium capitalize">{selected.data.kategori}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">MUA</div>
                        <div className="font-medium">{selected.data.vendor_mua_nama || "—"}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground">Harga</div>
                        <div className="font-medium text-primary">{formatIDR(selected.data.harga || 0)}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={async () => {
                if (!selected) return;
                try {
                  await store.deleteKatalogFavorit(String(selected.favId));
                  toast.success("Dihapus dari favorit");
                  setOpen(false);
                } catch (err: any) {
                  toast.error(err?.message || "Gagal hapus favorit");
                }
              }}
            >
              <Heart className="w-4 h-4 mr-1.5 text-primary fill-primary" /> Hapus Favorit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

