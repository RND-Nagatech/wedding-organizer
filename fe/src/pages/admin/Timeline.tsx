import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { bookings, checklist as initial, clients, formatDate } from "@/lib/mockData";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

const Timeline = ({ bookingId }: { bookingId?: string }) => {
  const targetBookingId = bookingId || "b-001";
  const [items, setItems] = useState(initial);

  const list = useMemo(
    () => items.filter((i) => i.bookingId === targetBookingId).sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    [items, targetBookingId]
  );

  const booking = bookings.find((b) => b.id === targetBookingId);
  const client = clients.find((c) => c.id === booking?.clientId);
  const done = list.filter((i) => i.done).length;
  const progress = list.length ? Math.round((done / list.length) * 100) : 0;

  const toggle = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  return (
    <>
      <PageHeader
        title="Timeline & Checklist"
        subtitle={client ? `${client.name} & ${client.partner} — ${formatDate(booking!.eventDate)}` : "Persiapan acara"}
      />

      <Card className="p-6 border-border shadow-soft mb-6 bg-gradient-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Progres Persiapan</div>
            <div className="font-display text-2xl mt-1">{done} / {list.length} selesai</div>
          </div>
          <div className="font-display text-4xl text-primary">{progress}%</div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-primary transition-smooth" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-3">
          {list.map((item) => (
            <div key={item.id} className="relative pl-12">
              <div className={`absolute left-3 top-4 w-4 h-4 rounded-full border-2 ${
                item.done ? "bg-primary border-primary" : "bg-background border-border"
              }`} />
              <Card className={`p-4 border-border transition-smooth ${item.done ? "bg-muted/30" : "shadow-soft"}`}>
                <div className="flex items-center gap-3">
                  <Checkbox checked={item.done} onCheckedChange={() => toggle(item.id)} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${item.done ? "line-through text-muted-foreground" : ""}`}>
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {formatDate(item.dueDate)}</span>
                      <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent-foreground">{item.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Timeline;
