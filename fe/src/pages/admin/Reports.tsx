import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { formatDate, formatIDR } from "@/lib/mockData";
import { useClients, usePackages } from "@/lib/dataStore";
import { exportToExcel, exportToPdf } from "@/lib/exporters";
import { reportEvents, reportKeuanganDetail, reportKeuanganRekap, reportPayments } from "@/lib/api";
import { statusLabel, titleCaseWords } from "@/lib/labels";

const Reports = () => {
  const clients = useClients();
  const packages = usePackages();

  // Event report
  const [evtFrom, setEvtFrom] = useState("");
  const [evtTo, setEvtTo] = useState("");
  const [evtStatus, setEvtStatus] = useState("all");
  const [evtPaket, setEvtPaket] = useState("all");
  const [evtPic, setEvtPic] = useState("");
  const [evtRows, setEvtRows] = useState<any[]>([]);
  const [evtLoading, setEvtLoading] = useState(false);

  // Payment report
  const [payFrom, setPayFrom] = useState("");
  const [payTo, setPayTo] = useState("");
  const [payStatus, setPayStatus] = useState("all");
  const [payClient, setPayClient] = useState("all");
  const [payRows, setPayRows] = useState<any[]>([]);
  const [payLoading, setPayLoading] = useState(false);

  // Keuangan detail
  const [kFrom, setKFrom] = useState("");
  const [kTo, setKTo] = useState("");
  const [kKat, setKKat] = useState("all");
  const [kRows, setKRows] = useState<any[]>([]);
  const [kLoading, setKLoading] = useState(false);

  // Keuangan rekap
  const [krFrom, setKrFrom] = useState("");
  const [krTo, setKrTo] = useState("");
  const [krData, setKrData] = useState<any>({ data: [], summary: null });
  const [krLoading, setKrLoading] = useState(false);

  const clientOptions = useMemo(
    () => clients.filter((c) => c.code).map((c) => ({ code: c.code!, label: `${c.code} · ${c.name} & ${c.partner}` })),
    [clients]
  );

  const paketOptions = useMemo(() => packages.map((p) => ({ id: p.id, name: p.name })), [packages]);

  const evtPicOptions = useMemo(() => {
    const set = new Set<string>();
    evtRows.forEach((r) => {
      if (r.pic) set.add(String(r.pic));
    });
    return Array.from(set).sort();
  }, [evtRows]);

  const loadEvents = async () => {
    try {
      setEvtLoading(true);
      const data = await reportEvents({
        tgl_from: evtFrom || undefined,
        tgl_to: evtTo || undefined,
        status_event: evtStatus !== "all" ? evtStatus : undefined,
        paket_id: evtPaket !== "all" ? evtPaket : undefined,
        pic: evtPic || undefined,
      });
      setEvtRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan event");
      setEvtRows([]);
    } finally {
      setEvtLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setPayLoading(true);
      const data = await reportPayments({
        tgl_from: payFrom || undefined,
        tgl_to: payTo || undefined,
        status: payStatus !== "all" ? payStatus : undefined,
        kode_client: payClient !== "all" ? payClient : undefined,
      });
      setPayRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan pembayaran");
      setPayRows([]);
    } finally {
      setPayLoading(false);
    }
  };

  const loadKeuanganDetail = async () => {
    try {
      setKLoading(true);
      const data = await reportKeuanganDetail({
        tgl_from: kFrom || undefined,
        tgl_to: kTo || undefined,
        kategori: kKat !== "all" ? kKat : undefined,
      });
      setKRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan keuangan detail");
      setKRows([]);
    } finally {
      setKLoading(false);
    }
  };

  const loadKeuanganRekap = async () => {
    try {
      setKrLoading(true);
      const data = await reportKeuanganRekap({
        tgl_from: krFrom || undefined,
        tgl_to: krTo || undefined,
      });
      setKrData(data || { data: [], summary: null });
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan keuangan rekap");
      setKrData({ data: [], summary: null });
    } finally {
      setKrLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    loadEvents();
    loadPayments();
    loadKeuanganDetail();
    loadKeuanganRekap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title="Laporan" subtitle="Event, pembayaran klien, dan keuangan" />

      <Tabs defaultValue="event">
        <TabsList className="mb-4">
          <TabsTrigger value="event">Laporan Event</TabsTrigger>
          <TabsTrigger value="payment">Pembayaran Klien</TabsTrigger>
          <TabsTrigger value="keu-detail">Keuangan Detail</TabsTrigger>
          <TabsTrigger value="keu-rekap">Keuangan Rekap</TabsTrigger>
        </TabsList>

        <TabsContent value="event">
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
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="batal">Batal</SelectItem>
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
                  <Button variant="outline" onClick={loadEvents} disabled={evtLoading}>
                    {evtLoading ? "Memuat..." : "Filter"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const rows = evtRows.map((r) => ({
                          "Kode Booking": String(r.kode_booking || "").toUpperCase(),
                          "Kode Client": String(r.kode_client || ""),
                          "Nama Client": String(r.nama_client || ""),
                          "Tanggal Acara": r.tanggal_acara ? formatDate(r.tanggal_acara) : "",
                          Paket: String(r.paket || ""),
                          "Status Event": statusLabel(String(r.status_event || "")),
                          Progress: `${Number(r.progress_percent ?? 0)}%`,
                          PIC: String(r.pic || ""),
                        }));
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
                          columns: ["Kode Booking", "Kode Client", "Nama Client", "Tanggal Acara", "Paket", "Status Event", "Progress", "PIC"],
                          rows: evtRows.map((r) => [
                            String(r.kode_booking || "").toUpperCase(),
                            String(r.kode_client || ""),
                            String(r.nama_client || ""),
                            r.tanggal_acara ? formatDate(r.tanggal_acara) : "",
                            String(r.paket || ""),
                            statusLabel(String(r.status_event || "")),
                            `${Number(r.progress_percent ?? 0)}%`,
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
              <Table className="border border-border">
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
                  {evtRows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{String(r.kode_booking || "").toUpperCase()}</TableCell>
                      <TableCell>{r.kode_client || "—"}</TableCell>
                      <TableCell>{r.nama_client || "—"}</TableCell>
                      <TableCell>{r.tanggal_acara ? formatDate(r.tanggal_acara) : "—"}</TableCell>
                      <TableCell>{r.paket || "—"}</TableCell>
                      <TableCell>{statusLabel(String(r.status_event || ""))}</TableCell>
                      <TableCell className="text-right font-medium text-primary">{r.progress_percent ?? 0}%</TableCell>
                      <TableCell>{r.pic || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {evtRows.length === 0 ? (
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
        </TabsContent>

        <TabsContent value="payment">
          <Card className="border-border shadow-soft overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="grid lg:grid-cols-6 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label>Dari</Label>
                  <Input type="date" value={payFrom} onChange={(e) => setPayFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sampai</Label>
                  <Input type="date" value={payTo} onChange={(e) => setPayTo(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={payStatus} onValueChange={setPayStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="lunas">Lunas</SelectItem>
                      <SelectItem value="belum">Belum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <Label>Client</Label>
                  <Select value={payClient} onValueChange={setPayClient}>
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
                  <Button variant="outline" onClick={loadPayments} disabled={payLoading}>
                    {payLoading ? "Memuat..." : "Filter"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const rows = payRows.map((r) => ({
                          "Kode Booking": String(r.kode_booking || "").toUpperCase(),
                          "Kode Client": String(r.kode_client || ""),
                          "Nama Client": String(r.nama_client || ""),
                          "Total Tagihan": Number(r.total_tagihan ?? 0),
                          DP: Number(r.DP ?? 0),
                          Cicilan: Number(r.cicilan ?? 0),
                          "Sisa Pembayaran": Number(r.sisa_pembayaran ?? 0),
                          Status: statusLabel(String(r.status_pembayaran || "")),
                        }));
                        await exportToExcel({ filename: "laporan-pembayaran-klien.xlsx", sheetName: "Pembayaran", rows });
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
                          rows: payRows.map((r) => [
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
                  {payRows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{String(r.kode_booking || "").toUpperCase()}</TableCell>
                      <TableCell>{r.kode_client || "—"}</TableCell>
                      <TableCell>{r.nama_client || "—"}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.total_tagihan) || 0)}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.DP) || 0)}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.cicilan) || 0)}</TableCell>
                      <TableCell className="text-right font-medium text-primary">{formatIDR(Number(r.sisa_pembayaran) || 0)}</TableCell>
                      <TableCell>{statusLabel(String(r.status_pembayaran || ""))}</TableCell>
                    </TableRow>
                  ))}
                  {payRows.length === 0 ? (
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
        </TabsContent>

        <TabsContent value="keu-detail">
          <Card className="border-border shadow-soft overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="grid lg:grid-cols-5 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label>Dari</Label>
                  <Input type="date" value={kFrom} onChange={(e) => setKFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sampai</Label>
                  <Input type="date" value={kTo} onChange={(e) => setKTo(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={kKat} onValueChange={setKKat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {["DP", "cicilan", "pelunasan", "vendor", "operasional", "lainnya"].map((k) => (
                        <SelectItem key={k} value={k}>{titleCaseWords(String(k))}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end lg:col-span-2">
                  <Button variant="outline" onClick={loadKeuanganDetail} disabled={kLoading}>
                    {kLoading ? "Memuat..." : "Filter"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const rows = kRows.map((r) => ({
                          "No Trx": String(r.no_trx || ""),
                          Tanggal: r.tgl_trx ? formatDate(r.tgl_trx) : "",
                          Kategori: titleCaseWords(String(r.kategori || "")),
                          Keterangan: String(r.keterangan || ""),
                          "Jumlah Masuk": Number(r.jumlah_in ?? 0),
                          "Jumlah Keluar": Number(r.jumlah_out ?? 0),
                          "Saldo Berjalan": Number(r.saldo_berjalan ?? 0),
                        }));
                        await exportToExcel({ filename: "laporan-keuangan-detail.xlsx", sheetName: "KeuanganDetail", rows });
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
                          columns: ["No Trx", "Tanggal", "Kategori", "Keterangan", "Jumlah Masuk", "Jumlah Keluar", "Saldo Berjalan"],
                          rows: kRows.map((r) => [
                            String(r.no_trx || ""),
                            r.tgl_trx ? formatDate(r.tgl_trx) : "",
                            titleCaseWords(String(r.kategori || "")),
                            String(r.keterangan || ""),
                            formatIDR(Number(r.jumlah_in ?? 0)),
                            formatIDR(Number(r.jumlah_out ?? 0)),
                            formatIDR(Number(r.saldo_berjalan ?? 0)),
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
                  {kRows.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{r.no_trx}</TableCell>
                      <TableCell>{r.tgl_trx ? formatDate(r.tgl_trx) : "—"}</TableCell>
                      <TableCell>{titleCaseWords(String(r.kategori || ""))}</TableCell>
                      <TableCell className="max-w-[420px] truncate">{r.keterangan || "—"}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.jumlah_in) || 0)}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.jumlah_out) || 0)}</TableCell>
                      <TableCell className="text-right font-medium text-primary">{formatIDR(Number(r.saldo_berjalan) || 0)}</TableCell>
                    </TableRow>
                  ))}
                  {kRows.length === 0 ? (
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
        </TabsContent>

        <TabsContent value="keu-rekap">
          <Card className="border-border shadow-soft overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="grid lg:grid-cols-4 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label>Dari</Label>
                  <Input type="date" value={krFrom} onChange={(e) => setKrFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sampai</Label>
                  <Input type="date" value={krTo} onChange={(e) => setKrTo(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end lg:col-span-2">
                  <Button variant="outline" onClick={loadKeuanganRekap} disabled={krLoading}>
                    {krLoading ? "Memuat..." : "Filter"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const rows = (krData?.data || []).map((r: any) => ({
                          Kategori: titleCaseWords(String(r.kategori || "")),
                          "Total Masuk": Number(r.total_in ?? 0),
                          "Total Keluar": Number(r.total_out ?? 0),
                          Saldo: Number(r.saldo ?? 0),
                        }));
                        await exportToExcel({ filename: "laporan-keuangan-rekap.xlsx", sheetName: "KeuanganRekap", rows });
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
                          columns: ["Kategori", "Total Masuk", "Total Keluar", "Saldo"],
                          rows: (krData?.data || []).map((r: any) => [
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
                  <div className="font-display text-2xl text-success mt-2">{formatIDR(Number(krData?.summary?.total_pemasukan) || 0)}</div>
                </Card>
                <Card className="p-4 border-border shadow-soft bg-gradient-card">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Pengeluaran</div>
                  <div className="font-display text-2xl text-primary mt-2">{formatIDR(Number(krData?.summary?.total_pengeluaran) || 0)}</div>
                </Card>
                <Card className="p-4 border-border shadow-soft bg-gradient-card">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Saldo Akhir</div>
                  <div className="font-display text-2xl mt-2">{formatIDR(Number(krData?.summary?.saldo_akhir) || 0)}</div>
                </Card>
              </div>

              <Table className="border border-border">
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Total Masuk</TableHead>
                    <TableHead className="text-right">Total Keluar</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(krData?.data || []).map((r: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{titleCaseWords(String(r.kategori || ""))}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.total_in) || 0)}</TableCell>
                      <TableCell className="text-right">{formatIDR(Number(r.total_out) || 0)}</TableCell>
                      <TableCell className="text-right font-medium text-primary">{formatIDR(Number(r.saldo) || 0)}</TableCell>
                    </TableRow>
                  ))}
                  {(krData?.data || []).length === 0 ? (
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
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Reports;
