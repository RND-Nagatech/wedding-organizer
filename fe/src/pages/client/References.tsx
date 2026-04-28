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
import { store, useBookings, useReferensiClient, type ClientReference } from "@/lib/dataStore";
import { toast } from "sonner";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { uploadGambar } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const kategoriOptions: ClientReference["kategori"][] = ["baju", "dekorasi", "makeup", "aksesori", "lainnya"];

function AddReferenceDialog({ trigger }: { trigger: React.ReactNode }) {
  const { user } = useAuth();
  const bookings = useBookings();
  const bookingOptions = useMemo(() => {
    const rows = user?.clientId ? bookings.filter((b) => b.clientId === user.clientId) : bookings;
    return rows
      .map((b) => ({ code: b.code || "", label: `${(b.code || "").toUpperCase()} · ${b.clientName || "—"}` }))
      .filter((x) => x.code);
  }, [bookings, user?.clientId]);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    kategori: "baju",
    upload_gambar: "",
    judul_referensi: "",
    catatan_client: "",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      kode_booking: bookingOptions[0]?.code ?? "",
      kategori: "baju",
      upload_gambar: "",
      judul_referensi: "",
      catatan_client: "",
    });
  }, [open, bookingOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib dipilih";
    if (!form.kategori) next.kategori = "Kategori wajib dipilih";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      await store.addReferensiClient({
        kode_booking: form.kode_booking,
        kategori: form.kategori,
        upload_gambar: form.upload_gambar || undefined,
        judul_referensi: form.judul_referensi || undefined,
        catatan_client: form.catatan_client || undefined,
        status: "diajukan",
      });
      toast.success("Referensi berhasil diajukan");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengirim referensi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Upload Referensi</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Booking</Label>
              <Select value={form.kode_booking} onValueChange={(v) => setForm((f: any) => ({ ...f, kode_booking: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih booking" /></SelectTrigger>
                <SelectContent>
                  {bookingOptions.map((b) => (
                    <SelectItem key={b.code} value={b.code}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kode_booking ? <div className="text-xs text-destructive">{errors.kode_booking}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm((f: any) => ({ ...f, kategori: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kategori ? <div className="text-xs text-destructive">{errors.kategori}</div> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Judul (Opsional)</Label>
            <Input value={form.judul_referensi} onChange={(e) => setForm((f: any) => ({ ...f, judul_referensi: e.target.value }))} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label>Gambar (Opsional)</Label>
            <Input
              type="file"
              accept="image/*"
              disabled={saving || uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploading(true);
                  const { url } = await uploadGambar(file);
                  setForm((f: any) => ({ ...f, upload_gambar: url }));
                  toast.success("Gambar berhasil diupload");
                } catch (err: any) {
                  toast.error(err?.message || "Gagal upload gambar");
                } finally {
                  setUploading(false);
                }
              }}
            />
            {form.upload_gambar ? (
              <div className="mt-2 rounded-md border border-border overflow-hidden">
                <img src={`${API_ORIGIN}${form.upload_gambar}`} alt="Referensi" className="w-full h-44 object-cover" />
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (Opsional)</Label>
            <Textarea value={form.catatan_client} onChange={(e) => setForm((f: any) => ({ ...f, catatan_client: e.target.value }))} disabled={saving} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving || uploading}>
              {saving ? "Mengirim..." : "Kirim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const ClientReferences = () => {
  const { user } = useAuth();
  const list = useReferensiClient();

  const rows = useMemo(() => {
    if (!user?.clientId) return list;
    return list.filter((r) => {
      // Best-effort filter: kode_booking milik clientId akan difilter di server idealnya.
      // MVP: tampilkan semua jika data booking tidak terhubung ke auth.
      return true;
    });
  }, [list, user?.clientId]);

  return (
    <>
      <PageHeader
        title="Referensi Saya"
        subtitle={`${rows.length} referensi`}
        actions={
          <AddReferenceDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Upload
              </Button>
            }
          />
        }
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gambar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{(r.kode_booking || "—").toUpperCase()}</TableCell>
                  <TableCell>{r.kategori}</TableCell>
                  <TableCell>{r.judul_referensi || "—"}</TableCell>
                  <TableCell className="capitalize">{r.status}</TableCell>
                  <TableCell>
                    {r.upload_gambar ? (
                      <a className="inline-flex items-center gap-2 text-primary hover:underline" href={`${API_ORIGIN}${r.upload_gambar}`} target="_blank" rel="noreferrer">
                        <ImageIcon className="w-4 h-4" /> Lihat
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmActionDialog
                      title="Hapus referensi?"
                      description="Referensi yang dihapus tidak bisa dikembalikan."
                      confirmText="Hapus"
                      onConfirm={async () => {
                        try {
                          await store.deleteReferensiClient(r.id);
                          toast.success("Referensi berhasil dihapus");
                        } catch (err: any) {
                          toast.error(err?.message || "Gagal menghapus referensi");
                        }
                      }}
                      trigger={
                        <Button size="icon" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Belum ada referensi
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
};

export default ClientReferences;

