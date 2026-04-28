import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { formatIDR } from "@/lib/mockData";
import { useClients } from "@/lib/dataStore";
import { exportToExcel, exportToPdf } from "@/lib/exporters";
import { reportPayments } from "@/lib/api";
import { statusLabel } from "@/lib/labels";

const PaymentsReport = () => {
  const clients = useClients();
  const clientOptions = useMemo(
    () => clients.filter((c) => c.code).map((c) => ({ code: c.code!, label: `${c.code} · ${c.name} & ${c.partner}` })),
    [clients]
  );

  const today = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  const defaultTo = toISO(today);
  const dFrom = new Date(today);
  dFrom.setDate(dFrom.getDate() - 30);
  const defaultFrom = toISO(dFrom);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [status, setStatus] = useState("all");
  const [client, setClient] = useState("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await reportPayments({
        tgl_from: from || undefined,
        tgl_to: to || undefined,
        status: status !== "all" ? status : undefined,
        kode_client: client !== "all" ? client : undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan pembayaran");
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
      <PageHeader title="Laporan Pembayaran Klien" subtitle={`${rows.length} baris`} />
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid lg:grid-cols-6 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Dari</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sampai</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="lunas">lunas</SelectItem>
                  <SelectItem value="belum">belum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label>Client</Label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {clientOptions.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={load} disabled={loading}>
                {loading ? "Memuat..." : "Filter"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await exportToExcel({
                      filename: "laporan-pembayaran-klien.xlsx",
                      sheetName: "Pembayaran",
                      rows: rows.map((r) => ({
                        "Kode Booking": String(r.kode_booking || "").toUpperCase(),
                        "Kode Client": String(r.kode_client || ""),
                        "Nama Client": String(r.nama_client || ""),
                        "Total Tagihan": formatIDR(Number(r.total_tagihan ?? 0)),
                        DP: formatIDR(Number(r.DP ?? 0)),
                        Cicilan: formatIDR(Number(r.cicilan ?? 0)),
                        "Sisa Pembayaran": formatIDR(Number(r.sisa_pembayaran ?? 0)),
                        Status: statusLabel(String(r.status_pembayaran || "")),
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
                      filename: "laporan-pembayaran-klien.pdf",
                      title: "Laporan Pembayaran Klien",
                      columns: ["Kode Booking", "Kode Client", "Nama Client", "Total Tagihan", "DP", "Cicilan", "Sisa Pembayaran", "Status"],
                      rows: rows.map((r) => [
                        String(r.kode_booking || "").toUpperCase(),
                        String(r.kode_client || ""),
                        String(r.nama_client || ""),
                        formatIDR(Number(r.total_tagihan ?? 0)),
                        formatIDR(Number(r.DP ?? 0)),
                        formatIDR(Number(r.cicilan ?? 0)),
                        formatIDR(Number(r.sisa_pembayaran ?? 0)),
                        statusLabel(String(r.status_pembayaran || "")),
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
                <TableHead>Kode Booking</TableHead>
                <TableHead>Kode Client</TableHead>
                <TableHead>Nama Client</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">DP</TableHead>
                <TableHead className="text-right">Cicilan</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{String(r.kode_booking || "").toUpperCase()}</TableCell>
                  <TableCell>{r.kode_client || "—"}</TableCell>
                  <TableCell>{r.nama_client || "—"}</TableCell>
                  <TableCell className="text-right">{formatIDR(Number(r.total_tagihan) || 0)}</TableCell>
                  <TableCell className="text-right">{formatIDR(Number(r.DP) || 0)}</TableCell>
                  <TableCell className="text-right">{formatIDR(Number(r.cicilan) || 0)}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{formatIDR(Number(r.sisa_pembayaran) || 0)}</TableCell>
                  <TableCell>{r.status_pembayaran ? statusLabel(r.status_pembayaran) : "—"}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
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

export default PaymentsReport;
