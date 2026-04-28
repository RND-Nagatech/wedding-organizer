import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatIDR } from "@/lib/mockData";
import { Heart, Receipt, ListChecks, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookings, useChecklist, useClients, useInvoices, usePackages, usePayments, useTimelineEvent } from "@/lib/dataStore";
import { useEffect, useState } from "react";

const ClientHome = () => {
  const { user } = useAuth();
  const cId = user?.clientId || "";
  const clients = useClients();
  const bookings = useBookings();
  const packages = usePackages();
  const invoices = useInvoices();
  const checklist = useChecklist();
  const payments = usePayments();
  const timelineEvent = useTimelineEvent();

  const client = clients.find((c) => c.id === cId);
  const booking = bookings.find((b) => b.clientId === cId);
  const pkg = packages.find((p) => p.id === client?.packageId);
  const inv = invoices.find((i) => i.clientId === cId);
  const tasks = checklist.filter((t) => t.bookingId === booking?.id);
  // Persiapan: pakai timelineEvent
  const timelineTasks = timelineEvent.filter((t) => t.kode_booking === booking?.code || t.kode_booking === booking?.id);
  const doneTimelineTasks = timelineTasks.filter((t) => t.status === "selesai").length;
  // Pembayaran: pakai payments
  const clientPayments = payments.filter((p) => p.clientCode === client?.code || p.clientName === client?.name);
  const totalDue = clientPayments.reduce((sum, p) => sum + (p.totalDue || 0), 0);
  const totalPaid = clientPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const paymentPercent = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  const eventDateStr = booking?.eventDate || client?.weddingDate || new Date().toISOString().slice(0, 10);
  const eventDate = new Date(eventDateStr);

  // Countdown state
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number}>(() => {
    const now = new Date();
    const diff = Math.max(0, eventDate.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, eventDate.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, [eventDateStr]);

  return (
    <>
      {/* Countdown hero */}
      <Card className="p-6 lg:p-12 mb-8 border-none shadow-none bg-gradient-hero relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent font-medium mb-2">
            <Heart className="w-3 h-3 fill-accent" /> Hari spesial Anda
          </div>
          <h1 className="font-display text-4xl lg:text-6xl mt-1">
            {client?.name || "—"} <em className="text-primary">&</em> {client?.partner || "—"}
          </h1>
          <div className="mt-2 text-muted-foreground text-base lg:text-lg">{eventDateStr ? formatDate(eventDateStr) : "—"}</div>

          <div className="mt-8 flex flex-col items-center w-full">
            <div className="flex flex-row items-end justify-center gap-8 w-full">
              <div className="flex flex-col items-center">
                <span className="font-display text-6xl lg:text-8xl text-primary leading-none">{countdown.days}</span>
                <span className="text-base lg:text-xl font-medium mt-1 text-primary">hari</span>
              </div>
              <div className="flex flex-col items-center">
                <span
                  className="font-mono text-3xl lg:text-5xl tracking-widest rounded-xl px-5 py-2 shadow-md"
                  style={{
                    color: 'var(--primary)',
                    background: 'rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(6px)',
                    border: '1.5px solid var(--primary-100, #e9d8fd)',
                  }}
                >
                  {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
                </span>
                <span className="text-xs lg:text-sm text-primary/60 mt-1 tracking-wide">jam : menit : detik</span>
              </div>
            </div>
            <div
              className="mt-3 text-lg lg:text-2xl font-serif italic text-primary/70 tracking-wide font-semibold"
              style={{ letterSpacing: '0.04em' }}
            >
              menuju momen indah
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Link to="/client/packages">
          <Card className="p-6 border-border shadow-soft hover:shadow-elegant transition-smooth h-full bg-gradient-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Paket Anda</div>
            <div className="font-display text-2xl mt-1">{pkg?.name || "—"}</div>
            <div className="text-sm text-muted-foreground mt-1">{formatIDR(pkg?.price || 0)}</div>
          </Card>
        </Link>

        <Link to="/client/timeline">
          <Card className="p-6 border-border shadow-soft hover:shadow-elegant transition-smooth h-full bg-gradient-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-accent-foreground" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Persiapan</div>
            <div className="font-display text-2xl mt-1">{doneTimelineTasks} / {timelineTasks.length}</div>
            <div className="text-sm text-muted-foreground mt-1">tugas selesai</div>
          </Card>
        </Link>

        <Link to="/client/payments">
          <Card className="p-6 border-border shadow-soft hover:shadow-elegant transition-smooth h-full bg-gradient-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-success" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Pembayaran</div>
            <div className="font-display text-2xl mt-1">{totalDue > 0 ? `${paymentPercent}%` : "—"}</div>
            <div className="text-sm text-muted-foreground mt-1">terbayar dari total</div>
          </Card>
        </Link>
      </div>

      {booking && (
        <Card className="mt-6 p-6 border-border shadow-soft">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Detail Acara</div>
              <h3 className="font-display text-2xl mt-1">{booking.venue}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                {booking.guests} tamu undangan · {formatDate(booking.eventDate)}
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/client/booking">
                Lihat Detail <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default ClientHome;
