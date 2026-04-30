import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/lib/dataStore";
import { ambilFormulirDigitalByBooking, upsertFormulirDigital } from "@/lib/api";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { Download, Save, Pencil } from "lucide-react";
import { useSystemProfile } from "@/contexts/SystemProfileContext";
import { buildSimpleProfessionalPdf } from "@/lib/pdfTemplate";

async function exportFormToPdf(opts: { kode_booking: string; data: any }) {
  await buildSimpleProfessionalPdf({
    businessName: (opts as any).businessName || "Wedding Organizer",
    title: "Formulir Digital Acara",
    meta: [
      { label: "Kode Booking", value: String(opts.kode_booking || "").toUpperCase() },
      { label: "Tanggal Cetak", value: new Date().toISOString() },
    ],
    sections: [
      {
        title: "Data Acara",
        fields: [
          { label: "Nama Pengantin Pria", value: opts.data?.nama_pengantin_pria },
          { label: "Nama Pengantin Wanita", value: opts.data?.nama_pengantin_wanita },
          { label: "Orang Tua Pria", value: opts.data?.nama_orang_tua_pria },
          { label: "Orang Tua Wanita", value: opts.data?.nama_orang_tua_wanita },
          { label: "Wali", value: opts.data?.nama_wali },
          { label: "Saksi 1", value: opts.data?.nama_saksi_1 },
          { label: "Saksi 2", value: opts.data?.nama_saksi_2 },
          { label: "MC", value: opts.data?.nama_MC },
          { label: "Penghulu / Pemuka Agama", value: opts.data?.nama_penghulu },
          { label: "Lokasi Akad", value: opts.data?.lokasi_akad },
          { label: "Jam Akad", value: opts.data?.jam_akad },
          { label: "Lokasi Resepsi", value: opts.data?.lokasi_resepsi },
          { label: "Jam Resepsi", value: opts.data?.jam_resepsi },
          { label: "Adat / Konsep", value: opts.data?.adat_konsep },
          { label: "Warna Tema", value: opts.data?.warna_tema },
          { label: "Jumlah Tamu", value: String(opts.data?.jumlah_tamu ?? "") },
        ],
      },
      {
        title: "Preferensi & Catatan",
        fields: [
          { label: "Request Lagu", value: opts.data?.request_lagu },
          { label: "Request Makanan", value: opts.data?.request_makanan },
          { label: "Catatan Khusus", value: opts.data?.catatan_khusus },
          { label: "Susunan Acara / Rundown", value: opts.data?.susunan_acara },
        ],
      },
    ],
    filename: `formulir-${String(opts.kode_booking || "").toLowerCase()}.pdf`,
  });
}

const kategoriJamPlaceholder = "contoh: 08:00";

export default function DigitalForm() {
  const { user } = useAuth();
  const { profile } = useSystemProfile();
  const bookings = useBookings();
  const booking = useMemo(() => bookings.find((b) => b.clientId === (user?.clientId || "")), [bookings, user?.clientId]);
  const kodeBooking = String(booking?.code || "");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    nama_pengantin_pria: "",
    nama_pengantin_wanita: "",
    nama_orang_tua_pria: "",
    nama_orang_tua_wanita: "",
    nama_wali: "",
    nama_saksi_1: "",
    nama_saksi_2: "",
    nama_MC: "",
    nama_penghulu: "",
    lokasi_akad: "",
    jam_akad: "",
    lokasi_resepsi: "",
    jam_resepsi: "",
    adat_konsep: "",
    warna_tema: "",
    jumlah_tamu: "",
    request_lagu: "",
    request_makanan: "",
    catatan_khusus: "",
    susunan_acara: "",
  });

  useEffect(() => {
    if (!kodeBooking) return;
    (async () => {
      try {
        setLoading(true);
        const data = await ambilFormulirDigitalByBooking(kodeBooking);
        if (data && data.kode_booking) {
          setForm((f: any) => ({ ...f, ...data }));
          setReadOnly(true);
        } else {
          setForm((f: any) => ({ ...f, kode_booking: kodeBooking }));
          setReadOnly(false);
        }
      } catch {
        setForm((f: any) => ({ ...f, kode_booking: kodeBooking }));
        setReadOnly(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [kodeBooking]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib ada";
    if (!form.nama_pengantin_pria) next.nama_pengantin_pria = "Nama pengantin pria wajib diisi";
    if (!form.nama_pengantin_wanita) next.nama_pengantin_wanita = "Nama pengantin wanita wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }
    try {
      setSaving(true);
      await upsertFormulirDigital(form);
      toast.success("Formulir berhasil disimpan");
      setReadOnly(true);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan formulir");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Formulir Digital Acara"
        subtitle={kodeBooking ? kodeBooking.toUpperCase() : "Belum ada booking"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!kodeBooking || loading}
              onClick={() => exportFormToPdf({ kode_booking: kodeBooking, data: form, businessName: profile?.nama_bisnis || "Wedding Organizer" } as any)}
            >
              <Download className="w-4 h-4 mr-1.5" /> Export PDF
            </Button>
            {readOnly ? (
              <Button variant="outline" onClick={() => setReadOnly(false)} disabled={loading || saving}>
                <Pencil className="w-4 h-4 mr-1.5" /> Edit
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="border-border shadow-soft p-6">
        {!kodeBooking ? (
          <div className="text-sm text-muted-foreground">Buat booking terlebih dahulu.</div>
        ) : loading ? (
          <div className="text-sm text-muted-foreground">Memuat data...</div>
        ) : readOnly ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 bg-muted/10">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Hasil Form</div>
              <div className="text-sm text-muted-foreground mt-1">Form tersimpan. Klik Edit bila ingin mengubah.</div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ["Nama Pengantin Pria", form.nama_pengantin_pria],
                ["Nama Pengantin Wanita", form.nama_pengantin_wanita],
                ["Nama Orang Tua Pria", form.nama_orang_tua_pria],
                ["Nama Orang Tua Wanita", form.nama_orang_tua_wanita],
                ["Wali", form.nama_wali],
                ["Saksi 1", form.nama_saksi_1],
                ["Saksi 2", form.nama_saksi_2],
                ["MC", form.nama_MC],
                ["Penghulu/Pemuka Agama", form.nama_penghulu],
                ["Lokasi Akad", form.lokasi_akad],
                ["Jam Akad", form.jam_akad],
                ["Lokasi Resepsi", form.lokasi_resepsi],
                ["Jam Resepsi", form.jam_resepsi],
                ["Adat/Konsep", form.adat_konsep],
                ["Warna Tema", form.warna_tema],
                ["Jumlah Tamu", form.jumlah_tamu],
                ["Request Lagu", form.request_lagu],
                ["Request Makanan", form.request_makanan],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border border-border p-3 bg-background">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="font-medium mt-1 whitespace-pre-wrap">{value || "—"}</div>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-lg border border-border p-3 bg-background">
                <div className="text-xs text-muted-foreground">Catatan Khusus</div>
                <div className="font-medium mt-1 whitespace-pre-wrap">{form.catatan_khusus || "—"}</div>
              </div>
              <div className="sm:col-span-2 rounded-lg border border-border p-3 bg-background">
                <div className="text-xs text-muted-foreground">Susunan Acara / Rundown Sementara</div>
                <div className="font-medium mt-1 whitespace-pre-wrap">{form.susunan_acara || "—"}</div>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label>Kode Booking</Label>
              <Input value={form.kode_booking} disabled />
              {errors.kode_booking ? <div className="text-xs text-destructive">{errors.kode_booking}</div> : null}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nama Pengantin Pria</Label>
                <Input value={form.nama_pengantin_pria} onChange={(e) => setForm((f: any) => ({ ...f, nama_pengantin_pria: e.target.value }))} />
                {errors.nama_pengantin_pria ? <div className="text-xs text-destructive">{errors.nama_pengantin_pria}</div> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Nama Pengantin Wanita</Label>
                <Input value={form.nama_pengantin_wanita} onChange={(e) => setForm((f: any) => ({ ...f, nama_pengantin_wanita: e.target.value }))} />
                {errors.nama_pengantin_wanita ? <div className="text-xs text-destructive">{errors.nama_pengantin_wanita}</div> : null}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nama Orang Tua Pria</Label>
                <Input value={form.nama_orang_tua_pria} onChange={(e) => setForm((f: any) => ({ ...f, nama_orang_tua_pria: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Orang Tua Wanita</Label>
                <Input value={form.nama_orang_tua_wanita} onChange={(e) => setForm((f: any) => ({ ...f, nama_orang_tua_wanita: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Wali</Label>
                <Input value={form.nama_wali} onChange={(e) => setForm((f: any) => ({ ...f, nama_wali: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Saksi 1</Label>
                <Input value={form.nama_saksi_1} onChange={(e) => setForm((f: any) => ({ ...f, nama_saksi_1: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Saksi 2</Label>
                <Input value={form.nama_saksi_2} onChange={(e) => setForm((f: any) => ({ ...f, nama_saksi_2: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>MC</Label>
                <Input value={form.nama_MC} onChange={(e) => setForm((f: any) => ({ ...f, nama_MC: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Penghulu / Pemuka Agama</Label>
                <Input value={form.nama_penghulu} onChange={(e) => setForm((f: any) => ({ ...f, nama_penghulu: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Lokasi Akad</Label>
                <Input value={form.lokasi_akad} onChange={(e) => setForm((f: any) => ({ ...f, lokasi_akad: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Jam Akad</Label>
                <Input value={form.jam_akad} onChange={(e) => setForm((f: any) => ({ ...f, jam_akad: e.target.value }))} placeholder={kategoriJamPlaceholder} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Lokasi Resepsi</Label>
                <Input value={form.lokasi_resepsi} onChange={(e) => setForm((f: any) => ({ ...f, lokasi_resepsi: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Jam Resepsi</Label>
                <Input value={form.jam_resepsi} onChange={(e) => setForm((f: any) => ({ ...f, jam_resepsi: e.target.value }))} placeholder={kategoriJamPlaceholder} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Adat / Konsep</Label>
                <Input value={form.adat_konsep} onChange={(e) => setForm((f: any) => ({ ...f, adat_konsep: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Warna Tema</Label>
                <Input value={form.warna_tema} onChange={(e) => setForm((f: any) => ({ ...f, warna_tema: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah Tamu</Label>
                <Input type="number" value={form.jumlah_tamu} onChange={(e) => setForm((f: any) => ({ ...f, jumlah_tamu: e.target.value }))} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Request Lagu</Label>
                <Input value={form.request_lagu} onChange={(e) => setForm((f: any) => ({ ...f, request_lagu: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Request Makanan</Label>
                <Input value={form.request_makanan} onChange={(e) => setForm((f: any) => ({ ...f, request_makanan: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Catatan Khusus</Label>
              <Textarea value={form.catatan_khusus} onChange={(e) => setForm((f: any) => ({ ...f, catatan_khusus: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Susunan Acara / Rundown Sementara</Label>
              <Textarea rows={6} value={form.susunan_acara} onChange={(e) => setForm((f: any) => ({ ...f, susunan_acara: e.target.value }))} />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                <Save className="w-4 h-4 mr-1.5" /> {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </>
  );
}
