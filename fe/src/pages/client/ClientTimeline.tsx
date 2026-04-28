import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/lib/dataStore";
import { ambilTimelineClient } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export default function ClientTimeline() {
  const { user } = useAuth();
  const bookings = useBookings();
  const booking = useMemo(() => bookings.find((b) => b.clientId === (user?.clientId || "")), [bookings, user?.clientId]);
  const kodeBooking = String(booking?.code || "");

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);

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
              return (
                <li key={String(s._id || s.id)} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium capitalize">{String(s.nama_step || "").replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground capitalize">{s.status}</div>
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

