import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { formatDate, formatIDR } from "@/lib/mockData";
import { exportToExcel, exportToPdf } from "@/lib/exporters";
import { reportKeuanganDetail } from "@/lib/api";
import { titleCaseWords } from "@/lib/labels";

const KeuanganDetailReport = () => {
  const today = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  const defaultTo = toISO(today);
  const dFrom = new Date(today);
  dFrom.setDate(dFrom.getDate() - 30);
  const defaultFrom = toISO(dFrom);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [kat, setKat] = useState("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await reportKeuanganDetail({
        tgl_from: from || undefined,
        tgl_to: to || undefined,
        kategori: kat !== "all" ? kat : undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan keuangan detail");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title="Laporan Keuangan Detail" subtitle={`${rows.length} baris`} />
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid lg:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Dari</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sampai</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={kat} onValueChange={setKat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {["DP", "cicilan", "pelunasan", "vendor", "operasional", "lainnya"].map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end lg:col-span-2">
              <Button variant="outline" onClick={load} disabled={loading}>
                {loading ? "Memuat..." : "Filter"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await exportToExcel({
                      filename: "laporan-keuangan-detail.xlsx",
                      sheetName: "Keuangan Detail",
                      rows: rows.map((r) => ({
                        "No Trx": String(r.no_trx || ""),
                        Tanggal: String(r.tgl_trx || ""),
                        Kategori: titleCaseWords(String(r.kategori || "")),
                        Keterangan: String(r.keterangan || ""),
                        "Jumlah In": Number(r.jumlah_in ?? 0),
                        "Jumlah Out": Number(r.jumlah_out ?? 0),
                        "Saldo Berjalan": Number(r.saldo_berjalan ?? 0),
                      })),
                    });
                    toast.success("Export Excel berhasil");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal export Excel");
                  }
                }}
              >
                <Download className="w-4 h-4 mr-1.5" /> Excel
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await exportToPdf({
                      filename: "laporan-keuangan-detail.pdf",
                      title: "Laporan Keuangan Detail",
                      columns: ["No Trx", "Tanggal", "Kategori", "Keterangan", "Jumlah In", "Jumlah Out", "Saldo Berjalan"],
                      rows: rows.map((r) => [
                        String(r.no_trx || ""),
                        String(r.tgl_trx || ""),
                        titleCaseWords(String(r.kategori || "")),
                        String(r.keterangan || ""),
                        String(r.jumlah_in ?? 0),
                        String(r.jumlah_out ?? 0),
                        String(r.saldo_berjalan ?? 0),
                      ]),
                    });
                    toast.success("Export PDF berhasil");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal export PDF");
                  }
                }}
              >
                <Download className="w-4 h-4 mr-1.5" /> PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <Table className="border border-border">
            <TableHeader>
              <TableRow>
                <TableHead>No Trx</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">In</TableHead>
                <TableHead className="text-right">Out</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{r.no_trx}</TableCell>
                  <TableCell>{r.tgl_trx ? formatDate(r.tgl_trx) : "—"}</TableCell>
                  <TableCell>{r.kategori ? titleCaseWords(r.kategori) : "—"}</TableCell>
                  <TableCell className="max-w-[420px] truncate">{r.keterangan || "—"}</TableCell>
                  <TableCell className="text-right">{formatIDR(Number(r.jumlah_in) || 0)}</TableCell>
                  <TableCell className="text-right">{formatIDR(Number(r.jumlah_out) || 0)}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{formatIDR(Number(r.saldo_berjalan) || 0)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
};

export default KeuanganDetailReport;
