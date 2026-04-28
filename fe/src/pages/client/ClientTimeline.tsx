import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/lib/dataStore";
import { ambilTimelineClient, updateTimelineClient } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { statusLabel } from "@/lib/labels";

export default function ClientTimeline() {
  const { user } = useAuth();
  const bookings = useBookings();
  const booking = useMemo(() => bookings.find((b) => b.clientId === (user?.clientId || "")), [bookings, user?.clientId]);
  const kodeBooking = String(booking?.code || "");

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

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
      <PageHeader title="Timeline Saya" subtitle={kodeBooking ? `${kodeBooking.toUpperCase()} · ${percent}%` : "Belum ada booking"} />

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
                  <div className="min-w-0">
                    <div className="font-medium capitalize">{String(s.nama_step || "").replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{statusLabel(String(s.status || ""))}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </>
  );
}
