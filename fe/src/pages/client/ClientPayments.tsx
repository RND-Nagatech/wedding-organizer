import { useAuth } from "@/contexts/AuthContext";
import Payments from "@/pages/admin/Payments";

const ClientPayments = () => {
  const { user } = useAuth();
  return <Payments filterClientCode={user?.clientCode} readOnly />;
};

export default ClientPayments;
