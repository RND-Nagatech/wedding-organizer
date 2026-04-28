import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useKatalogMakeup } from "@/lib/dataStore";
import { pickDraftItem } from "@/lib/bookingDraft";
import { formatIDR } from "@/lib/mockData";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

const kategoriOptions = ["natural", "bold", "glam", "adat", "modern"] as const;

export default function ClientCatalogMakeup() {
  const list = useKatalogMakeup();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("all");

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
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama Style</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>MUA</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead className="text-right w-[160px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((x) => (
                <TableRow key={x.id}>
                  <TableCell className="font-medium">{x.nama_style}</TableCell>
                  <TableCell className="capitalize">{x.kategori}</TableCell>
                  <TableCell>{x.vendor_mua_nama || "—"}</TableCell>
                  <TableCell>{formatIDR(x.harga || 0)}</TableCell>
                  <TableCell>
                    {x.foto ? (
                      <a className="text-primary hover:underline" href={`${API_ORIGIN}${x.foto}`} target="_blank" rel="noreferrer">Lihat</a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => {
                        pickDraftItem("makeup", x.id);
                        nav("/client/booking");
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Pilih
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}

