import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentFormDialog } from "@/components/dialogs/PaymentFormDialog";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useBookings,
  useChecklistBarang,
  useCrewAssignments,
  usePackages,
  usePayments,
  useReferensiClient,
  useTimelineEvent,
  useVendors,
  useWishlistClient,
  store,
} from "@/lib/dataStore";
import { formatDate, formatIDR } from "@/lib/mockData";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ambilFormulirDigitalByBooking, ambilKategoriVendor, ambilVendorAvailableByKategori, uploadGambar } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, FileText, Plus, Trash2, Pencil } from "lucide-react";
import { statusLabel } from "@/lib/labels";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

async function exportDigitalFormPdf(opts: { kode_booking: string; data: any }) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait" });
  const marginX = 14;
  let y = 14;
  doc.setFontSize(14);
  doc.text("Formulir Digital Acara", marginX, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Booking: ${String(opts.kode_booking || "").toUpperCase()}`, marginX, y);
  y += 8;

  const lines: Array<[string, string]> = [
    ["Nama Pengantin Pria", opts.data?.nama_pengantin_pria],
    ["Nama Pengantin Wanita", opts.data?.nama_pengantin_wanita],
    ["Orang Tua Pria", opts.data?.nama_orang_tua_pria],
    ["Orang Tua Wanita", opts.data?.nama_orang_tua_wanita],
    ["Wali", opts.data?.nama_wali],
    ["Saksi 1", opts.data?.nama_saksi_1],
    ["Saksi 2", opts.data?.nama_saksi_2],
    ["MC", opts.data?.nama_MC],
    ["Penghulu/Pemuka Agama", opts.data?.nama_penghulu],
    ["Lokasi Akad", opts.data?.lokasi_akad],
    ["Jam Akad", opts.data?.jam_akad],
    ["Lokasi Resepsi", opts.data?.lokasi_resepsi],
    ["Jam Resepsi", opts.data?.jam_resepsi],
    ["Adat/Konsep", opts.data?.adat_konsep],
    ["Warna Tema", opts.data?.warna_tema],
    ["Jumlah Tamu", String(opts.data?.jumlah_tamu ?? "")],
    ["Request Lagu", opts.data?.request_lagu],
    ["Request Makanan", opts.data?.request_makanan],
    ["Susunan Acara", opts.data?.susunan_acara],
    ["Catatan Khusus", opts.data?.catatan_khusus],
  ];

  for (const [k, v] of lines) {
    const val = (v || "—").toString();
    const text = `${k}: ${val}`;
    const wrapped = doc.splitTextToSize(text, 180);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 5 + 1;
    if (y > 270) {
      doc.addPage();
      y = 14;
    }
  }

  doc.save(`formulir-${String(opts.kode_booking || "").toLowerCase()}.pdf`);
}

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const bookings = useBookings();
  const packages = usePackages();
  const vendors = useVendors();
  const payments = usePayments();
  const crews = useCrewAssignments();
  const checklistBarang = useChecklistBarang();
  const references = useReferensiClient();
  const wishlist = useWishlistClient();
  const timeline = useTimelineEvent();

  const booking = bookings.find((b) => b.id === id);
  const pkg = packages.find((p) => p.id === booking?.packageId);
  const kodeBooking = String(booking?.code || "");

  const vendorFinal = useMemo(() => {
    const ids = (booking?.vendorSelectedIds || []).map(String);
    return vendors.filter((v) => ids.includes(v.id));
  }, [booking?.vendorSelectedIds, vendors]);

  const paymentsForBooking = useMemo(() => {
    if (!kodeBooking) return [];
    return payments.filter((p) => p.bookingCode === kodeBooking);
  }, [payments, kodeBooking]);

  const totalPaid = paymentsForBooking.reduce((s, p) => s + p.amountPaid, 0);
  const latestRemaining = paymentsForBooking[0]?.remaining ?? 0;

  const crewForBooking = useMemo(() => {
    if (!kodeBooking) return [];
    return crews.filter((c) => c.kode_booking === kodeBooking);
  }, [crews, kodeBooking]);

  const checklistForBooking = useMemo(() => {
    if (!kodeBooking) return [];
    return checklistBarang.filter((c) => c.kode_booking === kodeBooking);
  }, [checklistBarang, kodeBooking]);

  const refsForBooking = useMemo(() => {
    if (!kodeBooking) return [];
    return references.filter((r) => String(r.kode_booking || "").toLowerCase() === kodeBooking.toLowerCase());
  }, [references, kodeBooking]);

  const wishlistForBooking = useMemo(() => {
    if (!kodeBooking) return [];
    return wishlist.filter((r) => String(r.kode_booking || "").toLowerCase() === kodeBooking.toLowerCase());
  }, [wishlist, kodeBooking]);

  const [loadingForm, setLoadingForm] = useState(false);
  const [digitalForm, setDigitalForm] = useState<any>(null);

  // Approval state (embedded)
  const [kategoriOptions, setKategoriOptions] = useState<any[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [availableByKategori, setAvailableByKategori] = useState<Record<string, any[]>>({});
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [approving, setApproving] = useState(false);

  // Filters (embedded) for preference tab
  const [refQ, setRefQ] = useState("");
  const [refKategori, setRefKategori] = useState<string>("all");
  const [refStatus, setRefStatus] = useState<string>("all");
  const [wlQ, setWlQ] = useState("");
  const [wlKategori, setWlKategori] = useState<string>("all");
  const [wlStatus, setWlStatus] = useState<string>("all");
  const [wlPrioritas, setWlPrioritas] = useState<string>("all");

  const filteredRefs = useMemo(() => {
    return refsForBooking.filter((r) => {
      if (refKategori !== "all" && String(r.kategori || "") !== refKategori) return false;
      if (refStatus !== "all" && String(r.status || "") !== refStatus) return false;
      if (refQ.trim()) {
        const hay = `${r.judul_referensi || ""} ${r.catatan_client || ""} ${r.catatan_staff || ""}`.toLowerCase();
        if (!hay.includes(refQ.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [refsForBooking, refQ, refKategori, refStatus]);

  const filteredWishlist = useMemo(() => {
    return wishlistForBooking.filter((w) => {
      if (wlKategori !== "all" && String(w.kategori || "") !== wlKategori) return false;
      if (wlStatus !== "all" && String(w.status || "") !== wlStatus) return false;
      if (wlPrioritas !== "all" && String(w.prioritas || "") !== wlPrioritas) return false;
      if (wlQ.trim()) {
        const hay = `${w.permintaan || ""} ${w.catatan_wo || ""} ${w.pic || ""}`.toLowerCase();
        if (!hay.includes(wlQ.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [wishlistForBooking, wlQ, wlKategori, wlStatus, wlPrioritas]);

  // Timeline form state (embedded)
  const [openTask, setOpenTask] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({});
  const [taskForm, setTaskForm] = useState<any>({
    id: "",
    nama_tugas: "",
    kategori_tugas: "",
    deadline: "",
    pic: "",
    status: "belum_dikerjakan",
    catatan: "",
  });

  // Crew form state (embedded)
  const [openCrew, setOpenCrew] = useState(false);
  const [crewSaving, setCrewSaving] = useState(false);
  const [crewErrors, setCrewErrors] = useState<Record<string, string>>({});
  const [crewForm, setCrewForm] = useState<any>({
    id: "",
    nama_crew: "",
    role: "runner",
    tanggal_tugas: "",
    jam_mulai: "",
    jam_selesai: "",
    lokasi_tugas: "",
    catatan_tugas: "",
    status_hadir: "belum_hadir",
  });

  // Checklist barang form state (embedded)
  const [openBarang, setOpenBarang] = useState(false);
  const [barangSaving, setBarangSaving] = useState(false);
  const [barangUploading, setBarangUploading] = useState(false);
  const [barangErrors, setBarangErrors] = useState<Record<string, string>>({});
  const [barangForm, setBarangForm] = useState<any>({
    id: "",
    nama_barang: "",
    kategori_barang: "lainnya",
    jumlah: 1,
    untuk_siapa: "",
    pic: "",
    status: "belum_siap",
    foto_barang: "",
    catatan: "",
  });

  useEffect(() => {
    if (!kodeBooking) return;
    (async () => {
      try {
        setLoadingForm(true);
        const data = await ambilFormulirDigitalByBooking(kodeBooking);
        setDigitalForm(data || null);
      } catch (err: any) {
        setDigitalForm(null);
        toast.error(err?.message || "Gagal mengambil formulir digital");
      } finally {
        setLoadingForm(false);
      }
    })();
  }, [kodeBooking]);

  useEffect(() => {
    if (!kodeBooking) return;
    setSelectedVendorIds((booking?.vendorSelectedIds || []).map(String));
  }, [kodeBooking, booking?.vendorSelectedIds]);

  useEffect(() => {
    ambilKategoriVendor()
      .then((data) => setKategoriOptions(Array.isArray(data) ? data : []))
      .catch(() => setKategoriOptions([]));
  }, []);

  const kategoriRows = useMemo(() => {
    const rows = pkg?.vendorByCategory || [];
    return rows.filter((r) => r.kategoriVendorId);
  }, [pkg?.vendorByCategory]);

  useEffect(() => {
    if (!booking || !pkg) return;
    if (!booking.eventDate) return;
    if (!kategoriRows.length) return;
    (async () => {
      try {
        setLoadingAvail(true);
        const next: Record<string, any[]> = {};
        for (const row of kategoriRows) {
          const kategoriId = String(row.kategoriVendorId);
          if (!kategoriId) continue;
          const data = await ambilVendorAvailableByKategori({
            package_id: pkg.id,
            tanggal_acara: booking.eventDate,
            kategori_vendor_id: kategoriId,
          });
          next[kategoriId] = Array.isArray(data) ? data : [];
        }
        setAvailableByKategori(next);
      } catch (err: any) {
        setAvailableByKategori({});
        toast.error(err?.message || "Gagal mengambil vendor available");
      } finally {
        setLoadingAvail(false);
      }
    })();
  }, [booking?.id, booking?.eventDate, pkg?.id, kategoriRows]);

  const taskRows = useMemo(() => {
    if (!kodeBooking) return [];
    return timeline
      .filter((t) => t.kode_booking === kodeBooking)
      .sort((a, b) => String(a.deadline || "").localeCompare(String(b.deadline || "")));
  }, [timeline, kodeBooking]);

  if (!booking) {
    return (
      <>
        <PageHeader title="Project Detail" subtitle="Data tidak ditemukan" />
        <Card className="p-10 border-border shadow-soft text-center text-muted-foreground">
          Project tidak ditemukan.
        </Card>
      </>
    );
  }

  const pkgName = booking.packageSnapshot?.name || pkg?.name || "-";
  const pkgPrice = booking.packageSnapshot?.price ?? pkg?.price ?? 0;

  return (
    <>
      <PageHeader
        title={`Project ${String(booking.code || booking.id).toUpperCase()}`}
        subtitle={`${booking.clientName || "—"} · ${formatDate(booking.eventDate)} · ${statusLabel(booking.reviewStatus || "menunggu_review")}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => nav(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        <Card className="p-5 border-border shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Paket</div>
          <div className="font-display text-xl text-primary mt-1">{pkgName}</div>
          <div className="text-sm text-muted-foreground">{formatIDR(pkgPrice)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Vendor Final</div>
          <div className="font-display text-xl mt-1">{vendorFinal.length} vendor</div>
          <div className="text-sm text-muted-foreground truncate">
            {vendorFinal.length ? vendorFinal.map((v) => v.name).slice(0, 2).join(", ") : "Belum dipilih"}
          </div>
        </Card>
        <Card className="p-5 border-border shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Pembayaran</div>
          <div className="font-display text-xl mt-1">{formatIDR(totalPaid)}</div>
          <div className="text-sm text-muted-foreground">Sisa: {formatIDR(latestRemaining)}</div>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="timeline">Timeline WO</TabsTrigger>
          <TabsTrigger value="preferences">Client Preference</TabsTrigger>
          <TabsTrigger value="vendor">Vendor Final</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
          <TabsTrigger value="assets">Checklist Barang</TabsTrigger>
          <TabsTrigger value="payments">Payment Tracker</TabsTrigger>
          <TabsTrigger value="form">Digital Form</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="p-6 border-border shadow-soft space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">Timeline WO / Checklist Internal</div>
                <div className="text-sm text-muted-foreground">Tugas operasional internal untuk project ini.</div>
              </div>

              <Dialog
                open={openTask}
                onOpenChange={(v) => {
                  setOpenTask(v);
                  if (!v) return;
                  setTaskErrors({});
                  setTaskForm({
                    id: "",
                    nama_tugas: "",
                    kategori_tugas: "",
                    deadline: booking.eventDate || "",
                    pic: "",
                    status: "belum_dikerjakan",
                    catatan: "",
                  });
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Tugas
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">{taskForm.id ? "Edit Tugas" : "Tambah Tugas"}</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const next: Record<string, string> = {};
                      if (!kodeBooking) next.kode_booking = "Kode booking tidak valid";
                      if (!taskForm.nama_tugas) next.nama_tugas = "Nama tugas wajib diisi";
                      if (!taskForm.deadline) next.deadline = "Deadline wajib diisi";
                      setTaskErrors(next);
                      if (Object.keys(next).length) return;

                      try {
                        setTaskSaving(true);
                        const payload = {
                          kode_booking: kodeBooking,
                          nama_tugas: taskForm.nama_tugas,
                          kategori_tugas: taskForm.kategori_tugas || undefined,
                          deadline: taskForm.deadline,
                          pic: taskForm.pic || undefined,
                          status: taskForm.status,
                          catatan: taskForm.catatan || undefined,
                        };
                        if (!taskForm.id) {
                          await store.addTimelineEventTask(payload);
                          toast.success("Tugas berhasil ditambahkan");
                        } else {
                          await store.updateTimelineEventTask(taskForm.id, payload);
                          toast.success("Tugas berhasil diperbarui");
                        }
                        setOpenTask(false);
                      } catch (err: any) {
                        toast.error(err?.message || "Gagal menyimpan tugas");
                      } finally {
                        setTaskSaving(false);
                      }
                    }}
                  >
                    {taskErrors.kode_booking ? <div className="text-xs text-destructive">{taskErrors.kode_booking}</div> : null}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Nama Tugas</Label>
                        <Input value={taskForm.nama_tugas} onChange={(e) => setTaskForm((f: any) => ({ ...f, nama_tugas: e.target.value }))} disabled={taskSaving} />
                        {taskErrors.nama_tugas ? <div className="text-xs text-destructive">{taskErrors.nama_tugas}</div> : null}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Kategori (Opsional)</Label>
                        <Input value={taskForm.kategori_tugas} onChange={(e) => setTaskForm((f: any) => ({ ...f, kategori_tugas: e.target.value }))} disabled={taskSaving} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label>Deadline</Label>
                        <Input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm((f: any) => ({ ...f, deadline: e.target.value }))} disabled={taskSaving} />
                        {taskErrors.deadline ? <div className="text-xs text-destructive">{taskErrors.deadline}</div> : null}
                      </div>
                      <div className="space-y-1.5">
                        <Label>PIC (Opsional)</Label>
                        <Input value={taskForm.pic} onChange={(e) => setTaskForm((f: any) => ({ ...f, pic: e.target.value }))} disabled={taskSaving} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={taskForm.status} onValueChange={(v) => setTaskForm((f: any) => ({ ...f, status: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="belum_dikerjakan">Belum dikerjakan</SelectItem>
                            <SelectItem value="proses">Proses</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                            <SelectItem value="terlambat">Terlambat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Catatan (Opsional)</Label>
                      <Textarea value={taskForm.catatan} onChange={(e) => setTaskForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={taskSaving} />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpenTask(false)} disabled={taskSaving}>Batal</Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={taskSaving}>
                        {taskSaving ? "Menyimpan..." : "Simpan"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Deadline</TableHead>
                    <TableHead>Nama Tugas</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[160px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskRows.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDate(t.deadline)}</TableCell>
                      <TableCell className="font-medium">{t.nama_tugas}</TableCell>
                      <TableCell>{t.kategori_tugas || "—"}</TableCell>
                      <TableCell>{t.pic || "—"}</TableCell>
                      <TableCell>{statusLabel(String(t.status || ""))}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setTaskErrors({});
                              setTaskForm({
                                id: t.id,
                                nama_tugas: t.nama_tugas,
                                kategori_tugas: t.kategori_tugas || "",
                                deadline: t.deadline,
                                pic: t.pic || "",
                                status: t.status,
                                catatan: t.catatan || "",
                              });
                              setOpenTask(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <ConfirmActionDialog
                            title="Hapus tugas?"
                            description="Tugas yang dihapus tidak bisa dikembalikan."
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
                  {taskRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Belum ada tugas timeline.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-6 border-border shadow-soft space-y-3">
              <div className="font-medium">Preferensi Katalog</div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Baju</div>
                  <div className="font-medium mt-1">{booking.preferensiKatalogSnapshot?.baju?.nama_baju || "—"}</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Dekorasi</div>
                  <div className="font-medium mt-1">{booking.preferensiKatalogSnapshot?.dekorasi?.nama_dekorasi || "—"}</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Makeup</div>
                  <div className="font-medium mt-1">{booking.preferensiKatalogSnapshot?.makeup?.nama_style || "—"}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Berikutnya: review referensi & wishlist client untuk finalisasi.</div>
            </Card>

            <Card className="p-6 border-border shadow-soft space-y-3">
              <div className="font-medium">Ringkasan</div>
              <div className="text-sm text-muted-foreground">
                Referensi: <span className="font-medium">{refsForBooking.length}</span> · Wishlist:{" "}
                <span className="font-medium">{wishlistForBooking.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/admin/client-references">Buka Semua Referensi</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/client-wishlist">Buka Semua Wishlist</Link>
                </Button>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <Card className="border-border shadow-soft overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20">
                <div className="font-medium mb-3">Referensi Client</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Cari</Label>
                    <Input value={refQ} onChange={(e) => setRefQ(e.target.value)} placeholder="Judul / catatan client / catatan staff..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kategori</Label>
                    <Select value={refKategori} onValueChange={setRefKategori}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {["baju", "dekorasi", "makeup", "aksesori", "lainnya"].map((k) => (
                          <SelectItem key={k} value={k}>{statusLabel(String(k))}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={refStatus} onValueChange={setRefStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {["diajukan", "disetujui", "ditolak", "revisi"].map((s) => (
                          <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Kategori</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gambar</TableHead>
                      <TableHead className="text-right w-[220px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRefs.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.kategori}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{r.judul_referensi || "—"}</TableCell>
                        <TableCell>{statusLabel(String(r.status || ""))}</TableCell>
                        <TableCell>
                          {r.upload_gambar ? (
                            <a className="inline-flex items-center gap-2 text-primary hover:underline" href={`${API_ORIGIN}${r.upload_gambar}`} target="_blank" rel="noreferrer">
                              <img src={`${API_ORIGIN}${r.upload_gambar}`} alt="ref" className="w-10 h-10 object-cover rounded-md border border-border" />
                              Lihat
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2 items-center">
                            <Select
                              value={r.status}
                              onValueChange={async (v) => {
                                try {
                                  await store.updateReferensiClient(r.id, { status: v });
                                  toast.success("Status referensi diperbarui");
                                } catch (err: any) {
                                  toast.error(err?.message || "Gagal update status");
                                }
                              }}
                            >
                              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["diajukan", "disetujui", "ditolak", "revisi"].map((s) => (
                                  <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">Catatan</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                  <DialogTitle className="font-display text-2xl">Catatan Referensi</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 text-sm">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Catatan Client</div>
                                    <div className="whitespace-pre-wrap">{r.catatan_client || "—"}</div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Catatan Staff (Opsional)</Label>
                                    <Textarea
                                      defaultValue={r.catatan_staff || ""}
                                      onChange={(e) => (r.__next_staff_note = e.target.value)}
                                      placeholder="Catatan untuk client..."
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={async () => {
                                      try {
                                        await store.updateReferensiClient(r.id, { catatan_staff: r.__next_staff_note || "" });
                                        toast.success("Catatan staff tersimpan");
                                      } catch (err: any) {
                                        toast.error(err?.message || "Gagal menyimpan catatan");
                                      }
                                    }}
                                  >
                                    Simpan
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRefs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Tidak ada referensi.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="border-border shadow-soft overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20">
                <div className="font-medium mb-3">Wishlist Client</div>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Cari</Label>
                    <Input value={wlQ} onChange={(e) => setWlQ(e.target.value)} placeholder="Permintaan / PIC / catatan..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kategori</Label>
                    <Select value={wlKategori} onValueChange={setWlKategori}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {["baju", "dekorasi", "makeup", "aksesori", "rundown", "makanan", "lainnya"].map((k) => (
                          <SelectItem key={k} value={k}>{statusLabel(String(k))}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Prioritas</Label>
                    <Select value={wlPrioritas} onValueChange={setWlPrioritas}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {["rendah", "sedang", "tinggi"].map((p) => (
                          <SelectItem key={p} value={p}>{statusLabel(String(p))}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={wlStatus} onValueChange={setWlStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {["baru", "proses", "selesai", "tidak bisa"].map((s) => (
                          <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Kategori</TableHead>
                      <TableHead>Prioritas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permintaan</TableHead>
                      <TableHead className="text-right w-[220px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWishlist.map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell>{w.kategori}</TableCell>
                        <TableCell>{w.prioritas}</TableCell>
                        <TableCell>{statusLabel(String(w.status || ""))}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{w.permintaan}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2 items-center">
                            <Select
                              value={w.status}
                              onValueChange={async (v) => {
                                try {
                                  await store.updateWishlistClient(w.id, { status: v });
                                  toast.success("Status wishlist diperbarui");
                                } catch (err: any) {
                                  toast.error(err?.message || "Gagal update status");
                                }
                              }}
                            >
                              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["baru", "proses", "selesai", "tidak bisa"].map((s) => (
                                  <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">Detail</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                  <DialogTitle className="font-display text-2xl">Detail Wishlist</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="text-sm">
                                    <div className="text-xs text-muted-foreground">Permintaan</div>
                                    <div className="whitespace-pre-wrap">{w.permintaan}</div>
                                  </div>
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                      <Label>PIC (Opsional)</Label>
                                      <Input defaultValue={w.pic || ""} onChange={(e) => (w.__next_pic = e.target.value)} placeholder="Nama PIC" />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label>Status</Label>
                                      <Select defaultValue={w.status} onValueChange={(v) => (w.__next_status = v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          {["baru", "proses", "selesai", "tidak bisa"].map((s) => (
                                            <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Catatan WO (Opsional)</Label>
                                    <Textarea defaultValue={w.catatan_wo || ""} onChange={(e) => (w.__next_catatan = e.target.value)} placeholder="Catatan internal..." />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={async () => {
                                      try {
                                        await store.updateWishlistClient(w.id, {
                                          pic: w.__next_pic ?? w.pic,
                                          status: w.__next_status ?? w.status,
                                          catatan_wo: w.__next_catatan ?? w.catatan_wo,
                                        });
                                        toast.success("Wishlist diperbarui");
                                      } catch (err: any) {
                                        toast.error(err?.message || "Gagal menyimpan perubahan");
                                      }
                                    }}
                                  >
                                    Simpan
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredWishlist.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Tidak ada wishlist.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendor">
          <Card className="p-6 border-border shadow-soft space-y-3">
            <div className="font-medium">Vendor Picked / Vendor Final</div>
            <div className="text-sm text-muted-foreground">Vendor final dipilih admin berdasarkan paket dan availability tanggal acara.</div>
            <ul className="text-sm space-y-1">
              {vendorFinal.map((v) => (
                <li key={v.id}>
                  <span className="font-medium">{v.name}</span> <span className="text-muted-foreground">· {v.category}</span>
                </li>
              ))}
              {vendorFinal.length === 0 ? <li className="text-muted-foreground">Belum ada vendor final.</li> : null}
            </ul>

            {(booking.reviewStatus || "menunggu_review") === "menunggu_review" ? (
              <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
                <div>
                  <div className="font-medium">Approval Booking</div>
                  <div className="text-sm text-muted-foreground">Approve cukup dari detail project ini (menu Review Booking tidak diperlukan).</div>
                </div>

                {kategoriRows.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Paket belum dikonfigurasi vendor per kategori.</div>
                ) : loadingAvail ? (
                  <div className="text-sm text-muted-foreground">Memuat vendor available...</div>
                ) : (
                  <div className="space-y-3">
                    {kategoriRows.map((row) => {
                      const kategoriId = String(row.kategoriVendorId);
                      const allowedIds = new Set((row.vendorIds || []).map(String));
                      const avail = (availableByKategori[kategoriId] || []).filter((v: any) => allowedIds.has(String(v._id)));
                      const kategoriName =
                        kategoriOptions.find((x) => String(x._id) === String(kategoriId))?.nama_kategori || "—";
                      return (
                        <div key={kategoriId} className="rounded-lg border border-border p-4 space-y-2 bg-background">
                          <div className="font-medium">{kategoriName}</div>
                          <div className="max-h-44 overflow-auto rounded-md border border-border p-3 space-y-2">
                            {avail.length === 0 ? (
                              <div className="text-sm text-muted-foreground">Tidak ada vendor available.</div>
                            ) : (
                              avail.map((v: any) => {
                                const id = String(v._id);
                                const checked = selectedVendorIds.includes(id);
                                return (
                                  <label key={id} className="flex items-center gap-3 text-sm">
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(val) => {
                                        const next = Boolean(val);
                                        setSelectedVendorIds((ids) =>
                                          next ? Array.from(new Set([...ids, id])) : ids.filter((x) => x !== id)
                                        );
                                      }}
                                    />
                                    <span className="flex-1 min-w-0">
                                      <span className="font-medium">{v.nama_vendor}</span>{" "}
                                      <span className="text-muted-foreground">· {v.kategori_vendor_nama || v.kategori_vendor_id?.nama_kategori || "—"}</span>
                                    </span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    disabled={approving}
                    onClick={async () => {
                      try {
                        setApproving(true);
                        await store.updateEventBooking(booking.id, {
                          clientId: booking.clientId,
                          packageId: booking.packageId,
                          eventDate: booking.eventDate,
                          venue: booking.venue,
                          adatId: booking.adatId,
                          eventStatus: "batal",
                          reviewStatus: "rejected",
                          vendorSelectedIds: [],
                        });
                        toast.success("Booking ditolak");
                      } catch (err: any) {
                        toast.error(err?.message || "Gagal menolak booking");
                      } finally {
                        setApproving(false);
                      }
                    }}
                  >
                    Tolak
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    disabled={approving}
                    onClick={async () => {
                      if (kategoriRows.length > 0 && selectedVendorIds.length === 0) {
                        toast.error("Pilih minimal 1 vendor final sebelum approve.");
                        return;
                      }
                      try {
                        setApproving(true);
                        await store.updateEventBooking(booking.id, {
                          clientId: booking.clientId,
                          packageId: booking.packageId,
                          eventDate: booking.eventDate,
                          venue: booking.venue,
                          adatId: booking.adatId,
                          eventStatus: "aktif",
                          reviewStatus: "approved",
                          vendorSelectedIds: selectedVendorIds,
                        });
                        toast.success("Booking di-approve");
                      } catch (err: any) {
                        toast.error(err?.message || "Gagal approve booking");
                      } finally {
                        setApproving(false);
                      }
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </TabsContent>

        <TabsContent value="crew">
          <Card className="p-6 border-border shadow-soft space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">Crew Assignment</div>
                <div className="text-sm text-muted-foreground">Assign crew untuk project ini.</div>
              </div>

              <Dialog
                open={openCrew}
                onOpenChange={(v) => {
                  setOpenCrew(v);
                  if (!v) return;
                  setCrewErrors({});
                  setCrewForm({
                    id: "",
                    nama_crew: "",
                    role: "runner",
                    tanggal_tugas: booking.eventDate || "",
                    jam_mulai: "",
                    jam_selesai: "",
                    lokasi_tugas: booking.venue || "",
                    catatan_tugas: "",
                    status_hadir: "belum_hadir",
                  });
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-1.5" /> Assign Crew
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">{crewForm.id ? "Edit Crew Assignment" : "Assign Crew"}</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const next: Record<string, string> = {};
                      if (!kodeBooking) next.kode_booking = "Kode booking tidak valid";
                      if (!crewForm.nama_crew) next.nama_crew = "Nama crew wajib diisi";
                      if (!crewForm.role) next.role = "Role wajib dipilih";
                      if (!crewForm.tanggal_tugas) next.tanggal_tugas = "Tanggal tugas wajib diisi";
                      setCrewErrors(next);
                      if (Object.keys(next).length) return;

                      try {
                        setCrewSaving(true);
                        const payload = {
                          kode_booking: kodeBooking,
                          nama_crew: crewForm.nama_crew,
                          role: crewForm.role,
                          tanggal_tugas: crewForm.tanggal_tugas,
                          jam_mulai: crewForm.jam_mulai || undefined,
                          jam_selesai: crewForm.jam_selesai || undefined,
                          lokasi_tugas: crewForm.lokasi_tugas || undefined,
                          catatan_tugas: crewForm.catatan_tugas || undefined,
                          status_hadir: crewForm.status_hadir,
                        };
                        if (!crewForm.id) {
                          await store.addCrewAssignment(payload);
                          toast.success("Crew assignment berhasil ditambahkan");
                        } else {
                          await store.updateCrewAssignment(crewForm.id, payload);
                          toast.success("Crew assignment berhasil diperbarui");
                        }
                        setOpenCrew(false);
                      } catch (err: any) {
                        toast.error(err?.message || "Gagal menyimpan crew assignment");
                      } finally {
                        setCrewSaving(false);
                      }
                    }}
                  >
                    {crewErrors.kode_booking ? <div className="text-xs text-destructive">{crewErrors.kode_booking}</div> : null}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Nama Crew</Label>
                        <Input value={crewForm.nama_crew} onChange={(e) => setCrewForm((f: any) => ({ ...f, nama_crew: e.target.value }))} disabled={crewSaving} />
                        {crewErrors.nama_crew ? <div className="text-xs text-destructive">{crewErrors.nama_crew}</div> : null}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Role</Label>
                        <Select value={crewForm.role} onValueChange={(v) => setCrewForm((f: any) => ({ ...f, role: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["leader", "runner", "wardrobe", "makeup_assistant", "dokumentasi", "konsumsi", "transport", "lainnya"].map((r) => (
                              <SelectItem key={r} value={r}>{statusLabel(String(r))}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {crewErrors.role ? <div className="text-xs text-destructive">{crewErrors.role}</div> : null}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label>Tanggal Tugas</Label>
                        <Input type="date" value={crewForm.tanggal_tugas} onChange={(e) => setCrewForm((f: any) => ({ ...f, tanggal_tugas: e.target.value }))} disabled={crewSaving} />
                        {crewErrors.tanggal_tugas ? <div className="text-xs text-destructive">{crewErrors.tanggal_tugas}</div> : null}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Jam Mulai (Opsional)</Label>
                        <Input value={crewForm.jam_mulai} onChange={(e) => setCrewForm((f: any) => ({ ...f, jam_mulai: e.target.value }))} disabled={crewSaving} placeholder="08:00" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Jam Selesai (Opsional)</Label>
                        <Input value={crewForm.jam_selesai} onChange={(e) => setCrewForm((f: any) => ({ ...f, jam_selesai: e.target.value }))} disabled={crewSaving} placeholder="16:00" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Lokasi (Opsional)</Label>
                        <Input value={crewForm.lokasi_tugas} onChange={(e) => setCrewForm((f: any) => ({ ...f, lokasi_tugas: e.target.value }))} disabled={crewSaving} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Status Hadir</Label>
                        <Select value={crewForm.status_hadir} onValueChange={(v) => setCrewForm((f: any) => ({ ...f, status_hadir: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["belum_hadir", "hadir", "izin", "tidak_hadir"].map((s) => (
                              <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Catatan (Opsional)</Label>
                      <Textarea value={crewForm.catatan_tugas} onChange={(e) => setCrewForm((f: any) => ({ ...f, catatan_tugas: e.target.value }))} disabled={crewSaving} />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpenCrew(false)} disabled={crewSaving}>Batal</Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={crewSaving}>
                        {crewSaving ? "Menyimpan..." : "Simpan"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama Crew</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[160px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crewForBooking.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nama_crew}</TableCell>
                      <TableCell>{c.role}</TableCell>
                      <TableCell>{formatDate(c.tanggal_tugas)}</TableCell>
                      <TableCell>{c.jam_mulai && c.jam_selesai ? `${c.jam_mulai}–${c.jam_selesai}` : "—"}</TableCell>
                      <TableCell>{c.status_hadir}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setCrewErrors({});
                              setCrewForm({
                                id: c.id,
                                nama_crew: c.nama_crew,
                                role: c.role,
                                tanggal_tugas: c.tanggal_tugas,
                                jam_mulai: c.jam_mulai || "",
                                jam_selesai: c.jam_selesai || "",
                                lokasi_tugas: c.lokasi_tugas || "",
                                catatan_tugas: c.catatan_tugas || "",
                                status_hadir: c.status_hadir,
                              });
                              setOpenCrew(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <ConfirmActionDialog
                            title="Hapus crew assignment?"
                            description="Data yang dihapus tidak bisa dikembalikan."
                            confirmText="Hapus"
                            onConfirm={async () => {
                              try {
                                await store.deleteCrewAssignment(c.id);
                                toast.success("Crew assignment berhasil dihapus");
                              } catch (err: any) {
                                toast.error(err?.message || "Gagal menghapus data");
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
                  {crewForBooking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Belum ada crew assignment.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card className="p-6 border-border shadow-soft space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">Checklist Barang / Aset</div>
                <div className="text-sm text-muted-foreground">Checklist operasional barang untuk project ini.</div>
              </div>

              <Dialog
                open={openBarang}
                onOpenChange={(v) => {
                  setOpenBarang(v);
                  if (!v) return;
                  setBarangErrors({});
                  setBarangForm({
                    id: "",
                    nama_barang: "",
                    kategori_barang: "lainnya",
                    jumlah: 1,
                    untuk_siapa: "",
                    pic: "",
                    status: "belum_siap",
                    foto_barang: "",
                    catatan: "",
                  });
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">{barangForm.id ? "Edit Checklist Barang" : "Tambah Checklist Barang"}</DialogTitle>
                  </DialogHeader>

                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const next: Record<string, string> = {};
                      if (!kodeBooking) next.kode_booking = "Kode booking tidak valid";
                      if (!barangForm.nama_barang) next.nama_barang = "Nama barang wajib diisi";
                      if (!barangForm.kategori_barang) next.kategori_barang = "Kategori wajib dipilih";
                      if (!barangForm.jumlah || Number(barangForm.jumlah) <= 0) next.jumlah = "Jumlah minimal 1";
                      setBarangErrors(next);
                      if (Object.keys(next).length) return;

                      try {
                        setBarangSaving(true);
                        const payload = {
                          kode_booking: kodeBooking,
                          nama_barang: barangForm.nama_barang,
                          kategori_barang: barangForm.kategori_barang,
                          jumlah: Number(barangForm.jumlah) || 1,
                          untuk_siapa: barangForm.untuk_siapa || undefined,
                          pic: barangForm.pic || undefined,
                          status: barangForm.status,
                          foto_barang: barangForm.foto_barang || undefined,
                          catatan: barangForm.catatan || undefined,
                        };
                        if (!barangForm.id) {
                          await store.addChecklistBarang(payload);
                          toast.success("Checklist barang berhasil ditambahkan");
                        } else {
                          await store.updateChecklistBarang(barangForm.id, payload);
                          toast.success("Checklist barang berhasil diperbarui");
                        }
                        setOpenBarang(false);
                      } catch (err: any) {
                        toast.error(err?.message || "Gagal menyimpan checklist");
                      } finally {
                        setBarangSaving(false);
                      }
                    }}
                  >
                    {barangErrors.kode_booking ? <div className="text-xs text-destructive">{barangErrors.kode_booking}</div> : null}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Nama Barang</Label>
                        <Input value={barangForm.nama_barang} onChange={(e) => setBarangForm((f: any) => ({ ...f, nama_barang: e.target.value }))} disabled={barangSaving} />
                        {barangErrors.nama_barang ? <div className="text-xs text-destructive">{barangErrors.nama_barang}</div> : null}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Kategori</Label>
                        <Select value={barangForm.kategori_barang} onValueChange={(v) => setBarangForm((f: any) => ({ ...f, kategori_barang: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["baju", "aksesori", "dekorasi", "dokumen", "lainnya"].map((k) => (
                              <SelectItem key={k} value={k}>{statusLabel(String(k))}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {barangErrors.kategori_barang ? <div className="text-xs text-destructive">{barangErrors.kategori_barang}</div> : null}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <Label>Jumlah</Label>
                        <Input type="number" value={barangForm.jumlah} onChange={(e) => setBarangForm((f: any) => ({ ...f, jumlah: Number(e.target.value) }))} disabled={barangSaving} />
                        {barangErrors.jumlah ? <div className="text-xs text-destructive">{barangErrors.jumlah}</div> : null}
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Untuk Siapa (Opsional)</Label>
                        <Input value={barangForm.untuk_siapa} onChange={(e) => setBarangForm((f: any) => ({ ...f, untuk_siapa: e.target.value }))} disabled={barangSaving} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={barangForm.status} onValueChange={(v) => setBarangForm((f: any) => ({ ...f, status: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["belum_siap", "siap", "dibawa", "dikembalikan"].map((s) => (
                              <SelectItem key={s} value={s}>{statusLabel(String(s))}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>PIC (Opsional)</Label>
                        <Input value={barangForm.pic} onChange={(e) => setBarangForm((f: any) => ({ ...f, pic: e.target.value }))} disabled={barangSaving} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Foto (Opsional)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={barangSaving || barangUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setBarangUploading(true);
                              const { url } = await uploadGambar(file);
                              setBarangForm((f: any) => ({ ...f, foto_barang: url }));
                              toast.success("Foto berhasil diupload");
                            } catch (err: any) {
                              toast.error(err?.message || "Gagal upload foto");
                            } finally {
                              setBarangUploading(false);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Catatan (Opsional)</Label>
                      <Textarea value={barangForm.catatan} onChange={(e) => setBarangForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={barangSaving} />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpenBarang(false)} disabled={barangSaving || barangUploading}>Batal</Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={barangSaving || barangUploading}>
                        {barangSaving ? "Menyimpan..." : "Simpan"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead className="text-right w-[160px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklistForBooking.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.nama_barang}</TableCell>
                      <TableCell>{r.kategori_barang}</TableCell>
                      <TableCell>{r.jumlah}</TableCell>
                      <TableCell>{statusLabel(String(r.status || ""))}</TableCell>
                      <TableCell>{r.pic || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setBarangErrors({});
                              setBarangForm({
                                id: r.id,
                                nama_barang: r.nama_barang,
                                kategori_barang: r.kategori_barang,
                                jumlah: r.jumlah,
                                untuk_siapa: r.untuk_siapa || "",
                                pic: r.pic || "",
                                status: r.status,
                                foto_barang: r.foto_barang || "",
                                catatan: r.catatan || "",
                              });
                              setOpenBarang(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <ConfirmActionDialog
                            title="Hapus item checklist?"
                            description="Item yang dihapus tidak bisa dikembalikan."
                            confirmText="Hapus"
                            onConfirm={async () => {
                              try {
                                await store.deleteChecklistBarang(r.id);
                                toast.success("Checklist barang berhasil dihapus");
                              } catch (err: any) {
                                toast.error(err?.message || "Gagal menghapus data");
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
                  {checklistForBooking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Belum ada checklist barang.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6 border-border shadow-soft space-y-3">
            <div className="font-medium">Payment Tracker</div>
            <div className="text-sm text-muted-foreground">
              Total bayar: {formatIDR(totalPaid)} · Sisa (latest): {formatIDR(latestRemaining)}
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <PaymentFormDialog
                mode="add"
                fixedKodeBooking={kodeBooking}
                trigger={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-1.5" /> Input Pembayaran
                  </Button>
                }
              />
              <Button asChild variant="outline">
                <Link to="/admin/payments">Buka Semua Pembayaran</Link>
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Kode</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Sisa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[160px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsForBooking.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{(p.code || "").toUpperCase()}</TableCell>
                      <TableCell>{formatDate(p.paidDate)}</TableCell>
                      <TableCell>{p.paymentType || "—"}</TableCell>
                      <TableCell>{formatIDR(p.amountPaid)}</TableCell>
                      <TableCell>{formatIDR(p.remaining)}</TableCell>
                      <TableCell>{statusLabel(String(p.status || ""))}</TableCell>
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
                            description={`Pembayaran ${(p.code || "").toUpperCase()} akan dihapus.`}
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
                    </TableRow>
                  ))}
                  {paymentsForBooking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Belum ada pembayaran
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card className="p-6 border-border shadow-soft space-y-3">
            <div className="font-medium">Digital Form Client</div>
            {loadingForm ? (
              <div className="text-sm text-muted-foreground">Memuat formulir...</div>
            ) : !digitalForm ? (
              <div className="text-sm text-muted-foreground">Belum diisi oleh client.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Pengantin</div>
                  <div className="font-medium">{digitalForm.nama_pengantin_pria || "—"} & {digitalForm.nama_pengantin_wanita || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Tamu</div>
                  <div className="font-medium">{digitalForm.jumlah_tamu ?? "—"}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Susunan Acara</div>
                  <div className="whitespace-pre-wrap">{digitalForm.susunan_acara || "—"}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!digitalForm}
                onClick={() => exportDigitalFormPdf({ kode_booking: kodeBooking, data: digitalForm })}
              >
                <FileText className="w-4 h-4 mr-1.5" /> Export PDF
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/bookings">Buka Booking</Link>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card className="p-10 border-border shadow-soft text-center text-muted-foreground">
            Tab Documents disiapkan sesuai `wo.md` dan akan diisi bertahap.
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
