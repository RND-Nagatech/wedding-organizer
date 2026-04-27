import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Packages from "@/pages/admin/Packages";
import { store, useClients } from "@/lib/dataStore";
import { useNavigate } from "react-router-dom";

const ClientPackages = () => {
  const { user } = useAuth();
  const clients = useClients();
  const nav = useNavigate();
  const client = clients.find((c) => c.id === (user?.clientId || ""));

  return (
    <Packages
      adminMode={false}
      onPickPackage={async (packageId) => {
        if (!client) {
          toast.error("Data klien tidak ditemukan. Silakan login ulang.");
          return;
        }
        try {
          await store.updateClient(client.id, { ...client, packageId });
          toast.success("Paket berhasil dipilih");
          nav("/client/booking");
        } catch (err: any) {
          toast.error(err?.message || "Gagal memilih paket");
        }
      }}
    />
  );
};

export default ClientPackages;
