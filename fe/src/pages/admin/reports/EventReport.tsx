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
import { formatDate } from "@/lib/mockData";
import { usePackages } from "@/lib/dataStore";
import { exportToExcel, exportToPdf } from "@/lib/exporters";
import { reportEvents } from "@/lib/api";

const EventReport = () => {
  const packages = usePackages();
  const paketOptions = useMemo(() => packages.map((p) => ({ id: p.id, name: p.name })), [packages]);

  const today = new Date().toISOString().slice(0, 10);
  const [evtFrom, setEvtFrom] = useState(today);
  const [evtTo, setEvtTo] = useState(today);
  const [evtStatus, setEvtStatus] = useState("all");
  const [evtPaket, setEvtPaket] = useState("all");
  const [evtPic, setEvtPic] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await reportEvents({
        tgl_from: evtFrom || undefined,
        tgl_to: evtTo || undefined,
        status_event: evtStatus !== "all" ? evtStatus : undefined,
        paket_id: evtPaket !== "all" ? evtPaket : undefined,
        pic: evtPic || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan event");
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
      <PageHeader title="Laporan Event" subtitle={`${rows.length} baris`} />
      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid lg:grid-cols-6 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Dari</Label>
              <Input type="date" value={evtFrom} onChange={(e) => setEvtFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sampai</Label>
              <Input type="date" value={evtTo} onChange={(e) => setEvtTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={evtStatus} onValueChange={setEvtStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="aktif">aktif</SelectItem>
                  <SelectItem value="selesai">selesai</SelectItem>
                  <SelectItem value="batal">batal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Paket</Label>
              <Select value={evtPaket} onValueChange={setEvtPaket}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {paketOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>PIC</Label>
              <Input value={evtPic} onChange={(e) => setEvtPic(e.target.value)} placeholder="Nama PIC" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={load} disabled={loading}>
                {loading ? "Memuat..." : "Filter"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await exportToExcel({ filename: "laporan-event.xlsx", sheetName: "Event", rows });
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
                      filename: "laporan-event.pdf",
                      title: "Laporan Event",
                      columns: ["kode_booking", "kode_client", "nama_client", "tanggal_acara", "paket", "status_event", "progress_percent", "pic"],
                      rows: rows.map((r) => [
                        String(r.kode_booking || ""),
                        String(r.kode_client || ""),
                        String(r.nama_client || ""),
                        String(r.tanggal_acara || ""),
                        String(r.paket || ""),
                        String(r.status_event || ""),
                        String(r.progress_percent ?? ""),
                        String(r.pic || ""),
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Booking</TableHead>
                <TableHead>Kode Client</TableHead>
                <TableHead>Nama Client</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Progress</TableHead>
                <TableHead>PIC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{String(r.kode_booking || "").toUpperCase()}</TableCell>
                  <TableCell>{r.kode_client || "—"}</TableCell>
                  <TableCell>{r.nama_client || "—"}</TableCell>
                  <TableCell>{r.tanggal_acara ? formatDate(r.tanggal_acara) : "—"}</TableCell>
                  <TableCell>{r.paket || "—"}</TableCell>
                  <TableCell className="capitalize">{r.status_event || "—"}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{r.progress_percent ?? 0}%</TableCell>
                  <TableCell>{r.pic || "—"}</TableCell>
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

export default EventReport;

