import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { store, useBookings, useTimelineEvent, type TimelineEventTask } from "@/lib/dataStore";
import { formatDate } from "@/lib/mockData";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { statusLabel } from "@/lib/labels";

function TaskFormDialog({
  mode,
  initial,
  trigger,
  fixedKodeBooking,
}: {
  mode: "add" | "edit";
  initial?: TimelineEventTask;
  fixedKodeBooking?: string;
  trigger: React.ReactNode;
}) {
  const bookings = useBookings();
  const bookingOptions = useMemo(
    () =>
      bookings
        .map((b) => ({
          code: b.code || "",
          label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"}`,
        }))
        .filter((x) => x.code),
    [bookings]
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    nama_tugas: "",
    kategori_tugas: "",
    deadline: "",
    pic: "",
    status: "belum_dikerjakan",
    catatan: "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      kode_booking: fixedKodeBooking || initial?.kode_booking || bookingOptions[0]?.code || "",
      nama_tugas: initial?.nama_tugas || "",
      kategori_tugas: initial?.kategori_tugas || "",
      deadline: initial?.deadline || "",
      pic: initial?.pic || "",
      status: initial?.status || "belum_dikerjakan",
      catatan: initial?.catatan || "",
    });
  }, [open, initial, bookingOptions, fixedKodeBooking]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib diisi";
    if (!form.nama_tugas) next.nama_tugas = "Nama tugas wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        kode_booking: form.kode_booking,
        nama_tugas: form.nama_tugas,
        kategori_tugas: form.kategori_tugas || undefined,
        deadline: form.deadline || undefined,
        pic: form.pic || undefined,
        status: form.status,
        catatan: form.catatan || undefined,
      };
      if (mode === "add") {
        await store.addTimelineEventTask(payload);
        toast.success("Tugas berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateTimelineEventTask(initial.id, payload);
        toast.success("Tugas berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan tugas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "add" ? "Tambah Tugas Timeline" : "Edit Tugas Timeline"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <Select
                value={form.kode_booking}
                onValueChange={(v) => setForm((f: any) => ({ ...f, kode_booking: v }))}
                disabled={saving || Boolean(fixedKodeBooking)}
              >
                <SelectTrigger><SelectValue placeholder="Pilih booking" /></SelectTrigger>
                <SelectContent>
                  {bookingOptions.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kode_booking ? <div className="text-xs text-destructive">{errors.kode_booking}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f: any) => ({ ...f, status: v }))} disabled={saving}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum_dikerjakan">Belum dikerjakan</SelectItem>
                  <SelectItem value="proses">Proses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Tugas</Label>
              <Input value={form.nama_tugas} onChange={(e) => setForm((f: any) => ({ ...f, nama_tugas: e.target.value }))} disabled={saving} />
              {errors.nama_tugas ? <div className="text-xs text-destructive">{errors.nama_tugas}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Kategori Tugas (Opsional)</Label>
              <Input value={form.kategori_tugas} onChange={(e) => setForm((f: any) => ({ ...f, kategori_tugas: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Deadline (Opsional)</Label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm((f: any) => ({ ...f, deadline: e.target.value }))} disabled={saving} />
              {errors.deadline ? <div className="text-xs text-destructive">{errors.deadline}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>PIC (Opsional)</Label>
              <Input value={form.pic} onChange={(e) => setForm((f: any) => ({ ...f, pic: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (Opsional)</Label>
            <Textarea value={form.catatan} onChange={(e) => setForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={saving} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const Timeline = ({ bookingId }: { bookingId?: string }) => {
  const bookings = useBookings();
  const tasks = useTimelineEvent();

  const bookingOptions = useMemo(
    () =>
      bookings
        .map((b) => ({ id: b.id, code: b.code || "", label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"}` }))
        .filter((x) => x.code),
    [bookings]
  );

  const fixedBooking = bookingId ? bookings.find((b) => b.id === bookingId) : undefined;
  const [kodeBooking, setKodeBooking] = useState<string>("all");
  const [pic, setPic] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (fixedBooking?.code) setKodeBooking(fixedBooking.code);
  }, [fixedBooking?.code]);


  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = tasks.filter((t) => {
    const kb = fixedBooking?.code ? fixedBooking.code : kodeBooking !== "all" ? kodeBooking : null;
    if (kb && t.kode_booking !== kb) return false;
    if (pic !== "all" && (t.pic || "") !== pic) return false;
    if (status !== "all" && t.status !== status) return false;
    if (dateFrom || dateTo) {
      const d = String(t.deadline || "");
      // Jika filter deadline dipakai, task tanpa deadline tidak ikut.
      if (!d) return false;
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
    }
    if (q) {
      const hay = `${t.nama_tugas} ${t.kategori_tugas || ""} ${t.catatan || ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page ke 1 jika filter berubah
  useEffect(() => { setPage(1); }, [kodeBooking, pic, status, dateFrom, dateTo, q, perPage]);

  const selectedKodeBooking = fixedBooking?.code || (kodeBooking !== "all" ? kodeBooking : "");
  const selectedTasks = selectedKodeBooking ? tasks.filter((t) => t.kode_booking === selectedKodeBooking) : filtered;
  const done = selectedTasks.filter((t) => t.status === "selesai").length;
  const progress = selectedTasks.length ? Math.round((done / selectedTasks.length) * 100) : 0;

  const progressByBooking = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const t of tasks) {
      const cur = map.get(t.kode_booking) || { total: 0, done: 0 };
      cur.total += 1;
      if (t.status === "selesai") cur.done += 1;
      map.set(t.kode_booking, cur);
    }
    return Array.from(map.entries()).map(([kb, v]) => ({
      kode_booking: kb,
      total: v.total,
      done: v.done,
      percent: v.total ? Math.round((v.done / v.total) * 100) : 0,
    }));
  }, [tasks]);

  const picOptions = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.pic) set.add(t.pic);
    });
    return Array.from(set).sort();
  }, [tasks]);

  return (
    <>
      <PageHeader
        title="Timeline & Checklist Event"
        subtitle="Monitoring progress persiapan event"
        actions={
          <TaskFormDialog
            mode="add"
            fixedKodeBooking={selectedKodeBooking || undefined}
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah
              </Button>
            }
          />
        }
      />

      {/* Card progress per booking dihilangkan sesuai permintaan */}

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid sm:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <Select
                value={fixedBooking?.code ? fixedBooking.code : kodeBooking}
                onValueChange={setKodeBooking}
                disabled={Boolean(fixedBooking?.code)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {bookingOptions.map((b) => (
                    <SelectItem key={b.code} value={b.code}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>PIC</Label>
              <Select value={pic} onValueChange={setPic}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {picOptions.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
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
                  <SelectItem value="belum_dikerjakan">Belum dikerjakan</SelectItem>
                  <SelectItem value="proses">Proses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
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
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nama tugas / catatan..." />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Tugas</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{(t.kode_booking || "—").toUpperCase()}</TableCell>
                  <TableCell>{t.nama_tugas}</TableCell>
                  <TableCell>{t.kategori_tugas || "—"}</TableCell>
                  <TableCell>{t.deadline ? formatDate(t.deadline) : "—"}</TableCell>
                  <TableCell>{t.pic || "—"}</TableCell>
                  <TableCell>{statusLabel(String(t.status || ""))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <TaskFormDialog
                        mode="edit"
                        initial={t}
                        trigger={
                          <Button size="icon" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus tugas?"
                        description="Tugas timeline akan dihapus permanen."
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteTimelineEventTask(t.id);
                            toast.success("Tugas berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus tugas");
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
                </TableRow>
              ))}
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Tidak ada data
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
};

export default Timeline;
