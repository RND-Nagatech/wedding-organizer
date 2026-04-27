import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, CalendarHeart, Users, Award, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroImg from "@/assets/hero-wedding.jpg";

const Landing = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  const goDashboard = () => {
    if (!user) return nav("/register");
    nav(user.role === "client" ? "/client" : "/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="absolute top-0 inset-x-0 z-20 px-6 lg:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
            <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg leading-none">Aurelia</div>
            <div className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Wedding Co.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Button onClick={goDashboard} className="bg-primary hover:bg-primary/90">
              Buka Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Masuk</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/register">Daftar Klien</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft text-accent-foreground text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" />
              Dipercaya 500+ pasangan di seluruh Indonesia
            </div>
            <h1 className="font-display text-5xl lg:text-7xl leading-[1.05] text-foreground">
              Cerita cinta Anda,<br />
              <em className="text-primary">dirayakan dengan sempurna.</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Aurelia adalah wedding organizer modern yang menggabungkan estetika minimalis dengan
              perencanaan terstruktur — agar hari spesial Anda berjalan tanpa cela.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={goDashboard} className="bg-primary hover:bg-primary/90 shadow-elegant">
                Mulai Perencanaan <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Lihat Paket Kami</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "500+", l: "Acara terlaksana" },
                { n: "50+", l: "Vendor partner" },
                { n: "4.9", l: "Rating klien" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl text-primary">{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
            <img
              src={heroImg}
              alt="Wedding decoration with white roses"
              width={1600}
              height={1024}
              className="relative rounded-2xl shadow-elegant w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">Layanan Kami</div>
            <h2 className="font-display text-4xl lg:text-5xl">Semua yang Anda butuhkan, dalam satu tempat.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Award, t: "Paket Eksklusif", d: "Pilihan paket Silver, Gold, dan Platinum yang dirancang sesuai visi Anda." },
              { icon: Users, t: "Vendor Pilihan", d: "Bekerjasama dengan 50+ vendor terpercaya di kategori catering, dekorasi, dan lainnya." },
              { icon: CalendarHeart, t: "Timeline Terpandu", d: "Checklist persiapan yang jelas dari hari ini hingga hari pernikahan Anda." },
            ].map((f) => (
              <div key={f.t} className="p-8 rounded-2xl bg-gradient-card border border-border shadow-soft hover:shadow-elegant transition-smooth">
                <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl mb-2">{f.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 pb-20">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-primary p-12 lg:p-16 text-center shadow-elegant">
          <Heart className="w-8 h-8 mx-auto text-primary-foreground/80 fill-primary-foreground/80 mb-4" />
          <h2 className="font-display text-3xl lg:text-5xl text-primary-foreground">
            Siap memulai perjalanan?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Daftar sekarang, pilih paket favorit Anda, dan biarkan tim kami merangkai hari sempurna untuk Anda berdua.
          </p>
          <Button size="lg" onClick={goDashboard} className="mt-8 bg-background text-foreground hover:bg-background/90">
            Mulai Sekarang <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Aurelia Wedding Co. — Crafted with love.
      </footer>
    </div>
  );
};

export default Landing;
