import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, usePackages } from "@/lib/dataStore";
import { formatDate, formatIDR } from "@/lib/mockData";
import { statusLabel } from "@/lib/labels";
import { useMemo, useState } from "react";

const HISTORY_STATUSES = ["cancelled", "completed", "rejected"] as const;
type HistoryStatus = (typeof HISTORY_STATUSES)[number];

function inDateRange(value: string, from?: string, to?: string) {
  const v = String(value || "");
  if (!v) return false;
  if (from && v < from) return false;
  if (to && v > to) return false;
  return true;
}

export default function BookingHistory() {
  const { user } = useAuth();
  const bookings = useBookings();
  const packages = usePackages();

  const clientId = user?.clientId || "";

  const rows = useMemo(() => {
    return bookings
      .filter((b) => b.clientId === clientId)
      .filter((b) => HISTORY_STATUSES.includes(String(b.statusBooking || "") as any))
      .sort((a, b) => String(b.eventDate || "").localeCompare(String(a.eventDate || "")));
  }, [bookings, clientId]);

  const [statusFilter, setStatusFilter] = useState<"all" | HistoryStatus>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((b) => {
      const st = String(b.statusBooking || "") as any;
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if ((dateFrom || dateTo) && !inDateRange(String(b.eventDate || ""), dateFrom || undefined, dateTo || undefined)) return false;

      if (!q) return true;
      const pkgName =
        String(b.packageSnapshot?.name || "") ||
        String(packages.find((p) => p.id === b.packageId)?.name || "");
      const hay = [
        String(b.code || ""),
        String(b.eventDate || ""),
        String(b.venue || ""),
        pkgName,
        statusLabel(st),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, statusFilter, dateFrom, dateTo, search, packages]);

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(() => filtered.find((b) => b.id === selectedId) || rows.find((b) => b.id === selectedId), [filtered, rows, selectedId]);
  const selectedPackage = useMemo(() => {
    if (!selected) return undefined;
    return packages.find((p) => p.id === selected.packageId);
  }, [packages, selected]);

  const selectedPrice = useMemo(() => {
    if (!selected) return 0;
    return (
      Number(selected.hargaFinalBooking) ||
      Number(selected.hargaPaketFinal) ||
      Number(selected.hargaPaketEstimasi) ||
      Number(selected.packageSnapshot?.price) ||
      Number(selectedPackage?.price) ||
      0
    );
  }, [selected, selectedPackage]);

  return (
    <>
      <PageHeader title="Riwayat Booking" subtitle="Booking yang sudah selesai, dibatalkan, atau ditolak." />

      <Card className="border-border shadow-soft p-6 mb-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger><SelectValue placeholder="Semua status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal Dari</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal Sampai</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Search</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kode booking / paket / tanggal / lokasi" />
          </div>
        </div>
      </Card>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="font-medium">List Riwayat</div>
          <div className="text-sm text-muted-foreground">Total: {filtered.length} booking</div>
        </div>
        <div className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Booking</TableHead>
                <TableHead>Tanggal Acara</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => {
                const pkgName =
                  String(b.packageSnapshot?.name || "") ||
                  String(packages.find((p) => p.id === b.packageId)?.name || "—");
                const price =
                  Number(b.hargaFinalBooking) ||
                  Number(b.hargaPaketFinal) ||
                  Number(b.hargaPaketEstimasi) ||
                  Number(b.packageSnapshot?.price) ||
                  Number(packages.find((p) => p.id === b.packageId)?.price) ||
                  0;
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{String(b.code || b.id).toUpperCase()}</TableCell>
                    <TableCell>{formatDate(b.eventDate)}</TableCell>
                    <TableCell>{pkgName}</TableCell>
                    <TableCell>{statusLabel(String(b.statusBooking || "menunggu_review"))}</TableCell>
                    <TableCell className="text-right">{formatIDR(price)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedId(b.id);
                          setOpen(true);
                        }}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Belum ada riwayat booking.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Detail Booking</DialogTitle>
          </DialogHeader>
          {!selected ? (
            <div className="text-sm text-muted-foreground">Data booking tidak ditemukan.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Kode Booking</div>
                <div className="font-medium">{String(selected.code || selected.id).toUpperCase()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="font-medium">{statusLabel(String(selected.statusBooking || "menunggu_review"))}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Tanggal Acara</div>
                <div className="font-medium">{formatDate(selected.eventDate)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="font-medium">{selected.venue || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Paket</div>
                <div className="font-medium">{selected.packageSnapshot?.name || selectedPackage?.name || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Harga</div>
                <div className="font-medium text-primary">{formatIDR(selectedPrice)}</div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <div className="text-xs text-muted-foreground">Catatan</div>
                <div className="font-medium whitespace-pre-wrap">{selected.note || "—"}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

