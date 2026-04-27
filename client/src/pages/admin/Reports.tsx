import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { bookings, clients, formatIDR, invoices, packages } from "@/lib/mockData";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

const Reports = () => {
  const revenue = invoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = invoices.reduce((s, i) => s + (i.amount - i.paid), 0);

  const byPackage = packages.map((p) => ({
    name: p.name,
    bookings: bookings.filter((b) => b.packageId === p.id).length,
    revenue: invoices
      .filter((i) => bookings.find((b) => b.id === i.bookingId)?.packageId === p.id)
      .reduce((s, i) => s + i.paid, 0),
  }));

  const byStatus = ["Lead", "Booked", "Ongoing", "Completed"].map((s) => ({
    name: s,
    count: clients.filter((c) => c.status === s).length,
  }));

  const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];

  return (
    <>
      <PageHeader title="Laporan" subtitle="Ringkasan performa bisnis" />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Klien</div>
          <div className="font-display text-3xl mt-2">{clients.length}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Pendapatan</div>
          <div className="font-display text-3xl text-success mt-2">{formatIDR(revenue)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Outstanding</div>
          <div className="font-display text-3xl text-primary mt-2">{formatIDR(outstanding)}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border shadow-soft">
          <h3 className="font-display text-lg mb-4">Pendapatan per Paket</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byPackage}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1_000_000}jt`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: number) => formatIDR(v)}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <h3 className="font-display text-lg mb-4">Distribusi Status Klien</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {byStatus.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
};

export default Reports;
