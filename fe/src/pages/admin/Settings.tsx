import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockAccounts } from "@/lib/mockAccounts";
import { roleLabel } from "@/lib/mockData";
import { Shield, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <UserPlus className="w-4 h-4 mr-1.5" /> Tambah Anggota
          </Button>
        </div>
        <div className="space-y-2">
          {mockAccounts
            .filter((a) => a.role !== "client")
            .map((a) => (
              <div key={a.email} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-smooth">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium">
                  {a.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-medium">
                  {roleLabel[a.role]}
                </span>
                <Button size="icon" variant="ghost" onClick={() => toast.info("Demo mode")}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
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
      <h3 className="font-display text-xl mb-5">Profil Bisnis</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Nama Bisnis</Label>
          <Input defaultValue="Aurelia Wedding Co." className="mt-1.5" />
        </div>
        <div>
          <Label>Email Kontak</Label>
          <Input defaultValue="hello@aurelia.com" className="mt-1.5" />
        </div>
        <div>
          <Label>Nomor Telepon</Label>
          <Input defaultValue="021-555-1234" className="mt-1.5" />
        </div>
        <div>
          <Label>Kota</Label>
          <Input defaultValue="Jakarta" className="mt-1.5" />
        </div>
      </div>
      <Button className="mt-5 bg-primary hover:bg-primary/90" onClick={() => toast.success("Pengaturan disimpan")}>
        Simpan Perubahan
      </Button>
    </Card>
  </>
);

export default Settings;
