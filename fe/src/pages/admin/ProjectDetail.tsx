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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useBookings,
  useChecklistBarang,
  useCrewAssignments,
  useKatalogBaju,
  useKatalogDekorasi,
  useKatalogFavorit,
  useKatalogMakeup,
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
import { ambilFormulirDigitalByBooking, ambilKategoriVendor, ambilVendorOptionsByKategori, uploadGambar } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, FileText, Plus, Trash2, Pencil } from "lucide-react";
import { statusLabel } from "@/lib/labels";
import { RupiahInput } from "@/components/RupiahInput";

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
  const favs = useKatalogFavorit();
  const katalogBaju = useKatalogBaju();
  const katalogDekorasi = useKatalogDekorasi();
  const katalogMakeup = useKatalogMakeup();

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

  const favForClient = useMemo(() => {
    if (!booking?.clientId) return [];
    return favs.filter((f) => String(f.client_id) === String(booking.clientId));
  }, [favs, booking?.clientId]);

  const favGroups = useMemo(() => {
    const bajuIds = favForClient.filter((f) => f.katalog_type === "baju").map((f) => String(f.katalog_id));
    const dekorIds = favForClient.filter((f) => f.katalog_type === "dekorasi").map((f) => String(f.katalog_id));
    const makeupIds = favForClient.filter((f) => f.katalog_type === "makeup").map((f) => String(f.katalog_id));
    return {
      baju: katalogBaju.filter((x) => bajuIds.includes(String(x.id))),
      dekorasi: katalogDekorasi.filter((x) => dekorIds.includes(String(x.id))),
      makeup: katalogMakeup.filter((x) => makeupIds.includes(String(x.id))),
    };
  }, [favForClient, katalogBaju, katalogDekorasi, katalogMakeup]);

  const wishlistForBooking = useMemo(() => {
    if (!kodeBooking) return [];
    return wishlist.filter((r) => String(r.kode_booking || "").toLowerCase() === kodeBooking.toLowerCase());
  }, [wishlist, kodeBooking]);

  const [loadingForm, setLoadingForm] = useState(false);
  const [digitalForm, setDigitalForm] = useState<any>(null);
  const [openFav, setOpenFav] = useState(false);
  const [selectedFav, setSelectedFav] = useState<any>(null);

  // Approval state (embedded)
  const [kategoriOptions, setKategoriOptions] = useState<any[]>([]);
  const [vendorEditMode, setVendorEditMode] = useState(false);
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>("");
  const [loadingVendorOptions, setLoadingVendorOptions] = useState(false);
  const [vendorOptions, setVendorOptions] = useState<any[]>([]);
  const [selectedVendorByKategori, setSelectedVendorByKategori] = useState<Record<string, string>>({});
  const [jamMulai, setJamMulai] = useState<string>("");
  const [jamSelesai, setJamSelesai] = useState<string>("");
  const [approving, setApproving] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricing, setPricing] = useState<any>({
    hargaPaketFinal: 0,
    biayaTambahan: 0,
    diskon: 0,
    addons: [] as any[],
  });

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
    const next: Record<string, string> = {};
    const ids = (booking?.vendorSelectedIds || []).map(String);
    for (const id of ids) {
      const v = vendors.find((x) => String(x.id) === String(id));
      const kId = String(v?.categoryId || "");
      if (!kId) continue;
      // one vendor per kategori (keep first)
      if (!next[kId]) next[kId] = String(id);
    }
    setSelectedVendorByKategori(next);
  }, [kodeBooking, booking?.vendorSelectedIds]);

  useEffect(() => {
    // default time from booking if present
    setJamMulai(String((booking as any)?.jamMulai || (booking as any)?.jam_mulai || ""));
    setJamSelesai(String((booking as any)?.jamSelesai || (booking as any)?.jam_selesai || ""));
  }, [booking?.id]);

  useEffect(() => {
    if (!booking) return;
    setPricing({
      hargaPaketFinal: Number(booking.hargaPaketFinal || booking.packageSnapshot?.price || pkg?.price || 0),
      biayaTambahan: Number(booking.biayaTambahan || 0),
      diskon: Number(booking.diskon || 0),
      addons: (booking.addons || []).map((a: any) => ({
        addonId: a.addonId,
        nama_addon: a.nama_addon,
        kategori_addon: a.kategori_addon,
        deskripsi: a.deskripsi,
        satuan: a.satuan,
        qty: Number(a.qty) || 0,
        harga_satuan_default: Number(a.harga_satuan_default) || 0,
        harga_satuan_final: Number(a.harga_satuan_final) || Number(a.harga_satuan_default) || 0,
      })),
    });
  }, [booking?.id, booking?.addons, booking?.hargaPaketFinal, booking?.biayaTambahan, booking?.diskon, booking?.packageSnapshot?.price, pkg?.price]);

  useEffect(() => {
    ambilKategoriVendor()
      .then((data) => setKategoriOptions(Array.isArray(data) ? data : []))
      .catch(() => setKategoriOptions([]));
  }, []);

  const kategoriRows = useMemo(() => {
    const rows = (pkg?.vendorByCategory || []).filter((r) => r.kategoriVendorId);
    if (rows.length > 0) return rows;

    // Backward compat: paket lama hanya punya vendorIds flat (tanpa konfigurasi per kategori).
    // Untuk tetap bisa pilih vendor final, group vendorIds tersebut berdasarkan kategori vendor.
    const allowed = new Set(
      (pkg?.vendorIds || booking?.packageSnapshot?.vendorIds || []).map((x) => String(x)).filter(Boolean)
    );
    if (allowed.size === 0) return [];

    const byKategori = new Map<string, string[]>();
    for (const v of vendors) {
      const id = String(v.id);
      if (!allowed.has(id)) continue;
      const kategoriId = String(v.categoryId || "");
      if (!kategoriId) continue;
      const list = byKategori.get(kategoriId) || [];
      list.push(id);
      byKategori.set(kategoriId, list);
    }

    return Array.from(byKategori.entries()).map(([kategoriVendorId, vendorIds]) => ({
      kategoriVendorId,
      vendorIds,
    }));
  }, [pkg?.vendorByCategory, pkg?.vendorIds, booking?.packageSnapshot?.vendorIds, vendors]);

  useEffect(() => {
    if (!vendorEditMode) return;
    if (!booking || !pkg) return;
    if (!booking.eventDate) return;
    const kategoriId = String(selectedKategoriId || "");
    if (!kategoriId) return;
    (async () => {
      try {
        setLoadingVendorOptions(true);
        const data = await ambilVendorOptionsByKategori({
          package_id: pkg.id,
          tanggal_acara: booking.eventDate,
          kategori_vendor_id: kategoriId,
          kode_booking: kodeBooking || undefined,
        });
        setVendorOptions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setVendorOptions([]);
        toast.error(err?.message || "Gagal mengambil vendor options");
      } finally {
        setLoadingVendorOptions(false);
      }
    })();
  }, [vendorEditMode, booking?.id, booking?.eventDate, pkg?.id, selectedKategoriId, kodeBooking]);

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
  const bookingFinalPrice = booking.hargaFinalBooking || 0;

  return (
    <>
      <PageHeader
        title={`Project ${String(booking.code || booking.id).toUpperCase()}`}
        subtitle={`${booking.clientName || "—"} · ${formatDate(booking.eventDate)} · ${statusLabel(booking.statusBooking || "menunggu_review")}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => nav(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali
            </Button>
            {(booking.statusBooking || "menunggu_review") === "approved" ? (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={async () => {
                  try {
                    await store.updateBookingStatus(booking.id, "ongoing");
                    toast.success("Status booking: Ongoing");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal update status");
                  }
                }}
              >
                Mark Ongoing
              </Button>
            ) : null}
            {(booking.statusBooking || "menunggu_review") === "ongoing" ? (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={async () => {
                  try {
                    await store.updateBookingStatus(booking.id, "completed");
                    toast.success("Status booking: Completed");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal update status");
                  }
                }}
              >
                Mark Completed
              </Button>
            ) : null}
            {["completed", "cancelled", "rejected"].includes(String(booking.statusBooking || "")) ? null : (
              <ConfirmActionDialog
                title="Cancel booking?"
                description="Booking akan dibatalkan."
                confirmText="Cancel"
                onConfirm={async () => {
                  try {
                    await store.updateBookingStatus(booking.id, "cancelled");
                    toast.success("Booking dibatalkan");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal membatalkan booking");
                  }
                }}
                trigger={
                  <Button variant="destructive">
                    Cancel
                  </Button>
                }
              />
            )}
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

      <Tabs defaultValue="vendor" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="vendor">Vendor Final</TabsTrigger>
          <TabsTrigger value="timeline">Timeline WO</TabsTrigger>
          <TabsTrigger value="preferences">Client Preference</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
          <TabsTrigger value="assets">Checklist Barang</TabsTrigger>
          <TabsTrigger value="payments">Payment Tracker</TabsTrigger>
          <TabsTrigger value="form">Digital Form</TabsTrigger>
          {/* NOTE: tab Documents di-hide sementara sesuai requirement */}
          {/* <TabsTrigger value="docs">Documents</TabsTrigger> */}
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
                      <TableCell>{t.deadline && !isNaN(Date.parse(t.deadline)) ? formatDate(t.deadline) : "-"}</TableCell>
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
	              <div className="font-medium">Katalog Favorit Client</div>
	              <div className="text-sm text-muted-foreground">Favorit hanya sebagai referensi selera client (bukan pilihan final).</div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Baju</div>
                  <div className="font-medium mt-1">{favGroups.baju.length} item</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {favGroups.baju.slice(0, 2).map((x) => x.nama_baju).join(", ") || "—"}
                  </div>
                </div>
	                <div className="rounded-md border border-border p-3">
	                  <div className="text-xs text-muted-foreground">Dekorasi</div>
	                  <div className="font-medium mt-1">{favGroups.dekorasi.length} item</div>
	                  <div className="text-xs text-muted-foreground mt-1 truncate">
	                    {favGroups.dekorasi.slice(0, 2).map((x) => x.nama_dekorasi).join(", ") || "—"}
	                  </div>
	                </div>
	                <div className="rounded-md border border-border p-3">
	                  <div className="text-xs text-muted-foreground">Makeup</div>
	                  <div className="font-medium mt-1">{favGroups.makeup.length} item</div>
	                  <div className="text-xs text-muted-foreground mt-1 truncate">
	                    {favGroups.makeup.slice(0, 2).map((x) => x.nama_style).join(", ") || "—"}
	                  </div>
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

          <Card className="p-6 border-border shadow-soft space-y-3 mt-4">
            <div className="font-medium">Thumbnail Favorit Client</div>
            <div className="text-sm text-muted-foreground">Klik gambar untuk preview besar.</div>

            {favForClient.length === 0 ? (
              <div className="text-sm text-muted-foreground">Belum ada favorit.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {favGroups.baju.map((x) => {
                  const src = x.foto ? `${API_ORIGIN}${x.foto}` : "";
                  return (
                    <button
                      key={`baju:${x.id}`}
                      type="button"
                      className="text-left rounded-xl overflow-hidden border border-border bg-background hover:shadow-elegant transition-smooth"
                      onClick={() => {
                        setSelectedFav({ type: "baju", data: x, note: "" });
                        setOpenFav(true);
                      }}
                    >
                      <div className="aspect-square bg-muted/30">
                        {src ? (
                          <img src={src} alt={x.nama_baju} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-medium truncate">{x.nama_baju}</div>
                        <div className="text-[11px] text-muted-foreground truncate">Baju</div>
                      </div>
                    </button>
                  );
                })}
                {favGroups.dekorasi.map((x) => {
                  const src = x.foto ? `${API_ORIGIN}${x.foto}` : "";
                  return (
                    <button
                      key={`dekorasi:${x.id}`}
                      type="button"
                      className="text-left rounded-xl overflow-hidden border border-border bg-background hover:shadow-elegant transition-smooth"
                      onClick={() => {
                        setSelectedFav({ type: "dekorasi", data: x, note: "" });
                        setOpenFav(true);
                      }}
                    >
                      <div className="aspect-square bg-muted/30">
                        {src ? (
                          <img src={src} alt={x.nama_dekorasi} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-medium truncate">{x.nama_dekorasi}</div>
                        <div className="text-[11px] text-muted-foreground truncate">Dekorasi</div>
                      </div>
                    </button>
                  );
                })}
                {favGroups.makeup.map((x) => {
                  const src = x.foto ? `${API_ORIGIN}${x.foto}` : "";
                  return (
                    <button
                      key={`makeup:${x.id}`}
                      type="button"
                      className="text-left rounded-xl overflow-hidden border border-border bg-background hover:shadow-elegant transition-smooth"
                      onClick={() => {
                        setSelectedFav({ type: "makeup", data: x, note: "" });
                        setOpenFav(true);
                      }}
                    >
                      <div className="aspect-square bg-muted/30">
                        {src ? (
                          <img src={src} alt={x.nama_style} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-medium truncate">{x.nama_style}</div>
                        <div className="text-[11px] text-muted-foreground truncate">Makeup</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Dialog open={openFav} onOpenChange={setOpenFav}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Preview Favorit</DialogTitle>
              </DialogHeader>
              {!selectedFav ? null : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
                    {selectedFav.data?.foto ? (
                      <img src={`${API_ORIGIN}${selectedFav.data.foto}`} alt="Foto" className="w-full h-[420px] object-cover" />
                    ) : (
                      <div className="w-full h-[420px] flex items-center justify-center text-sm text-muted-foreground">No Photo</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Kategori</div>
                      <div className="font-medium capitalize">{selectedFav.type}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Nama</div>
                      <div className="font-display text-2xl">
                        {selectedFav.type === "baju"
                          ? selectedFav.data.nama_baju
                          : selectedFav.type === "dekorasi"
                            ? selectedFav.data.nama_dekorasi
                            : selectedFav.data.nama_style}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">{selectedFav.type === "dekorasi" ? "Tema" : "Warna"}</div>
                        <div className="font-medium">
                          {selectedFav.type === "baju"
                            ? selectedFav.data.warna || "—"
                            : selectedFav.type === "dekorasi"
                              ? selectedFav.data.tema || "—"
                              : selectedFav.data.kategori || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          {selectedFav.type === "baju" ? "Model" : selectedFav.type === "dekorasi" ? "Warna Dominan" : "MUA"}
                        </div>
                        <div className="font-medium">
                          {selectedFav.type === "baju"
                            ? selectedFav.data.model || "—"
                            : selectedFav.type === "dekorasi"
                              ? selectedFav.data.warna_dominan || "—"
                              : selectedFav.data.vendor_mua_nama || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Catatan Client</div>
                      <div className="text-muted-foreground">—</div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenFav(false)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

            <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium">Vendor Final</div>
                  <div className="text-sm text-muted-foreground">
                    Edit vendor final per kategori. Vendor yang tidak available tidak bisa dipilih.
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const next = !vendorEditMode;
                    setVendorEditMode(next);
                    if (next) {
                      const first = String(Object.keys(selectedVendorByKategori)[0] || kategoriRows[0]?.kategoriVendorId || "");
                      setSelectedKategoriId(first);
                    }
                  }}
                >
                  {vendorEditMode ? "Tutup Edit" : "Edit Vendor Final"}
                </Button>
              </div>

              {kategoriRows.length === 0 ? (
                <div className="text-sm text-muted-foreground">Paket belum dikonfigurasi vendor per kategori.</div>
              ) : !vendorEditMode ? (
                <div className="text-sm text-muted-foreground">
                  Klik <span className="font-medium">Edit Vendor Final</span> untuk mengubah pilihan.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Pilih Kategori Vendor</Label>
                    <Select value={selectedKategoriId || ""} onValueChange={(v) => setSelectedKategoriId(String(v))}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        {kategoriRows.map((row) => {
                          const kId = String(row.kategoriVendorId);
                          const name = kategoriOptions.find((x) => String(x._id) === kId)?.nama_kategori || "—";
                          return <SelectItem key={kId} value={kId}>{name}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Jam Mulai (Opsional)</Label>
                      <Input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Jam Selesai (Opsional)</Label>
                      <Input type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4 bg-background space-y-2">
                    <div className="text-sm font-medium">Vendor dalam kategori</div>
                    {loadingVendorOptions ? (
                      <div className="text-sm text-muted-foreground">Memuat vendor...</div>
                    ) : vendorOptions.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Tidak ada vendor di kategori ini.</div>
                    ) : (
                      <RadioGroup
                        value={selectedKategoriId ? (selectedVendorByKategori[selectedKategoriId] || "") : ""}
                        onValueChange={(val) => {
                          const vId = String(val || "");
                          if (!selectedKategoriId) return;
                          setSelectedVendorByKategori((prev) => ({ ...prev, [String(selectedKategoriId)]: vId }));
                        }}
                        className="space-y-2"
                      >
                        {vendorOptions.map((v: any) => {
                          const id = String(v._id);
                          const available = Boolean(v.available);
                          return (
                            <label
                              key={id}
                              className={`flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm ${available ? "bg-background" : "bg-muted/30 opacity-70"}`}
                            >
                              <RadioGroupItem value={id} disabled={!available} />
                              <span className="flex-1 min-w-0">
                                <span className="font-medium">{v.nama_vendor}</span>{" "}
                                <span className="text-muted-foreground">· {v.kategori_vendor_nama || v.kategori_vendor_id?.nama_kategori || "—"}</span>
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${available ? "border-success/30 text-success" : "border-destructive/30 text-destructive"}`}>
                                {available ? "Available" : `Not available (${v.blocked_status || "booked"})`}
                              </span>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={async () => {
                        try {
                          const vendorSelectedIds = Array.from(
                            new Set(Object.values(selectedVendorByKategori).map(String).filter(Boolean))
                          );
                          await store.updateEventBooking(booking.id, {
                            clientId: booking.clientId,
                            packageId: booking.packageId,
                            eventDate: booking.eventDate,
                            jamMulai: jamMulai || undefined,
                            jamSelesai: jamSelesai || undefined,
                            venue: booking.venue,
                            adatId: booking.adatId,
                            vendorSelectedIds,
                          });
                          toast.success("Vendor final tersimpan");
                          setVendorEditMode(false);
                        } catch (err: any) {
                          toast.error(err?.message || "Gagal menyimpan vendor final");
                        }
                      }}
                    >
                      Simpan Vendor Final
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
              <div>
                <div className="font-medium">Review Harga</div>
                <div className="text-sm text-muted-foreground">
                  Harga paket di master adalah estimasi “mulai dari”. Harga final wajib direview WO sebelum approval.
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Harga Paket (Estimasi)</Label>
                  <div className="h-10 rounded-md border border-border px-3 flex items-center text-sm">
                    {formatIDR(Number(booking.hargaPaketEstimasi || booking.packageSnapshot?.price || pkg?.price || 0))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Paket Final</Label>
                  <RupiahInput value={Number(pricing.hargaPaketFinal) || 0} onValueChange={(v) => setPricing((p: any) => ({ ...p, hargaPaketFinal: v }))} placeholder="Rp" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Add-ons</div>
                {pricing.addons.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Tidak ada add-ons dari client.</div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium">Add-on</th>
                            <th className="text-right px-3 py-2 font-medium w-[110px]">Qty</th>
                            <th className="text-right px-3 py-2 font-medium w-[170px]">Harga Default</th>
                            <th className="text-right px-3 py-2 font-medium w-[170px]">Harga Final</th>
                            <th className="text-right px-3 py-2 font-medium w-[170px]">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {pricing.addons.map((a: any, idx: number) => {
                            const qty = Number(a.qty) || 0;
                            const hargaDefault = Number(a.harga_satuan_default) || 0;
                            const hargaFinal = Number(a.harga_satuan_final) || 0;
                            const subtotal = qty * hargaFinal;
                            return (
                              <tr key={String(a.addonId || idx)}>
                                <td className="px-3 py-2">
                                  <div className="font-medium">{a.nama_addon || "—"}</div>
                                  <div className="text-xs text-muted-foreground">{a.kategori_addon || "—"}</div>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <Input
                                    type="number"
                                    min={0}
                                    value={qty || ""}
                                    onChange={(e) => {
                                      const nextQty = Math.max(0, Math.floor(Number(e.target.value || 0)));
                                      setPricing((p: any) => ({
                                        ...p,
                                        addons: p.addons.map((x: any, i: number) => (i === idx ? { ...x, qty: nextQty } : x)),
                                      }));
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">{formatIDR(hargaDefault)}</td>
                                <td className="px-3 py-2 text-right">
                                  <RupiahInput
                                    value={hargaFinal}
                                    onValueChange={(v) =>
                                      setPricing((p: any) => ({
                                        ...p,
                                        addons: p.addons.map((x: any, i: number) => (i === idx ? { ...x, harga_satuan_final: v } : x)),
                                      }))
                                    }
                                    placeholder="Rp"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-primary">{formatIDR(subtotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Biaya Tambahan</Label>
                  <RupiahInput value={Number(pricing.biayaTambahan) || 0} onValueChange={(v) => setPricing((p: any) => ({ ...p, biayaTambahan: v }))} placeholder="Rp" />
                </div>
                <div className="space-y-1.5">
                  <Label>Diskon</Label>
                  <RupiahInput value={Number(pricing.diskon) || 0} onValueChange={(v) => setPricing((p: any) => ({ ...p, diskon: v }))} placeholder="Rp" />
                </div>
              </div>

              {(() => {
                const addonsFinal = (pricing.addons || []).reduce((s: number, a: any) => s + (Number(a.qty) || 0) * (Number(a.harga_satuan_final) || 0), 0);
                const hargaFinalBooking = (Number(pricing.hargaPaketFinal) || 0) + addonsFinal + (Number(pricing.biayaTambahan) || 0) - (Number(pricing.diskon) || 0);
                return (
                  <div className="rounded-lg border border-border p-3 text-sm space-y-1 bg-background">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Add-ons Final</span><span className="font-medium">{formatIDR(addonsFinal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Harga Final Booking</span><span className="font-medium text-primary">{formatIDR(hargaFinalBooking)}</span></div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={pricingSaving}
                  onClick={async () => {
                    try {
                      setPricingSaving(true);
                      await store.updateBookingPricing(booking.id, {
                        harga_paket_final: Number(pricing.hargaPaketFinal) || 0,
                        biaya_tambahan: Number(pricing.biayaTambahan) || 0,
                        diskon: Number(pricing.diskon) || 0,
                        addons: (pricing.addons || []).map((a: any) => ({
                          addonId: a.addonId,
                          nama_addon: a.nama_addon,
                          kategori_addon: a.kategori_addon,
                          deskripsi: a.deskripsi,
                          satuan: a.satuan,
                          qty: Number(a.qty) || 0,
                          harga_satuan_default: Number(a.harga_satuan_default) || 0,
                          harga_satuan_final: Number(a.harga_satuan_final) || 0,
                        })),
                      });
                      toast.success("Review harga tersimpan");
                    } catch (err: any) {
                      toast.error(err?.message || "Gagal menyimpan review harga");
                    } finally {
                      setPricingSaving(false);
                    }
                  }}
                >
                  {pricingSaving ? "Menyimpan..." : "Simpan Review Harga"}
                </Button>
              </div>
            </div>

            {(booking.statusBooking || "menunggu_review") === "menunggu_review" ? (
              <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
                <div>
                  <div className="font-medium">Approval Booking</div>
                  <div className="text-sm text-muted-foreground">Approve cukup dari detail project ini (menu Review Booking tidak diperlukan).</div>
                </div>

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
                          jamMulai: jamMulai || undefined,
                          jamSelesai: jamSelesai || undefined,
                          venue: booking.venue,
                          adatId: booking.adatId,
                          vendorSelectedIds: [],
                        });
                        await store.updateBookingStatus(booking.id, "rejected");
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
                      const vendorSelectedIds = Array.from(
                        new Set(Object.values(selectedVendorByKategori).map(String).filter(Boolean))
                      );
                      if (kategoriRows.length > 0 && vendorSelectedIds.length === 0) {
                        toast.error("Pilih minimal 1 vendor final sebelum approve.");
                        return;
                      }
                      if (!Number(pricing.hargaPaketFinal) || Number(pricing.hargaPaketFinal) <= 0) {
                        toast.error("Harga paket final wajib diisi sebelum approve.");
                        return;
                      }
                      try {
                        setApproving(true);
                        await store.updateBookingPricing(booking.id, {
                          harga_paket_final: Number(pricing.hargaPaketFinal) || 0,
                          biaya_tambahan: Number(pricing.biayaTambahan) || 0,
                          diskon: Number(pricing.diskon) || 0,
                          addons: (pricing.addons || []).map((a: any) => ({
                            addonId: a.addonId,
                            nama_addon: a.nama_addon,
                            kategori_addon: a.kategori_addon,
                            deskripsi: a.deskripsi,
                            satuan: a.satuan,
                            qty: Number(a.qty) || 0,
                            harga_satuan_default: Number(a.harga_satuan_default) || 0,
                            harga_satuan_final: Number(a.harga_satuan_final) || 0,
                          })),
                        });
                        await store.updateEventBooking(booking.id, {
                          clientId: booking.clientId,
                          packageId: booking.packageId,
                          eventDate: booking.eventDate,
                          jamMulai: jamMulai || undefined,
                          jamSelesai: jamSelesai || undefined,
                          venue: booking.venue,
                          adatId: booking.adatId,
                          vendorSelectedIds,
                        });
                        await store.updateBookingStatus(booking.id, "approved");
                        await store.refreshTimelineEvent();
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

        {/* NOTE: tab Documents di-hide sementara sesuai requirement */}
        {/* <TabsContent value="docs">
          <Card className="p-10 border-border shadow-soft text-center text-muted-foreground">
            Tab Documents disiapkan sesuai `wo.md` dan akan diisi bertahap.
          </Card>
        </TabsContent> */}
      </Tabs>
    </>
  );
}
