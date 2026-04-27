import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatIDR } from "@/lib/mockData";
import { Receipt } from "lucide-react";
import { useClients, useInvoices } from "@/lib/dataStore";

const Invoices = ({ filterClientId }: { filterClientId?: string }) => {
  const invoices = useInvoices();
  const clients = useClients();
  const list = filterClientId ? invoices.filter((i) => i.clientId === filterClientId) : invoices;
  const totalDue = list.reduce((s, i) => s + (i.amount - i.paid), 0);
  const totalPaid = list.reduce((s, i) => s + i.paid, 0);

  return (
    <>
      <PageHeader title="Invoice & Pembayaran" subtitle={`${list.length} invoice tercatat`} />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Diterima</div>
          <div className="font-display text-3xl text-success mt-2">{formatIDR(totalPaid)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Outstanding</div>
          <div className="font-display text-3xl text-primary mt-2">{formatIDR(totalDue)}</div>
        </Card>
      </div>

      <div className="space-y-3">
        {list.map((inv) => {
          const client = clients.find((c) => c.id === inv.clientId);
          const pct = Math.round((inv.paid / inv.amount) * 100);
          return (
            <Card key={inv.id} className="p-5 border-border shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{inv.id}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{client?.name} · jatuh tempo {formatDate(inv.dueDate)}</div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden max-w-md">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl">{formatIDR(inv.amount)}</div>
                  <div className="text-xs text-muted-foreground">terbayar {formatIDR(inv.paid)}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default Invoices;
