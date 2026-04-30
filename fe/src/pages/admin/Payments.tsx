import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { store, useClients, usePayments } from "@/lib/dataStore";
import { formatDate, formatIDR } from "@/lib/mockData";
import { PaymentFormDialog } from "@/components/dialogs/PaymentFormDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { statusLabel } from "@/lib/labels";

const Payments = ({
  filterClientCode,
  readOnly = false,
}: {
  filterClientCode?: string;
  readOnly?: boolean;
}) => {
  const payments = usePayments();
  const clients = useClients();
  const bookings = useMemo(() => {
    // Ambil semua booking, mapping by code untuk lookup cepat
    const all = store.getBookings ? store.getBookings() : [];
    const map = new Map();
    for (const b of all) {
      if (b.code) map.set(b.code, b);
    }
    return map;
  }, []);

  const [kodeBooking, setKodeBooking] = useState<string>("all");
  const [kodeClient, setKodeClient] = useState<string>(filterClientCode || "all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState<string>("");

  const clientOptions = useMemo(
    () => clients.filter((c) => c.code).map((c) => ({ code: c.code!, label: `${c.code} · ${c.name} & ${c.partner}` })),
    [clients]
  );


  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const list = payments.filter((p) => {
    // Filter booking: hanya yang approved dan event belum selesai
    const b = bookings.get(p.bookingCode);
    if (!b) return false;
    if (!(
      (b.statusBooking === "approved" || b.reviewStatus === "approved") &&
      (b.eventStatus !== "selesai" && b.eventStatus !== "batal")
    )) return false;
    if (kodeBooking !== "all" && p.bookingCode !== kodeBooking) return false;
    if (kodeClient !== "all" && p.clientCode !== kodeClient) return false;
    if (status !== "all") {
      const st = String(p.status || "");
      if (st !== status) return false;
    }
    if (q) {
      const hay = `${p.code} ${p.bookingCode} ${p.clientName} ${p.clientCode}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const totalPages = Math.ceil(list.length / perPage);
  const pagedList = list.slice((page - 1) * perPage, page * perPage);

  // Reset page ke 1 jika filter berubah
  useMemo(() => { setPage(1); }, [kodeBooking, kodeClient, status, q, perPage]);

  const totalPaid = list.reduce((s, p) => s + p.amountPaid, 0);
  // Sisa tagihan dihitung per booking: ambil sisa terakhir dari masing-masing kode_booking (bukan akumulasi semua transaksi)
  const latestRemainingByBooking = useMemo(() => {
    const map = new Map<string, { paidDate: string; remaining: number }>();
    for (const p of list) {
      const kb = String(p.bookingCode || "");
      if (!kb) continue;
      const cur = map.get(kb);
      const nextDate = String(p.paidDate || "");
      if (!cur || nextDate > cur.paidDate) {
        map.set(kb, { paidDate: nextDate, remaining: Number(p.remaining) || 0 });
      }
    }
    return map;
  }, [list]);
  const totalRemaining = Array.from(latestRemainingByBooking.values()).reduce((s, x) => s + (Number(x.remaining) || 0), 0);

  return (
    <>
      <PageHeader
        title="Pembayaran"
        subtitle={`${list.length} transaksi pembayaran`}
        actions={
          readOnly ? undefined : (
            <PaymentFormDialog
              mode="add"
              trigger={
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1.5" /> Input Pembayaran
                </Button>
              }
            />
          )
        }
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Diterima</div>
          <div className="font-display text-3xl text-success mt-2">{formatIDR(totalPaid)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Sisa Tagihan (per booking)</div>
          <div className="font-display text-3xl text-primary mt-2">{formatIDR(totalRemaining)}</div>
        </Card>
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Kode Booking</Label>
              <Input value={kodeBooking === "all" ? "" : kodeBooking} onChange={(e) => setKodeBooking(e.target.value ? e.target.value : "all")} placeholder="BK-..." />
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={kodeClient} onValueChange={setKodeClient}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {clientOptions.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="DP">{statusLabel("DP")}</SelectItem>
                  <SelectItem value="cicilan">{statusLabel("cicilan")}</SelectItem>
                  <SelectItem value="lunas">{statusLabel("lunas")}</SelectItem>
                  <SelectItem value="belum_bayar">{statusLabel("belum_bayar")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kode / booking / client..." />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Kode</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead>Status</TableHead>
                {readOnly ? null : <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">{p.code}</TableCell>
                  <TableCell>{p.bookingCode}</TableCell>
                  <TableCell>
                    <div>{p.clientName}</div>
                    <div className="text-xs text-muted-foreground">{p.clientCode}</div>
                  </TableCell>
                  <TableCell>{formatDate(p.paidDate)}</TableCell>
                  <TableCell>{p.method.toUpperCase()}</TableCell>
                  <TableCell>{p.paymentType || "—"}</TableCell>
                  <TableCell className="text-right">{formatIDR(p.amountPaid)}</TableCell>
                  <TableCell className="text-right">{formatIDR(p.remaining)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  {readOnly ? null : (
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <PaymentFormDialog
                          mode="edit"
                          initial={p}
                          trigger={
                            <Button size="icon" variant="outline">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <ConfirmActionDialog
                          title="Hapus pembayaran?"
                          description="Transaksi pembayaran akan dihapus, dan keuangan terkait juga ikut dibatalkan."
                          confirmText="Hapus"
                          onConfirm={async () => {
                            try {
                              await store.deletePayment(p.id);
                              toast.success("Pembayaran berhasil dihapus");
                            } catch (err: any) {
                              toast.error(err?.message || "Gagal menghapus pembayaran");
                            }
                          }}
                          trigger={
                            <Button size="icon" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 9 : 10} className="text-center text-muted-foreground py-10">
                    Belum ada transaksi pembayaran.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Tampilkan</span>
          <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
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

export default Payments;
