import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shirt, Sparkles, Flower2, Upload, ListChecks } from "lucide-react";

export default function MyPreferences() {
  return (
    <>
      <PageHeader title="My Preferences" subtitle="Pilih katalog atau upload referensi untuk tim WO" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-2 font-medium"><Shirt className="w-4 h-4" /> Katalog Baju</div>
          <div className="text-sm text-muted-foreground mt-1">Filter adat, warna, kategori. Pilih sebagai preferensi.</div>
          <Button asChild className="bg-primary hover:bg-primary/90 mt-4">
            <Link to="/client/catalog-baju">Buka</Link>
          </Button>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-2 font-medium"><Flower2 className="w-4 h-4" /> Katalog Dekorasi</div>
          <div className="text-sm text-muted-foreground mt-1">Filter tema, adat, warna. Pilih sebagai preferensi.</div>
          <Button asChild className="bg-primary hover:bg-primary/90 mt-4">
            <Link to="/client/catalog-dekorasi">Buka</Link>
          </Button>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-2 font-medium"><Sparkles className="w-4 h-4" /> Katalog Makeup</div>
          <div className="text-sm text-muted-foreground mt-1">Filter kategori style. Pilih sebagai preferensi.</div>
          <Button asChild className="bg-primary hover:bg-primary/90 mt-4">
            <Link to="/client/catalog-makeup">Buka</Link>
          </Button>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-2 font-medium"><Upload className="w-4 h-4" /> Upload Referensi</div>
          <div className="text-sm text-muted-foreground mt-1">Upload gambar referensi jika belum cocok dengan katalog.</div>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/client/references">Upload</Link>
          </Button>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-2 font-medium"><ListChecks className="w-4 h-4" /> Wishlist</div>
          <div className="text-sm text-muted-foreground mt-1">Catat semua permintaan agar tidak miskomunikasi.</div>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/client/wishlist">Buka</Link>
          </Button>
        </Card>
      </div>
    </>
  );
}

