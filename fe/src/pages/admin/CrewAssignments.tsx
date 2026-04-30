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
import { store, useBookings, useCrewAssignments, type CrewAssignment } from "@/lib/dataStore";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/mockData";
import { BookingSelect } from "@/components/BookingSelect";
import { statusLabel } from "@/lib/labels";

const roleOptions: CrewAssignment["role"][] = ["leader", "runner", "wardrobe", "makeup_assistant", "dokumentasi", "konsumsi", "transport", "lainnya"];
const hadirOptions: CrewAssignment["status_hadir"][] = ["belum_hadir", "hadir", "izin", "tidak_hadir"];

function CrewFormDialog({
  mode,
  initial,
  trigger,
}: {
  mode: "add" | "edit";
  initial?: CrewAssignment;
  trigger: React.ReactNode;
}) {
  const bookings = useBookings();
  const bookingOptions = useMemo(
    () =>
      bookings
        .map((b) => ({
          code: b.code || "",
          label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"} · ${String(b.eventDate || "")}`,
          searchText: `${b.code || ""} ${b.clientName || ""} ${String(b.eventDate || "")}`,
        }))
        .filter((x) => x.code),
    [bookings]
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    nama_crew: "",
    role: "runner",
    tanggal_tugas: "",
    jam_mulai: "",
    jam_selesai: "",
    lokasi_tugas: "",
    catatan_tugas: "",
    status_hadir: "belum_hadir",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      kode_booking: initial?.kode_booking ?? "",
      nama_crew: initial?.nama_crew ?? "",
      role: initial?.role ?? "runner",
      tanggal_tugas: initial?.tanggal_tugas ?? "",
      jam_mulai: initial?.jam_mulai ?? "",
      jam_selesai: initial?.jam_selesai ?? "",
      lokasi_tugas: initial?.lokasi_tugas ?? "",
      catatan_tugas: initial?.catatan_tugas ?? "",
      status_hadir: initial?.status_hadir ?? "belum_hadir",
    });
  }, [open, initial, bookingOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib diisi";
    if (!form.nama_crew) next.nama_crew = "Nama crew wajib diisi";
    if (!form.role) next.role = "Role wajib diisi";
    if (!form.tanggal_tugas) next.tanggal_tugas = "Tanggal tugas wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        kode_booking: form.kode_booking,
        nama_crew: form.nama_crew,
        role: form.role,
        tanggal_tugas: form.tanggal_tugas,
        jam_mulai: form.jam_mulai || undefined,
        jam_selesai: form.jam_selesai || undefined,
        lokasi_tugas: form.lokasi_tugas || undefined,
        catatan_tugas: form.catatan_tugas || undefined,
        status_hadir: form.status_hadir,
      };
      if (mode === "add") {
        await store.addCrewAssignment(payload);
        toast.success("Crew assignment berhasil ditambahkan");
      } else if (initial?.id) {
        await store.updateCrewAssignment(initial.id, payload);
        toast.success("Crew assignment berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan data");
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
            {mode === "add" ? "Assign Crew" : "Edit Assign Crew"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <BookingSelect
                value={form.kode_booking}
                onValueChange={(v) => setForm((f: any) => ({ ...f, kode_booking: v }))}
                options={bookingOptions as any}
                placeholder="Pilih Booking"
              />
              {errors.kode_booking ? <div className="text-xs text-destructive">{errors.kode_booking}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Status Hadir</Label>
              <Select value={form.status_hadir} onValueChange={(v) => setForm((f: any) => ({ ...f, status_hadir: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {hadirOptions.map((s) => (
                    <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Crew</Label>
              <Input value={form.nama_crew} onChange={(e) => setForm((f: any) => ({ ...f, nama_crew: e.target.value }))} disabled={saving} />
              {errors.nama_crew ? <div className="text-xs text-destructive">{errors.nama_crew}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f: any) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>{r.replaceAll("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role ? <div className="text-xs text-destructive">{errors.role}</div> : null}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Tugas</Label>
              <Input type="date" value={form.tanggal_tugas} onChange={(e) => setForm((f: any) => ({ ...f, tanggal_tugas: e.target.value }))} disabled={saving} />
              {errors.tanggal_tugas ? <div className="text-xs text-destructive">{errors.tanggal_tugas}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Jam Mulai</Label>
              <Input type="time" value={form.jam_mulai} onChange={(e) => setForm((f: any) => ({ ...f, jam_mulai: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Jam Selesai</Label>
              <Input type="time" value={form.jam_selesai} onChange={(e) => setForm((f: any) => ({ ...f, jam_selesai: e.target.value }))} disabled={saving} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lokasi Tugas (Opsional)</Label>
              <Input value={form.lokasi_tugas} onChange={(e) => setForm((f: any) => ({ ...f, lokasi_tugas: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan Tugas (Opsional)</Label>
              <Textarea value={form.catatan_tugas} onChange={(e) => setForm((f: any) => ({ ...f, catatan_tugas: e.target.value }))} disabled={saving} />
            </div>
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

const CrewAssignmentsPage = () => {
  const list = useCrewAssignments();
  const bookings = useBookings();

  const [kodeBooking, setKodeBooking] = useState<string>("all");
  const [tanggal, setTanggal] = useState<string>("");
  const [statusHadir, setStatusHadir] = useState<string>("all");
  const [role, setRole] = useState<string>("all");
  const [q, setQ] = useState("");

  const bookingOptions = useMemo(
    () =>
      bookings
        .map((b) => ({ code: b.code || "", label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"}` }))
        .filter((x) => x.code),
    [bookings]
  );


  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = list.filter((r) => {
    if (kodeBooking !== "all" && r.kode_booking !== kodeBooking) return false;
    if (tanggal && r.tanggal_tugas !== tanggal) return false;
    if (statusHadir !== "all" && r.status_hadir !== statusHadir) return false;
    if (role !== "all" && r.role !== role) return false;
    if (q) {
      const hay = `${r.nama_crew} ${r.role} ${r.lokasi_tugas || ""} ${r.catatan_tugas || ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page ke 1 jika filter berubah
  useEffect(() => { setPage(1); }, [kodeBooking, tanggal, statusHadir, role, q, perPage]);

  return (
    <>
      <PageHeader
        title="Tim WO / Crew Assignment"
        subtitle={`${list.length} assignment`}
        actions={
          <CrewFormDialog
            mode="add"
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Assign
              </Button>
            }
          />
        }
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid sm:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <Select value={kodeBooking} onValueChange={setKodeBooking}>
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
              <Label>Tanggal</Label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>{r.replaceAll("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status Hadir</Label>
              <Select value={statusHadir} onValueChange={setStatusHadir}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {hadirOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cari</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nama crew / lokasi / catatan..." />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{(r.kode_booking || "—").toUpperCase()}</TableCell>
                  <TableCell>{r.nama_crew}</TableCell>
                  <TableCell>{r.role.replaceAll("_", " ")}</TableCell>
                  <TableCell>{formatDate(r.tanggal_tugas)}</TableCell>
                  <TableCell>{r.jam_mulai || "—"}{r.jam_selesai ? ` - ${r.jam_selesai}` : ""}</TableCell>
                  <TableCell>{r.lokasi_tugas || "—"}</TableCell>
                  <TableCell className="capitalize">{r.status_hadir.replaceAll("_", " ")}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <CrewFormDialog
                        mode="edit"
                        initial={r}
                        trigger={
                          <Button size="icon" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus assignment?"
                        description="Data assignment crew akan dihapus permanen."
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteCrewAssignment(r.id);
                            toast.success("Assignment berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus assignment");
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
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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

export default CrewAssignmentsPage;
