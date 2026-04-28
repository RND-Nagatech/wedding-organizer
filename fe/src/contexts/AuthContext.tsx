import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Role } from "@/lib/mockData";

type User = {
  name: string;
  email: string;
  role: Role;
  clientId?: string;
  clientCode?: string;
  userId?: string;
};

type AuthCtx = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("wo_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem("wo_user", JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("wo_user");
    localStorage.removeItem("wo_remember_email");
    localStorage.removeItem("wo_remember_password");
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
