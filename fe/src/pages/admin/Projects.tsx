import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookings, usePackages } from "@/lib/dataStore";
import { formatDate } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { statusLabel } from "@/lib/labels";

export default function Projects() {
  const bookings = useBookings();
  const packages = usePackages();

  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reviewStatus, setReviewStatus] = useState<string>("all");
  const [eventStatus, setEventStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    return bookings
      .filter((b) => (b.eventStatus || "draft") !== "batal")
      .filter((b) => {
        if (reviewStatus !== "all" && String(b.reviewStatus || "menunggu_review") !== reviewStatus) return false;
        if (eventStatus !== "all" && String(b.eventStatus || "draft") !== eventStatus) return false;
        if (dateFrom && String(b.eventDate || "") < dateFrom) return false;
        if (dateTo && String(b.eventDate || "") > dateTo) return false;
        if (q.trim()) {
          const pkg = packages.find((p) => p.id === b.packageId);
          const pkgName = b.packageSnapshot?.name || pkg?.name || "-";
          const hay = `${b.code || ""} ${b.clientName || ""} ${b.eventDate || ""} ${b.venue || ""} ${pkgName}`.toLowerCase();
          if (!hay.includes(q.trim().toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")));
  }, [bookings, packages, q, dateFrom, dateTo, reviewStatus, eventStatus]);

  const totalPages = Math.ceil(filteredRows.length / perPage);
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);

  // Reset page to 1 if filter changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { setPage(1); }, [q, dateFrom, dateTo, reviewStatus, eventStatus, perPage]);

  return (
    <>
      <PageHeader title="Project Management" subtitle={`${filteredRows.length} project`} />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid sm:grid-cols-5 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Search</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kode booking / client / lokasi / paket..." />
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
              <Label>Status Review</Label>
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="menunggu_review">{statusLabel("menunggu_review")}</SelectItem>
                  <SelectItem value="approved">{statusLabel("approved")}</SelectItem>
                  <SelectItem value="rejected">{statusLabel("rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status Event</Label>
              <Select value={eventStatus} onValueChange={setEventStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="draft">{statusLabel("draft")}</SelectItem>
                  <SelectItem value="aktif">{statusLabel("aktif")}</SelectItem>
                  <SelectItem value="selesai">{statusLabel("selesai")}</SelectItem>
                  <SelectItem value="batal">{statusLabel("batal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Kode Booking</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Status Review</TableHead>
                <TableHead>Status Event</TableHead>
                <TableHead className="text-right w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.map((b) => {
                const pkg = packages.find((p) => p.id === b.packageId);
                const pkgName = b.packageSnapshot?.name || pkg?.name || "-";
                return (
                  <TableRow key={b.id} className="hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">{(b.code || b.id).toUpperCase()}</TableCell>
                    <TableCell>{b.clientName || "—"}</TableCell>
                    <TableCell>{formatDate(b.eventDate)}</TableCell>
                    <TableCell className="text-primary font-medium">{pkgName}</TableCell>
                    <TableCell>{statusLabel(b.reviewStatus || "menunggu_review")}</TableCell>
                    <TableCell>{statusLabel(b.eventStatus || "draft")}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="icon" variant="outline">
                        <Link to={`/admin/projects/${b.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Belum ada project.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 pt-0">
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
      </Card>
    </>
  );
}
