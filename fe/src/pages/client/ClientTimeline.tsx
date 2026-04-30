import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/lib/dataStore";
import { ambilTimelineClient, hapusTimelineClient, tambahTimelineClient, updateTimelineClient } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { statusLabel } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";

export default function ClientTimeline() {
  const { user } = useAuth();
  const bookings = useBookings();
  const booking = useMemo(
    () =>
      bookings
        .filter((b) => b.clientId === (user?.clientId || ""))
        .filter((b) => !["cancelled", "completed", "rejected"].includes(String(b.statusBooking || "")))[0],
    [bookings, user?.clientId]
  );
  const kodeBooking = String(booking?.code || "");

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ nama_step: "", catatan: "", urutan: "" });

  useEffect(() => {
    if (!kodeBooking) return;
    (async () => {
      try {
        setLoading(true);
        const rows = await ambilTimelineClient({ kode_booking: kodeBooking });
        setSteps(Array.isArray(rows) ? rows : []);
      } catch (err: any) {
        setSteps([]);
        toast.error(err?.message || "Gagal mengambil timeline");
      } finally {
        setLoading(false);
      }
    })();
  }, [kodeBooking]);

  const doneCount = steps.filter((s) => s.status === "selesai").length;
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Timeline Saya"
        subtitle={kodeBooking ? `${kodeBooking.toUpperCase()} · ${percent}%` : "Belum ada booking"}
        actions={
          kodeBooking ? (
            <Button
              onClick={() => {
                setEditing(null);
                const maxUrutan = steps.reduce((m, s) => Math.max(m, Number(s.urutan || 0)), 0);
                setForm({ nama_step: "", catatan: "", urutan: String(maxUrutan + 1) });
                setOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Timeline
            </Button>
          ) : undefined
        }
      />

      <Card className="border-border shadow-soft p-6 space-y-4">
        {!kodeBooking ? (
          <div className="text-sm text-muted-foreground">Belum ada booking.</div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat timeline...
          </div>
        ) : steps.length === 0 ? (
          <div className="text-sm text-muted-foreground">Timeline akan muncul setelah booking di-approve.</div>
        ) : (
          <ol className="space-y-3">
            {steps.map((s) => {
              const done = s.status === "selesai";
              const id = String(s._id || s.id);
              const saving = savingIds.has(id);
              return (
                <li key={id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Checkbox
                      checked={done}
                      disabled={saving}
                      onCheckedChange={async (val) => {
                        const nextDone = Boolean(val);
                        const nextStatus = nextDone ? "selesai" : "belum_dikerjakan";
                        try {
                          setSavingIds((prev) => new Set([...Array.from(prev), id]));
                          setSteps((prev) => prev.map((x) => (String(x._id || x.id) === id ? { ...x, status: nextStatus } : x)));
                          await updateTimelineClient(id, { status: nextStatus });
                          toast.success("Checklist tersimpan");
                        } catch (err: any) {
                          setSteps((prev) => prev.map((x) => (String(x._id || x.id) === id ? { ...x, status: s.status } : x)));
                          toast.error(err?.message || "Gagal menyimpan checklist");
                        } finally {
                          setSavingIds((prev) => {
                            const next = new Set(prev);
                            next.delete(id);
                            return next;
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium capitalize">{String(s.nama_step || "").replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{statusLabel(String(s.status || ""))}</div>
                    {s.catatan ? <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{s.catatan}</div> : null}
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={saving}
                      onClick={() => {
                        setEditing(s);
                        setForm({
                          nama_step: String(s.nama_step || ""),
                          catatan: String(s.catatan || ""),
                          urutan: String(typeof s.urutan === "number" ? s.urutan : s.urutan || ""),
                        });
                        setOpen(true);
                      }}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <ConfirmActionDialog
                      title="Hapus timeline?"
                      description="Item timeline ini akan dihapus."
                      confirmText="Hapus"
                      onConfirm={async () => {
                        try {
                          setSavingIds((prev) => new Set([...Array.from(prev), id]));
                          await hapusTimelineClient(id);
                          setSteps((prev) => prev.filter((x) => String(x._id || x.id) !== id));
                          toast.success("Timeline berhasil dihapus");
                        } catch (err: any) {
                          toast.error(err?.message || "Gagal menghapus timeline");
                        } finally {
                          setSavingIds((prev) => {
                            const next = new Set(prev);
                            next.delete(id);
                            return next;
                          });
                        }
                      }}
                      trigger={
                        <Button variant="destructive" size="icon" disabled={saving} aria-label="Hapus" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editing ? "Edit Timeline" : "Tambah Timeline"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Step</Label>
              <Input value={form.nama_step} onChange={(e) => setForm((f) => ({ ...f, nama_step: e.target.value }))} placeholder="Contoh: Technical meeting" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Urutan (Opsional)</Label>
                <Input
                  inputMode="numeric"
                  value={form.urutan}
                  onChange={(e) => setForm((f) => ({ ...f, urutan: e.target.value.replace(/[^\d]/g, "") }))}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="h-10 rounded-md border border-border px-3 flex items-center text-sm">
                  {statusLabel(String(editing?.status || "belum_dikerjakan"))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Catatan (Opsional)</Label>
              <Textarea value={form.catatan} onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))} placeholder="Catatan tambahan..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button
              onClick={async () => {
                const nama = form.nama_step.trim();
                if (!nama) {
                  toast.error("Nama step wajib diisi");
                  return;
                }
                try {
                  const urutan = form.urutan ? Number(form.urutan) : undefined;
                  if (editing) {
                    const id = String(editing._id || editing.id);
                    setSavingIds((prev) => new Set([...Array.from(prev), id]));
                    const updated = await updateTimelineClient(id, { nama_step: nama, catatan: form.catatan || undefined, urutan });
                    setSteps((prev) => prev.map((x) => (String(x._id || x.id) === id ? updated : x)));
                    toast.success("Timeline berhasil diupdate");
                  } else {
                    const created = await tambahTimelineClient({
                      kode_booking: kodeBooking,
                      nama_step: nama,
                      catatan: form.catatan || undefined,
                      urutan: typeof urutan === "number" ? urutan : undefined,
                      status: "belum_dikerjakan",
                    });
                    setSteps((prev) => [...prev, created].sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0)));
                    toast.success("Timeline berhasil ditambahkan");
                  }
                  setOpen(false);
                } catch (err: any) {
                  toast.error(err?.message || "Gagal menyimpan timeline");
                } finally {
                  if (editing) {
                    const id = String(editing._id || editing.id);
                    setSavingIds((prev) => {
                      const next = new Set(prev);
                      next.delete(id);
                      return next;
                    });
                  }
                }
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
