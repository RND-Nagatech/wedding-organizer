import { useAuth } from "@/contexts/AuthContext";
import Payments from "@/pages/admin/Payments";
import { useClients } from "@/lib/dataStore";

const ClientPayments = () => {
  const { user } = useAuth();
  const clients = useClients();
  const client = clients.find((c) => c.id === (user?.clientId || ""));
  return <Payments filterClientCode={client?.code} readOnly />;
};

export default ClientPayments;
