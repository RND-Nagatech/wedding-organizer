import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/mockData";
import { usePackages } from "@/lib/dataStore";
import { Check, Sparkles } from "lucide-react";
import { AddPackageDialog } from "@/components/dialogs/AddPackageDialog";

const Packages = ({ adminMode = true }: { adminMode?: boolean }) => {
  const packages = usePackages();
  return (
    <>
      <PageHeader
        title={adminMode ? "Paket Pernikahan" : "Pilih Paket Anda"}
        subtitle={adminMode ? "Kelola paket yang ditawarkan" : "Temukan paket yang sesuai dengan visi Anda"}
        actions={adminMode ? <AddPackageDialog /> : undefined}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((p) => (
          <Card
            key={p.id}
            className={`p-7 border-border transition-smooth relative ${
              p.popular ? "shadow-elegant border-primary/30 bg-gradient-card" : "shadow-soft hover:shadow-elegant"
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-gold text-accent-foreground text-xs font-medium shadow-gold inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Paling Populer
              </div>
            )}
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">{p.tagline}</div>
            <h3 className="font-display text-2xl mt-2">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-4xl text-primary">{formatIDR(p.price)}</span>
            </div>
            <div className="text-xs text-muted-foreground">mulai dari</div>

            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button className={`mt-6 w-full ${p.popular ? "bg-primary hover:bg-primary/90" : ""}`} variant={p.popular ? "default" : "outline"}>
              {adminMode ? "Edit Paket" : "Pilih Paket Ini"}
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Packages;
