import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { formatIDR } from "@/lib/mockData";
import { exportToExcel, exportToPdf } from "@/lib/exporters";
import { reportKeuanganRekap } from "@/lib/api";
import { titleCaseWords } from "@/lib/labels";

const KeuanganRekapReport = () => {
  const today = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  const defaultTo = toISO(today);
  const dFrom = new Date(today);
  dFrom.setDate(dFrom.getDate() - 30);
  const defaultFrom = toISO(dFrom);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const [data, setData] = useState<any>({ data: [], summary: null });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const totalPages = Math.ceil((data?.data?.length || 0) / perPage);
  const pagedList = (data?.data || []).slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [perPage, from, to]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await reportKeuanganRekap({
        tgl_from: from || undefined,
        tgl_to: to || undefined,
      });
      setData(res || { data: [], summary: null });
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan keuangan rekap");
      setData({ data: [], summary: null });
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
      <PageHeader title="Laporan Keuangan Rekap" subtitle={`${(data?.data || []).length} kategori`} />
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid lg:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Dari</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sampai</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2 justify-end lg:col-span-2">
              <Button className="bg-primary hover:bg-primary/90" onClick={load} disabled={loading}>
                {loading ? "Memuat..." : "Cari Data"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await exportToExcel({
                      filename: "laporan-keuangan-rekap.xlsx",
                      sheetName: "Keuangan Rekap",
                      rows: (data?.data || []).map((r: any) => ({
                        Kategori: titleCaseWords(String(r.kategori || "")),
                        "Total In": formatIDR(Number(r.total_in ?? 0)),
                        "Total Out": formatIDR(Number(r.total_out ?? 0)),
                        Saldo: formatIDR(Number(r.saldo ?? 0)),
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
                      filename: "laporan-keuangan-rekap.pdf",
                      title: "Laporan Keuangan Rekap",
                      columns: ["Kategori", "Total In", "Total Out", "Saldo"],
                      rows: (data?.data || []).map((r: any) => [
                        titleCaseWords(String(r.kategori || "")),
                        formatIDR(Number(r.total_in ?? 0)),
                        formatIDR(Number(r.total_out ?? 0)),
                        formatIDR(Number(r.saldo ?? 0)),
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
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Card className="p-4 border-border shadow-soft bg-gradient-card">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Pemasukan</div>
              <div className="font-display text-2xl text-success mt-2">{formatIDR(Number(data?.summary?.total_pemasukan) || 0)}</div>
            </Card>
            <Card className="p-4 border-border shadow-soft bg-gradient-card">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Pengeluaran</div>
              <div className="font-display text-2xl text-primary mt-2">{formatIDR(Number(data?.summary?.total_pengeluaran) || 0)}</div>
            </Card>
            <Card className="p-4 border-border shadow-soft bg-gradient-card">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Saldo Akhir</div>
              <div className="font-display text-2xl mt-2">{formatIDR(Number(data?.summary?.saldo_akhir) || 0)}</div>
            </Card>
          </div>

          <Table className="border border-border">
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Total In</TableHead>
                <TableHead className="text-right">Total Out</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((r: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{r.kategori ? titleCaseWords(r.kategori) : "—"}</TableCell>
                  <TableCell className="text-right">{formatIDR(Number(r.total_in) || 0)}</TableCell>
                  <TableCell className="text-right">{formatIDR(Number(r.total_out) || 0)}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{formatIDR(Number(r.saldo) || 0)}</TableCell>
                </TableRow>
              ))}
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">Tampilkan</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm">per halaman</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            &lt;
          </Button>
          <span className="text-sm">Halaman {page} dari {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
            &gt;
          </Button>
        </div>
      </div>
    </>
  );
};

export default KeuanganRekapReport;
