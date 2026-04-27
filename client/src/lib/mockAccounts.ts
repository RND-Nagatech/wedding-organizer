import type { Role } from "./mockData";

export type MockAccount = {
  email: string;
  name: string;
  role: Role;
  clientId?: string;
};

export const mockAccounts: MockAccount[] = [
  { email: "owner@aurelia.com", name: "Sarah Aurelia", role: "owner" },
  { email: "admin@aurelia.com", name: "Maya Hartono", role: "admin" },
  { email: "staff@aurelia.com", name: "Dimas Pratama", role: "staff" },
  { email: "anindya@mail.com", name: "Anindya Putri", role: "client", clientId: "c-001" },
];
