import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { ambilWaLog, resendWaLog } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/mockData";
import { RefreshCcw, FileText } from "lucide-react";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

export default function WhatsAppLog() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [resendingId, setResendingId] = useState<string>("");

  async function refresh() {
    setLoading(true);
    try {
      const data = await ambilWaLog({
        status_kirim: filterStatus === "all" ? undefined : filterStatus,
        jenis_notifikasi: filterJenis === "all" ? undefined : filterJenis,
      } as any);
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setRows([]);
      toast.error(err?.message || "Gagal mengambil WhatsApp log");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterJenis]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay = `${r.kode_booking || ""} ${r.kode_client || ""} ${r.no_hp_tujuan || ""} ${r.jenis_notifikasi || ""} ${r.status_kirim || ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q]);

  return (
    <>
      <PageHeader
        title="WhatsApp Log"
        subtitle="Riwayat pengiriman notifikasi WhatsApp + PDF"
        actions={
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCcw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        }
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 grid sm:grid-cols-4 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Cari</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kode booking / client / no hp..." />
          </div>
          <div className="space-y-1.5">
            <Label>Jenis</Label>
            <Select value={filterJenis} onValueChange={setFilterJenis}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="booking_status">Booking Status</SelectItem>
                <SelectItem value="pembayaran">Pembayaran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status Kirim</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Kode Booking</TableHead>
                <TableHead>Kode Client</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="text-right w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const id = String(r._id || r.id);
                  const pdfUrl = r.file_pdf ? `${API_ORIGIN}${String(r.file_pdf)}` : "";
                  return (
                    <TableRow key={id}>
                      <TableCell>{formatDate(String(r.createdAt || "").slice(0, 10) || "") || "—"}</TableCell>
                      <TableCell className="font-medium">{String(r.kode_booking || "—").toUpperCase()}</TableCell>
                      <TableCell>{String(r.kode_client || "—").toUpperCase()}</TableCell>
                      <TableCell>{r.no_hp_tujuan || "—"}</TableCell>
                      <TableCell>{r.jenis_notifikasi === "booking_status" ? "Booking Status" : "Pembayaran"}</TableCell>
                      <TableCell>{statusLabel(String(r.status_kirim || ""))}</TableCell>
                      <TableCell>
                        {pdfUrl ? (
                          <a className="inline-flex items-center gap-1 text-primary hover:underline" href={pdfUrl} target="_blank" rel="noreferrer">
                            <FileText className="w-4 h-4" /> PDF
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {String(r.status_kirim) === "failed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={resendingId === id}
                            onClick={async () => {
                              try {
                                setResendingId(id);
                                await resendWaLog(id);
                                toast.success("Resend diproses");
                                await refresh();
                              } catch (err: any) {
                                toast.error(err?.message || "Gagal resend");
                              } finally {
                                setResendingId("");
                              }
                            }}
                          >
                            {resendingId === id ? "Resending..." : "Resend"}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">{r.error_message ? "Ada error" : "—"}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}

