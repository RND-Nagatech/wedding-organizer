import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useClients, usePackages, usePayments } from "@/lib/dataStore";
import { formatDate, formatIDR } from "@/lib/mockData";
import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { statusLabel } from "@/lib/labels";

function pickDefaultBookingId(bookings: any[]) {
  const rows = bookings
    .filter((b) => (b.eventStatus || "draft") !== "batal")
    .sort((a, b) => String(b.eventDate || "").localeCompare(String(a.eventDate || "")));
  return rows[0]?.id || "";
}

export default function ClientPayments() {
  const { user } = useAuth();
  const bookings = useBookings();
  const clients = useClients();
  const packages = usePackages();
  const payments = usePayments();

  const myBookings = useMemo(() => bookings.filter((b) => b.clientId === (user?.clientId || "") && b.code), [bookings, user?.clientId]);
  const [bookingId, setBookingId] = useState<string>(() => pickDefaultBookingId(myBookings));

  useEffect(() => {
    if (bookingId) return;
    const next = pickDefaultBookingId(myBookings);
    if (next) setBookingId(next);
  }, [bookingId, myBookings]);

  const booking = myBookings.find((b) => b.id === bookingId) || myBookings[0];
  const bookingCode = String(booking?.code || "");
  const client = clients.find((c) => c.id === booking?.clientId);
  const pkg = packages.find((p) => p.id === booking?.packageId);

  const totalTagihan = booking?.packageSnapshot?.price ?? pkg?.price ?? 0;
  const rows = useMemo(() => {
    if (!bookingCode) return [];
    return payments
      .filter((p) => String(p.bookingCode || "") === bookingCode)
      .sort((a, b) => String(b.paidDate || "").localeCompare(String(a.paidDate || "")));
  }, [payments, bookingCode]);

  const totalPaid = rows.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
  const remaining = Math.max(totalTagihan - totalPaid, 0);

  return (
    <>
      <PageHeader
        title="Budget & Payment"
        subtitle={bookingCode ? `${bookingCode.toUpperCase()} · ${client ? `${client.name} & ${client.partner}` : "—"}` : "Belum ada booking"}
      />

      <Card className="border-border shadow-soft p-6 mb-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Pilih Booking</Label>
            <Select value={bookingId || ""} onValueChange={setBookingId}>
              <SelectTrigger><SelectValue placeholder="Pilih booking" /></SelectTrigger>
              <SelectContent>
                {myBookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {(b.code || b.id).toUpperCase()} · {formatDate(b.eventDate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status Booking</Label>
            <div className="h-10 rounded-md border border-border px-3 flex items-center">
              <span className="text-sm font-medium">{statusLabel(booking?.reviewStatus || "menunggu_review")}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Paket</div>
          <div className="font-display text-2xl mt-2">{formatIDR(totalTagihan)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Terbayar</div>
          <div className="font-display text-2xl text-success mt-2">{formatIDR(totalPaid)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Sisa Tagihan</div>
          <div className="font-display text-2xl text-primary mt-2">{formatIDR(remaining)}</div>
        </Card>
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="font-medium">Riwayat Pembayaran</div>
          <div className="text-sm text-muted-foreground">Hanya transaksi untuk booking aktif yang dipilih.</div>
        </div>
        <div className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-right">Sisa Setelah Bayar</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{String(p.code || "").toUpperCase()}</TableCell>
                  <TableCell>{formatDate(p.paidDate)}</TableCell>
                  <TableCell>{String(p.method || "").toUpperCase()}</TableCell>
                  <TableCell>{p.paymentType || "—"}</TableCell>
                  <TableCell className="text-right">{formatIDR(p.amountPaid)}</TableCell>
                  <TableCell className="text-right">{formatIDR(p.remaining)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Belum ada pembayaran untuk booking ini.
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
