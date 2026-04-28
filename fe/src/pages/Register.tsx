import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { registerClientApp } from "@/lib/api";
import { useSystemProfile } from "@/contexts/SystemProfileContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    partner: "",
    email: "",
    phone: "",
    password: "",
  });
  const { login } = useAuth();
  const nav = useNavigate();
  const { profile } = useSystemProfile();

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error("Lengkapi semua data dan password minimal 6 karakter");
      return;
    }
    try {
      const u = await registerClientApp({
        nama_klien: form.name,
        pasangan: form.partner || "-",
        email: form.email,
        telepon: form.phone || "-",
        password: form.password,
      });
      login({
        name: u.name,
        email: u.email,
        role: "client",
        clientId: u.clientId,
        clientCode: u.clientCode,
      });
      toast.success(`Selamat datang, ${u.name}! Akun Anda berhasil dibuat.`);
      nav("/client");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mendaftar");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left visual */}
      <div className="hidden lg:flex relative bg-gradient-hero items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-12 left-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg leading-none">{profile?.nama_bisnis || "Wedding Organizer"}</div>
              <div className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Management System</div>
            </div>
          </Link>
        </div>
        <div className="max-w-md relative z-10">
          <Heart className="w-10 h-10 text-primary fill-primary mb-6" />
          <h2 className="font-display text-5xl leading-tight text-foreground">
            Mulai cerita<br /><em className="text-primary">indah Anda.</em>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Daftar sebagai klien dan dapatkan akses ke portal pribadi: pilih paket, pantau timeline persiapan, dan kelola pembayaran dengan mudah.
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>

          <h1 className="font-display text-3xl">Daftar Akun Klien</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Isi data Anda untuk memulai perencanaan pernikahan
          </p>

          <Card className="mt-6 p-6 border-border shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Anda *</Label>
                  <Input id="name" value={form.name} onChange={update("name")} placeholder="Anindya" className="mt-1.5" required />
                </div>
                <div>
                  <Label htmlFor="partner">Nama Pasangan</Label>
                  <Input id="partner" value={form.partner} onChange={update("partner")} placeholder="Reza" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="nama@email.com" className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input id="phone" value={form.phone} onChange={update("phone")} placeholder="0812-3456-7890" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" value={form.password} onChange={update("password")} placeholder="Minimal 6 karakter" className="mt-1.5" required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Buat Akun & Mulai
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
