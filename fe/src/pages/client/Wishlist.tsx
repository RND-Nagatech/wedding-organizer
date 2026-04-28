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
import { store, useBookings, useWishlistClient, type ClientWishlist } from "@/lib/dataStore";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const kategoriOptions: ClientWishlist["kategori"][] = ["baju", "dekorasi", "makeup", "aksesori", "rundown", "makanan", "lainnya"];
const prioritasOptions: ClientWishlist["prioritas"][] = ["rendah", "sedang", "tinggi"];

function AddWishlistDialog({ trigger }: { trigger: React.ReactNode }) {
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    kategori: "rundown",
    permintaan: "",
    prioritas: "sedang",
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      kode_booking: bookingOptions[0]?.code ?? "",
      kategori: "rundown",
      permintaan: "",
      prioritas: "sedang",
    });
  }, [open, bookingOptions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Kode booking wajib dipilih";
    if (!form.kategori) next.kategori = "Kategori wajib dipilih";
    if (!form.permintaan) next.permintaan = "Permintaan wajib diisi";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      await store.addWishlistClient({
        kode_booking: form.kode_booking,
        kategori: form.kategori,
        permintaan: form.permintaan,
        prioritas: form.prioritas,
        status: "baru",
      });
      toast.success("Wishlist berhasil ditambahkan");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengirim wishlist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Tambah Wishlist</DialogTitle>
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
            <Label>Permintaan</Label>
            <Textarea value={form.permintaan} onChange={(e) => setForm((f: any) => ({ ...f, permintaan: e.target.value }))} disabled={saving} />
            {errors.permintaan ? <div className="text-xs text-destructive">{errors.permintaan}</div> : null}
          </div>

          <div className="space-y-1.5">
            <Label>Prioritas</Label>
            <Select value={form.prioritas} onValueChange={(v) => setForm((f: any) => ({ ...f, prioritas: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {prioritasOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
              {saving ? "Mengirim..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const ClientWishlist = () => {
  const { user } = useAuth();
  const bookings = useBookings();
  const list = useWishlistClient();
  const rows = useMemo(() => {
    if (!user?.clientId) return list;
    const myCodes = new Set(
      bookings
        .filter((b) => b.clientId === user.clientId)
        .map((b) => String(b.code || "").toLowerCase())
        .filter(Boolean)
    );
    return list.filter((r) => myCodes.has(String(r.kode_booking || "").toLowerCase()));
  }, [list, bookings, user?.clientId]);
  return (
    <>
      <PageHeader
        title="Wishlist Saya"
        subtitle={`${rows.length} item`}
        actions={
          <AddWishlistDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah
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
                <TableHead>Prioritas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permintaan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{(r.kode_booking || "—").toUpperCase()}</TableCell>
                  <TableCell>{r.kategori}</TableCell>
                  <TableCell className="capitalize">{r.prioritas}</TableCell>
                  <TableCell className="capitalize">{r.status}</TableCell>
                  <TableCell className="max-w-[520px] truncate">{r.permintaan}</TableCell>
                  <TableCell className="text-right">
                    <ConfirmActionDialog
                      title="Hapus wishlist?"
                      description="Wishlist yang dihapus tidak bisa dikembalikan."
                      confirmText="Hapus"
                      onConfirm={async () => {
                        try {
                          await store.deleteWishlistClient(r.id);
                          toast.success("Wishlist berhasil dihapus");
                        } catch (err: any) {
                          toast.error(err?.message || "Gagal menghapus wishlist");
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
                    Belum ada wishlist
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

export default ClientWishlist;
