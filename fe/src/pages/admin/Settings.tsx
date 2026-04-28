import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Settings = () => (
  <>
    <PageHeader title="Pengaturan" subtitle="Kelola tim, akses, dan preferensi bisnis" />

    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6 border-border shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl">Manajemen Tim</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Atur siapa saja yang bisa mengakses sistem</p>
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
            <Link to="/admin/settings/users">
            <UserPlus className="w-4 h-4 mr-1.5" /> Tambah Anggota
            </Link>
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Kelola user dari menu <span className="font-medium text-foreground">Pengaturan → Manajemen User</span>.
        </div>
      </Card>

      <Card className="p-6 border-border shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-display text-lg">Hak Akses</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium text-primary">Owner</div>
            <p className="text-xs text-muted-foreground">Akses penuh termasuk pengaturan sistem</p>
          </div>
          <div>
            <div className="font-medium">Admin</div>
            <p className="text-xs text-muted-foreground">Kelola seluruh data operasional & laporan</p>
          </div>
          <div>
            <div className="font-medium">Staff</div>
            <p className="text-xs text-muted-foreground">Hanya menu operasional: klien, vendor, booking, timeline</p>
          </div>
          <div>
            <div className="font-medium">Klien</div>
            <p className="text-xs text-muted-foreground">Portal pribadi: paket, booking, timeline & invoice mereka</p>
          </div>
        </div>
      </Card>
    </div>

    <Card className="p-6 mt-6 border-border shadow-soft">
      <h3 className="font-display text-xl mb-2">Profil Bisnis</h3>
      <p className="text-sm text-muted-foreground">
        Atur identitas bisnis di menu <span className="font-medium text-foreground">Pengaturan → Profil Bisnis</span>.
      </p>
      <Button asChild className="mt-5 bg-primary hover:bg-primary/90">
        <Link to="/admin/settings/profile">Buka Profil Bisnis</Link>
      </Button>
    </Card>
  </>
);

export default Settings;
