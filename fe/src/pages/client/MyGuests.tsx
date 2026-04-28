import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";

export default function MyGuests() {
  return (
    <>
      <PageHeader title="My Guests" subtitle="RSVP tamu (akan ditambahkan bertahap)" />
      <Card className="p-10 text-center border-border shadow-soft">
        <div className="text-sm text-muted-foreground">
          Modul tamu/RSVP belum diaktifkan di versi ini. Struktur menu sudah disiapkan sesuai `wo.md`.
        </div>
      </Card>
    </>
  );
}

