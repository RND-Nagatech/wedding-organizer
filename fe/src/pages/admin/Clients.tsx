import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/mockData";
import { useClients, usePackages } from "@/lib/dataStore";
import { Search, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { AddClientDialog } from "@/components/dialogs/AddClientDialog";

const Clients = () => {
  const clients = useClients();
  const packages = usePackages();
  const [q, setQ] = useState("");
  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.partner.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Manajemen Klien"
        subtitle={`${clients.length} pasangan terdaftar`}
        actions={<AddClientDialog />}
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama klien..." className="pl-9" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const pkg = packages.find((p) => p.id === c.packageId);
          return (
            <Card key={c.id} className="p-5 border-border shadow-soft hover:shadow-elegant transition-smooth bg-gradient-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg leading-tight">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">& {c.partner}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.phone}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-end justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Hari-H</div>
                  <div className="font-display text-base">{c.weddingDate ? formatDate(c.weddingDate) : "-"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Paket</div>
                  <div className="text-sm font-medium text-primary">{pkg?.name ?? "-"}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default Clients;
