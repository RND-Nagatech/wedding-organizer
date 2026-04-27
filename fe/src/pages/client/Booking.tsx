import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { bookings, clients, formatDate, packages } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarDays, MapPin, Users as UsersIcon, Heart } from "lucide-react";

const ClientBooking = () => {
  const { user } = useAuth();
  const cId = user?.clientId || "c-001";
  const client = clients.find((c) => c.id === cId)!;
  const booking = bookings.find((b) => b.clientId === cId);
  const pkg = packages.find((p) => p.id === client.packageId);

  if (!booking) {
    return (
      <>
        <PageHeader title="Booking Saya" />
        <Card className="p-12 text-center border-border shadow-soft">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Belum ada booking. Silakan pilih paket terlebih dahulu.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Booking Saya" subtitle={`Konfirmasi: ${booking.id.toUpperCase()}`} />

      <Card className="p-8 border-border shadow-elegant bg-gradient-card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Pernikahan</div>
            <h2 className="font-display text-3xl mt-1">{client.name} & {client.partner}</h2>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><CalendarDays className="w-3.5 h-3.5" /> Tanggal</div>
            <div className="font-display text-lg mt-1">{formatDate(booking.eventDate)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Venue</div>
            <div className="font-display text-lg mt-1">{booking.venue}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><UsersIcon className="w-3.5 h-3.5" /> Tamu</div>
            <div className="font-display text-lg mt-1">{booking.guests} orang</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border shadow-soft">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">Paket Terpilih</div>
        <h3 className="font-display text-2xl mt-1">{pkg?.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{pkg?.tagline}</p>

        <ul className="mt-5 grid sm:grid-cols-2 gap-2">
          {pkg?.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Heart className="w-3.5 h-3.5 text-primary fill-primary mt-1 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
};

export default ClientBooking;
