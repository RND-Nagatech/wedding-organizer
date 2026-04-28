import { createContext, useContext, useEffect, useState } from "react";
import { ambilProfilBisnis } from "@/lib/api";

export type SystemProfile = {
  id: string;
  nama_bisnis: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  website?: string;
  npwp?: string;
  logo_url?: string;
};

const Ctx = createContext<{ profile: SystemProfile | null; refresh: () => Promise<void> } | null>(null);

export function SystemProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SystemProfile | null>(null);

  const refresh = async () => {
    const data = await ambilProfilBisnis().catch(() => null);
    if (data && data._id) {
      setProfile({
        id: data._id,
        nama_bisnis: data.nama_bisnis,
        alamat: data.alamat,
        telepon: data.telepon,
        email: data.email,
        website: data.website,
        npwp: data.npwp,
        logo_url: data.logo_url,
      });
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return <Ctx.Provider value={{ profile, refresh }}>{children}</Ctx.Provider>;
}

export function useSystemProfile() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSystemProfile must be inside SystemProfileProvider");
  return c;
}

