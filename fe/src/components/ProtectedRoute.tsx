import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { can, type Permission, type Role } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ProtectedRoute = ({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Role[];
}) => {
  const { user } = useAuth();
  const loc = useLocation();

  // Simpan path terakhir ke localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("wo_last_path", loc.pathname + loc.search + loc.hash);
    }
  }, [user, loc]);

  if (!user) {
    // Cek jika ada path terakhir
    const last = localStorage.getItem("wo_last_path");
    return <Navigate to={last && last !== "/login" ? last : "/login"} replace />;
  }
  if (!allow.includes(user.role)) {
    return <Navigate to={user.role === "client" ? "/client" : "/admin"} replace />;
  }
  return <>{children}</>;
};

export const RequirePermission = ({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  if (!user) return null;
  if (!can(user.role, permission)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-10 text-center max-w-md border-border shadow-soft">
          <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl">Akses Terbatas</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Peran Anda tidak memiliki izin untuk membuka halaman ini. Hubungi admin atau owner untuk meminta akses.
          </p>
          <Button asChild className="mt-5 bg-primary hover:bg-primary/90">
            <Link to="/admin">Kembali ke Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
};
