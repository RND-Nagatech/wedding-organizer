import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useClients, usePackages } from "@/lib/dataStore";
import { formatDate, formatIDR } from "@/lib/mockData";
import { Link } from "react-router-dom";

export default function MyPlanning() {
  const { user } = useAuth();
  const clients = useClients();
  const bookings = useBookings();
  const packages = usePackages();

  const client = clients.find((c) => c.id === (user?.clientId || ""));
  const booking = bookings.find((b) => b.clientId === (user?.clientId || ""));
  const pkg = packages.find((p) => p.id === client?.packageId);

  return (
    <>
      <PageHeader title="My Planning" subtitle="Atur langkah besar persiapan pernikahan" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 border-border shadow-soft space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Paket</div>
          <div className="font-display text-xl">{pkg?.name || "Belum dipilih"}</div>
          <div className="text-sm text-muted-foreground">{pkg ? formatIDR(pkg.price) : "—"}</div>
          <Button asChild className="bg-primary hover:bg-primary/90 mt-2">
            <Link to="/client/packages">{pkg ? "Ganti Paket" : "Pilih Paket"}</Link>
          </Button>
        </Card>

        <Card className="p-5 border-border shadow-soft space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Booking</div>
          <div className="font-display text-xl">{booking ? (booking.code || booking.id).toUpperCase() : "Belum ada booking"}</div>
          <div className="text-sm text-muted-foreground">
            {booking ? `Tanggal: ${formatDate(booking.eventDate)}` : "Lengkapi data booking untuk masuk review WO."}
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 mt-2" disabled={!client?.packageId}>
            <Link to="/client/booking">{booking ? "Lihat Booking" : "Buat Booking"}</Link>
          </Button>
        </Card>

        <Card className="p-5 border-border shadow-soft space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Timeline</div>
          <div className="font-display text-xl">Progress</div>
          <div className="text-sm text-muted-foreground">Timeline muncul setelah booking di-approve.</div>
          <Button asChild variant="outline" className="mt-2">
            <Link to="/client/timeline">Lihat Timeline</Link>
          </Button>
        </Card>
      </div>
    </>
  );
}

