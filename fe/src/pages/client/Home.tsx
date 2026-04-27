import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatIDR } from "@/lib/mockData";
import { Heart, CalendarHeart, Receipt, ListChecks, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookings, useChecklist, useClients, useInvoices, usePackages } from "@/lib/dataStore";

const ClientHome = () => {
  const { user } = useAuth();
  const cId = user?.clientId || "";
  const clients = useClients();
  const bookings = useBookings();
  const packages = usePackages();
  const invoices = useInvoices();
  const checklist = useChecklist();

  const client = clients.find((c) => c.id === cId);
  const booking = bookings.find((b) => b.clientId === cId);
  const pkg = packages.find((p) => p.id === client?.packageId);
  const inv = invoices.find((i) => i.clientId === cId);
  const tasks = checklist.filter((t) => t.bookingId === booking?.id);
  const doneTasks = tasks.filter((t) => t.done).length;

  const today = new Date();
  const wedDate = new Date(client?.weddingDate || new Date().toISOString().slice(0, 10));
  const daysToGo = Math.max(0, Math.ceil((wedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <>
      {/* Countdown hero */}
      <Card className="p-8 lg:p-12 mb-8 border-border shadow-elegant bg-gradient-hero relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent font-medium">
            <Heart className="w-3 h-3 fill-accent" /> Hari spesial Anda
          </div>
          <h1 className="font-display text-4xl lg:text-6xl mt-3">
            {client?.name || "—"} <em className="text-primary">&</em> {client?.partner || "—"}
          </h1>
          <div className="mt-4 text-muted-foreground">{client?.weddingDate ? formatDate(client.weddingDate) : "—"}</div>

          <div className="mt-8 flex items-end gap-4">
            <div className="font-display text-7xl lg:text-8xl text-primary leading-none">{daysToGo}</div>
            <div className="pb-3">
              <div className="text-sm font-medium">hari lagi</div>
              <div className="text-xs text-muted-foreground">menuju momen indah</div>
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
            <div className="font-display text-2xl mt-1">{doneTasks} / {tasks.length}</div>
            <div className="text-sm text-muted-foreground mt-1">checklist selesai</div>
          </Card>
        </Link>

        <Link to="/client/invoices">
          <Card className="p-6 border-border shadow-soft hover:shadow-elegant transition-smooth h-full bg-gradient-card group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-success" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Pembayaran</div>
            <div className="font-display text-2xl mt-1">{inv ? `${Math.round((inv.paid / inv.amount) * 100)}%` : "—"}</div>
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
