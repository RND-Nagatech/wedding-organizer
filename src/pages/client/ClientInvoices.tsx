import { useAuth } from "@/contexts/AuthContext";
import Invoices from "@/pages/admin/Invoices";

const ClientInvoices = () => {
  const { user } = useAuth();
  return <Invoices filterClientId={user?.clientId || "c-001"} />;
};

export default ClientInvoices;
