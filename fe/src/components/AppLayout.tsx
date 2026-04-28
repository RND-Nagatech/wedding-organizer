import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, Package, CalendarDays,
  ListChecks, Receipt, BarChart3, LogOut, Heart, Menu, X, Settings, ChevronRight, ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemProfile } from "@/contexts/SystemProfileContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { can, roleLabel, type Permission } from "@/lib/mockData";

type NavItem = { to: string; label: string; icon: any; end?: boolean; perm?: Permission; submenu?: NavItem[] };

const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, perm: "dashboard" },
  {
    to: "/admin/master", label: "Master", icon: Settings, submenu: [
      { to: "/admin/vendor-categories", label: "Kategori Vendor", icon: ListChecks },
      { to: "/admin/vendors", label: "Vendor", icon: Store, perm: "vendors" },
      { to: "/admin/packages", label: "Paket", icon: Package, perm: "packages" },
      { to: "/admin/adat", label: "Adat / Konsep", icon: ListChecks },
      { to: "/admin/catalog-baju", label: "Katalog Baju", icon: Package },
      { to: "/admin/catalog-dekorasi", label: "Katalog Dekorasi", icon: Package },
      { to: "/admin/catalog-makeup", label: "Katalog Makeup", icon: Package },
      { to: "/admin/client-references", label: "Referensi Client", icon: ListChecks },
      { to: "/admin/client-wishlist", label: "Wishlist Client", icon: ListChecks },
      { to: "/admin/checklist-barang", label: "Checklist Barang", icon: ListChecks },
      { to: "/admin/crew", label: "Crew Assignment", icon: ListChecks },
      { to: "/admin/clients", label: "Klien", icon: Users, perm: "clients" },
    ]
  },
  { to: "/admin/bookings", label: "Booking", icon: CalendarDays, perm: "bookings",
    submenu: [
      { to: "/admin/bookings", label: "List Booking", icon: CalendarDays },
      { to: "/admin/booking-review", label: "Review Booking", icon: CalendarDays },
    ]
  },
  { to: "/admin/timeline", label: "Timeline", icon: ListChecks, perm: "timeline" },
  // { to: "/admin/invoices", label: "Invoice", icon: Receipt, perm: "invoices" },
  { to: "/admin/payments", label: "Pembayaran", icon: Receipt, perm: "payments" },
  { to: "/admin/keuangan", label: "Keuangan", icon: Receipt, perm: "reports" },
  {
    to: "/admin/reports",
    label: "Laporan",
    icon: BarChart3,
    perm: "reports",
    submenu: [
      { to: "/admin/reports/events", label: "Event", icon: BarChart3 },
      { to: "/admin/reports/payments", label: "Pembayaran", icon: BarChart3 },
      { to: "/admin/reports/keuangan-detail", label: "Keuangan Detail", icon: BarChart3 },
      { to: "/admin/reports/keuangan-rekap", label: "Keuangan Rekap", icon: BarChart3 },
    ],
  },
  {
    to: "/admin/settings", label: "Pengaturan", icon: Settings, perm: "settings",
    submenu: [
      { to: "/admin/settings/users", label: "Manajemen User", icon: Users },
      { to: "/admin/settings/profile", label: "Profil Bisnis", icon: Heart },
    ]
  },
];

const clientNav: NavItem[] = [
  { to: "/client", label: "Beranda", icon: LayoutDashboard, end: true },
  { to: "/client/packages", label: "Pilih Paket", icon: Package },
  { to: "/client/booking", label: "Booking Saya", icon: CalendarDays },
  { to: "/client/catalog-baju", label: "Katalog Baju", icon: ListChecks },
  { to: "/client/catalog-dekorasi", label: "Katalog Dekorasi", icon: ListChecks },
  { to: "/client/catalog-makeup", label: "Katalog Makeup", icon: ListChecks },
  { to: "/client/formulir", label: "Formulir Acara", icon: ListChecks },
  { to: "/client/references", label: "Referensi", icon: ListChecks },
  { to: "/client/wishlist", label: "Wishlist", icon: ListChecks },
  { to: "/client/timeline", label: "Timeline", icon: ListChecks },
  // { to: "/client/invoices", label: "Invoice", icon: Receipt },
  { to: "/client/payments", label: "Pembayaran", icon: Receipt },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { profile } = useSystemProfile();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string|null>(null);

  if (!user) return <>{children}</>;

  const items =
    user.role === "client"
      ? clientNav
      : adminNav.filter((item) => !item.perm || can(user.role, item.perm));

  const handleLogout = () => {
    logout();
    nav("/");
  };

  const isActive = (to: string, end?: boolean) =>
    end ? loc.pathname === to : loc.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg leading-none">{profile?.nama_bisnis || "Wedding Organizer"}</div>
              <div className="text-[11px] text-muted-foreground tracking-wider uppercase">Management System</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            if (item.submenu) {
              const expanded = openSubmenu === item.to;
              return (
                <div key={item.to} className="mb-2">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium transition-smooth",
                      expanded
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                    onClick={() => setOpenSubmenu(expanded ? null : item.to)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expanded && (
                    <div className="ml-6 space-y-1 mt-1">
                      {item.submenu.map((sub) => {
                        const active = isActive(sub.to, sub.end);
                        return (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth",
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            <sub.icon className="w-4 h-4" />
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            const active = isActive(item.to, item.end);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center text-sm font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-primary capitalize font-medium">{roleLabel[user.role]}</div>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span className="font-display">{profile?.nama_bisnis || "Wedding Organizer"}</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
};
