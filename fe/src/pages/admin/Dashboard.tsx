import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatIDR } from "@/lib/mockData";
import { useClients, useVendors, usePackages, useBookings, useInvoices } from "@/lib/dataStore";
import { CalendarDays, Users, Receipt, TrendingUp, Heart, ArrowUpRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSystemProfile } from "@/contexts/SystemProfileContext";

const AdminDashboard = () => {
  const { profile } = useSystemProfile();
  const clients = useClients();
  const vendors = useVendors();
  const packages = usePackages();
  const bookings = useBookings();
  const invoices = useInvoices();

  const totalRevenue = invoices.reduce((s, i) => s + (i.paid || i.dibayar || 0), 0);
  const pendingApproval = bookings
    .filter((b) => (b.statusBooking || "menunggu_review") === "menunggu_review")
    .sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")));
  const upcoming = bookings
    .filter((b) => new Date(b.eventDate) >= new Date())
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));

  const stats = [
    { label: "Total Klien", value: clients.length, icon: Users, hint: "+2 bulan ini", color: "text-primary" },
    { label: "Event Mendatang", value: upcoming.length, icon: CalendarDays, hint: "30 hari", color: "text-accent" },
    { label: "Vendor Aktif", value: vendors.length, icon: Heart, hint: "6 kategori", color: "text-primary" },
    { label: "Total Pemasukan", value: formatIDR(totalRevenue), icon: TrendingUp, hint: "+12% YoY", color: "text-success" },
  ];

  return (
    <>
      <PageHeader
        title="Selamat datang kembali ✨"
        subtitle={`Berikut ringkasan operasi ${profile?.nama_bisnis || "Wedding Organizer"} hari ini.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 border-border shadow-soft bg-gradient-card">
            <div className="flex items-start justify-between">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.hint}</span>
            </div>
            <div className="mt-4 font-display text-2xl">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-xl">Event Mendatang</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Jadwal pernikahan terdekat</p>
            </div>
            <Link to="/admin/bookings" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
              Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((b) => {
              const client = clients.find((c) => c.id === b.clientId);
              const pkg = packages.find((p) => p.id === b.packageId);
              return (
                <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-smooth">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex flex-col items-center justify-center text-primary-foreground shrink-0">
                    <span className="text-[10px] uppercase">{new Date(b.eventDate).toLocaleString("id", { month: "short" })}</span>
                    <span className="font-display text-lg leading-none">{new Date(b.eventDate).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{client?.name} & {client?.partner}</div>
                    <div className="text-xs text-muted-foreground truncate">{b.venue} · {b.guests} tamu · {pkg?.name}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-xl">Menunggu Approval</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Booking yang perlu direview WO</p>
            </div>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {pendingApproval.slice(0, 6).map((b) => {
              const pkg = packages.find((p) => p.id === b.packageId);
              return (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{b.clientName || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {(b.code || b.id).toUpperCase()} · {formatDate(b.eventDate)} · {pkg?.name || "-"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Link
                      to={`/admin/projects/${b.id}`}
                      className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      Review <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
            {pendingApproval.length === 0 ? (
              <div className="text-sm text-muted-foreground">Tidak ada booking menunggu approval.</div>
            ) : null}
          </div>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
