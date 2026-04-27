import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { bookings, clients, formatDate, packages } from "@/lib/mockData";
import { Plus, MapPin, Users as UsersIcon } from "lucide-react";

const Bookings = () => (
  <>
    <PageHeader
      title="Booking Event"
      subtitle={`${bookings.length} booking terdaftar`}
      actions={
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" /> Booking Baru
        </Button>
      }
    />

    <Card className="border-border shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Booking</th>
              <th className="text-left px-5 py-3 font-medium">Klien</th>
              <th className="text-left px-5 py-3 font-medium">Tanggal</th>
              <th className="text-left px-5 py-3 font-medium">Venue</th>
              <th className="text-left px-5 py-3 font-medium">Tamu</th>
              <th className="text-left px-5 py-3 font-medium">Paket</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => {
              const client = clients.find((c) => c.id === b.clientId);
              const pkg = packages.find((p) => p.id === b.packageId);
              return (
                <tr key={b.id} className="hover:bg-muted/30 transition-smooth">
                  <td className="px-5 py-4 font-medium">{b.id.toUpperCase()}</td>
                  <td className="px-5 py-4">
                    <div>{client?.name}</div>
                    <div className="text-xs text-muted-foreground">& {client?.partner}</div>
                  </td>
                  <td className="px-5 py-4">{formatDate(b.eventDate)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> {b.venue}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-3.5 h-3.5 text-muted-foreground" /> {b.guests}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-primary font-medium">{pkg?.name}</td>
                  <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </>
);

export default Bookings;
