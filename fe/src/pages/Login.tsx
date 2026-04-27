import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockAccounts } from "@/lib/mockAccounts";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = mockAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      toast.error("Email tidak terdaftar. Coba salah satu akun demo di bawah.");
      return;
    }
    if (password.length < 4) {
      toast.error("Password minimal 4 karakter");
      return;
    }
    login({
      name: account.name,
      email: account.email,
      role: account.role,
      clientId: account.clientId,
    });
    toast.success(`Selamat datang, ${account.name}!`);
    nav(account.role === "client" ? "/client" : "/admin");
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
              <div className="font-display text-lg leading-none">Aurelia</div>
              <div className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Wedding Co.</div>
            </div>
          </Link>
        </div>
        <div className="max-w-md relative z-10">
          <Heart className="w-10 h-10 text-primary fill-primary mb-6" />
          <h2 className="font-display text-5xl leading-tight text-foreground">
            Selamat datang kembali.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Lanjutkan merencanakan hari sempurna Anda bersama tim Aurelia. Setiap detail kami pastikan terjaga.
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
              <span className="font-display text-xl">Aurelia</span>
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Masuk
              </Button>
            </form>
          </Card>

          {/* Demo accounts */}
          <Card className="mt-4 p-4 border-dashed border-border bg-muted/30">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Akun Demo (klik untuk pakai)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {mockAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword("demo1234"); }}
                  className="text-left px-2.5 py-1.5 rounded-md hover:bg-card transition-smooth text-xs"
                >
                  <div className="font-medium capitalize">{a.role}</div>
                  <div className="text-muted-foreground truncate">{a.email}</div>
                </button>
              ))}
            </div>
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
