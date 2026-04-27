import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useVendors } from "@/lib/dataStore";
import { Star, Phone, Camera, Utensils, Flower2, Sparkles, Building2, Music } from "lucide-react";
import { AddVendorDialog } from "@/components/dialogs/AddVendorDialog";

const iconMap: Record<string, any> = {
  Catering: Utensils,
  Dekorasi: Flower2,
  Fotografi: Camera,
  MUA: Sparkles,
  Venue: Building2,
  Musik: Music,
};

const Vendors = () => {
  const vendors = useVendors();
  return (
    <>
      <PageHeader
        title="Manajemen Vendor"
        subtitle={`${vendors.length} vendor partner aktif`}
        actions={<AddVendorDialog />}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => {
          const Icon = iconMap[v.category] || Sparkles;
          return (
            <Card key={v.id} className="p-5 border-border shadow-soft hover:shadow-elegant transition-smooth">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="font-medium">{v.rating}</span>
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{v.category}</div>
              <h3 className="font-display text-xl mt-1">{v.name}</h3>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {v.contact}</div>
                <div className="text-primary font-medium">{v.priceRange}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default Vendors;
