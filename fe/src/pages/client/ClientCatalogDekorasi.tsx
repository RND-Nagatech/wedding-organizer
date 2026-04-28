import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdat, useKatalogDekorasi } from "@/lib/dataStore";
import { pickDraftItem } from "@/lib/bookingDraft";
import { formatIDR } from "@/lib/mockData";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

export default function ClientCatalogDekorasi() {
  const adat = useAdat();
  const list = useKatalogDekorasi();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [filterAdat, setFilterAdat] = useState<string>("all");
  const [filterTema, setFilterTema] = useState<string>("");
  const [filterWarna, setFilterWarna] = useState<string>("");

  const rows = useMemo(() => {
    return list
      .filter((x) => (x.status || "aktif") === "aktif")
      .filter((x) => (filterAdat === "all" ? true : String(x.adat_id || "") === filterAdat))
      .filter((x) => (!filterTema.trim() ? true : String(x.tema || "").toLowerCase().includes(filterTema.trim().toLowerCase())))
      .filter((x) => (!filterWarna.trim() ? true : String(x.warna_dominan || "").toLowerCase().includes(filterWarna.trim().toLowerCase())))
      .filter((x) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        return String(x.nama_dekorasi || "").toLowerCase().includes(needle);
      });
  }, [list, filterAdat, filterTema, filterWarna, q]);

  return (
    <>
      <PageHeader title="Katalog Dekorasi" subtitle={`${rows.length} item aktif`} />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 grid sm:grid-cols-4 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Cari</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama dekorasi..." />
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
            <Label>Tema</Label>
            <Input value={filterTema} onChange={(e) => setFilterTema(e.target.value)} placeholder="contoh: rustic" />
          </div>
          <div className="space-y-1.5">
            <Label>Warna Dominan</Label>
            <Input value={filterWarna} onChange={(e) => setFilterWarna(e.target.value)} placeholder="contoh: gold" />
          </div>
        </div>

        <div className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Adat</TableHead>
                <TableHead>Warna</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead className="text-right w-[160px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((x) => (
                <TableRow key={x.id}>
                  <TableCell className="font-medium">{x.nama_dekorasi}</TableCell>
                  <TableCell>{x.tema || "—"}</TableCell>
                  <TableCell>{x.adat_nama || "—"}</TableCell>
                  <TableCell>{x.warna_dominan || "—"}</TableCell>
                  <TableCell>{x.vendor_nama || "—"}</TableCell>
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
                        pickDraftItem("dekorasi", x.id);
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
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
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

