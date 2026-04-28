import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { loginApp } from "@/lib/api";
import { useSystemProfile } from "@/contexts/SystemProfileContext";


const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem("wo_remember_email") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("wo_remember_password") || "");
  const [remember, setRemember] = useState(() => !!localStorage.getItem("wo_remember_email"));
  const { login } = useAuth();
  const nav = useNavigate();
  const { profile } = useSystemProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    try {
      const u = await loginApp({ email, password });
      login({
        name: u.name,
        email: u.email,
        role: u.role,
        clientId: u.clientId,
        clientCode: u.clientCode,
        userId: u.userId,
      });
      if (remember) {
        localStorage.setItem("wo_remember_email", email);
        localStorage.setItem("wo_remember_password", password);
      } else {
        localStorage.removeItem("wo_remember_email");
        localStorage.removeItem("wo_remember_password");
      }
      toast.success(`Selamat datang, ${u.name}!`);
      nav(u.role === "client" ? "/client" : "/admin");
    } catch (err: any) {
      toast.error(err?.message || "Gagal login");
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
            Selamat datang kembali.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Masuk untuk mengelola paket, vendor, event, pembayaran, dan progress persiapan.
          </p>
          <div className="mt-12 p-6 rounded-2xl bg-card/60 backdrop-blur border border-border shadow-soft">
            <p className="text-sm italic text-foreground/80 font-display">
              "Aurelia mengubah hari pernikahan kami menjadi pengalaman yang tak terlupakan. Setiap detail terasa personal."
            </p>
            <div className="mt-3 text-xs text-muted-foreground">— Citra & Aldo, Desember 2025</div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <span className="font-display text-xl">{profile?.nama_bisnis || "Wedding Organizer"}</span>
            </Link>
          </div>

          <h1 className="font-display text-3xl">Masuk ke akun Anda</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Masukkan email dan password untuk melanjutkan
          </p>

          <Card className="mt-6 p-6 border-border shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="accent-primary"
                  />
                  Ingat saya
                </label>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Masuk
                </Button>
              </div>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Daftar sebagai klien
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
