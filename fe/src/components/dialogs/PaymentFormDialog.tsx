import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { store, useBookings, useClients, usePackages, usePayments, type Payment } from "@/lib/dataStore";
import { toast } from "sonner";
import { formatIDR } from "@/lib/mockData";
import { RupiahInput } from "@/components/RupiahInput";

export const PaymentFormDialog = ({
  mode,
  initial,
  trigger,
  fixedKodeBooking,
}: {
  mode: "add" | "edit";
  initial?: Payment;
  trigger: React.ReactNode;
  fixedKodeBooking?: string;
}) => {
  const bookings = useBookings();
  const clients = useClients();
  const packages = usePackages();
  const payments = usePayments();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({
    kode_booking: "",
    nominal_bayar: 0,
    metode_pembayaran: "transfer",
    tanggal_pembayaran: new Date().toISOString().slice(0, 10),
    jenis_pembayaran: "DP",
    catatan: "",
  });

  // Hanya tampilkan booking yang sudah approved dan event belum selesai
  const bookingOptions = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.code &&
          (b.statusBooking === "approved" || b.reviewStatus === "approved") &&
          (b.eventStatus !== "selesai" && b.eventStatus !== "batal")
      ),
    [bookings]
  );

  useEffect(() => {
    if (!open) return;
    setForm({
      kode_booking: fixedKodeBooking || initial?.bookingCode || "",
      nominal_bayar: initial?.amountPaid ?? 0,
      metode_pembayaran: initial?.method ?? "transfer",
      tanggal_pembayaran: initial?.paidDate ?? new Date().toISOString().slice(0, 10),
      jenis_pembayaran: initial?.paymentType ?? "DP",
      catatan: initial?.note ?? "",
    });
    setErrors({});
  }, [open, bookingOptions, initial, fixedKodeBooking]);

  const booking = bookings.find((b) => b.code === form.kode_booking);
  const client = clients.find((c) => c.id === booking?.clientId);
  const pkg = packages.find((p) => p.id === booking?.packageId);

  const totalTagihan = Number(booking?.hargaFinalBooking) || Number(booking?.packageSnapshot?.price) || Number(pkg?.price) || 0;
  const totalPaid = payments
    .filter((p) => p.bookingCode === form.kode_booking && (mode === "edit" ? p.id !== initial?.id : true))
    .reduce((s, p) => s + p.amountPaid, 0);
  const remaining = Math.max(totalTagihan - totalPaid, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.kode_booking) next.kode_booking = "Booking wajib dipilih";
    if (!form.metode_pembayaran) next.metode_pembayaran = "Metode wajib diisi";
    if (!form.tanggal_pembayaran) next.tanggal_pembayaran = "Tanggal wajib diisi";
    if (!form.nominal_bayar || Number(form.nominal_bayar) <= 0) next.nominal_bayar = "Nominal bayar harus > 0";
    if (remaining > 0 && Number(form.nominal_bayar) > remaining) next.nominal_bayar = "Nominal melebihi sisa tagihan";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Lengkapi field yang wajib diisi");
      return;
    }

    try {
      setSaving(true);
      if (mode === "add") {
        await store.addPayment({
          kode_booking: form.kode_booking,
          nominal_bayar: Number(form.nominal_bayar),
          metode_pembayaran: form.metode_pembayaran,
          tanggal_pembayaran: form.tanggal_pembayaran,
          jenis_pembayaran: form.jenis_pembayaran,
          catatan: form.catatan || undefined,
        } as any);
        toast.success("Pembayaran berhasil disimpan");
      } else if (initial?.id) {
        await store.updatePayment(initial.id, {
          nominal_bayar: Number(form.nominal_bayar),
          metode_pembayaran: form.metode_pembayaran,
          tanggal_pembayaran: form.tanggal_pembayaran,
          catatan: form.catatan,
        });
        toast.success("Pembayaran berhasil diperbarui");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan pembayaran");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{mode === "add" ? "Input Pembayaran" : "Edit Pembayaran"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Booking</Label>
            <Select
              value={form.kode_booking}
              onValueChange={(v) => setForm((f: any) => ({ ...f, kode_booking: v }))}
              disabled={saving || mode === "edit" || Boolean(fixedKodeBooking)}
            >
              <SelectTrigger><SelectValue placeholder="Pilih booking" /></SelectTrigger>
              <SelectContent>
                {/* Searchable input */}
                <div className="px-2 py-1 sticky top-0 z-10 bg-popover">
                  <input
                    type="text"
                    className="w-full rounded border px-2 py-1 text-sm focus:outline-none"
                    placeholder="Cari booking..."
                    value={form._searchBooking || ""}
                    onChange={e => setForm((f: any) => ({ ...f, _searchBooking: e.target.value }))}
                    autoFocus
                  />
                </div>
                {(bookingOptions.filter(b => {
                  const c = clients.find((x) => x.id === b.clientId);
                  const search = (form._searchBooking || "").toLowerCase();
                  return (
                    !search ||
                    (b.code?.toLowerCase().includes(search)) ||
                    (c?.name?.toLowerCase().includes(search)) ||
                    (c?.partner?.toLowerCase().includes(search))
                  );
                })).map((b) => {
                  const c = clients.find((x) => x.id === b.clientId);
                  return (
                    <SelectItem key={b.id} value={b.code!}>
                      {(b.code || b.id).toUpperCase()} · {c?.name || "-"} & {c?.partner || "-"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.kode_booking ? <div className="text-xs text-destructive">{errors.kode_booking}</div> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal Pembayaran</Label>
              <Input
                type="date"
                value={form.tanggal_pembayaran}
                onChange={(e) => setForm((f: any) => ({ ...f, tanggal_pembayaran: e.target.value }))}
                disabled={saving}
              />
              {errors.tanggal_pembayaran ? <div className="text-xs text-destructive">{errors.tanggal_pembayaran}</div> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Metode</Label>
              <Select value={form.metode_pembayaran} onValueChange={(v) => setForm((f: any) => ({ ...f, metode_pembayaran: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["transfer", "cash", "qris", "kartu"].map((m) => (
                    <SelectItem key={m} value={m}>{m.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.metode_pembayaran ? <div className="text-xs text-destructive">{errors.metode_pembayaran}</div> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Jenis Pembayaran</Label>
              <Select value={form.jenis_pembayaran} onValueChange={(v) => setForm((f: any) => ({ ...f, jenis_pembayaran: v }))} disabled={saving || mode === "edit"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DP">DP</SelectItem>
                  <SelectItem value="cicilan">Cicilan</SelectItem>
                  <SelectItem value="pelunasan">Pelunasan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nominal Bayar</Label>
              <RupiahInput value={Number(form.nominal_bayar) || 0} onValueChange={(v) => setForm((f: any) => ({ ...f, nominal_bayar: v }))} disabled={saving} placeholder="Rp" />
              {errors.nominal_bayar ? <div className="text-xs text-destructive">{errors.nominal_bayar}</div> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (Opsional)</Label>
            <Textarea value={form.catatan} onChange={(e) => setForm((f: any) => ({ ...f, catatan: e.target.value }))} disabled={saving} />
          </div>

          <div className="rounded-lg border border-border p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Kode Client</span><span>{client?.code || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nama Client</span><span>{client ? `${client.name} & ${client.partner}` : "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Tagihan</span><span>{formatIDR(totalTagihan)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Terbayar</span><span>{formatIDR(totalPaid)}</span></div>
            <div className="flex justify-between font-medium"><span className="text-muted-foreground">Sisa</span><span>{formatIDR(remaining)}</span></div>
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
};
