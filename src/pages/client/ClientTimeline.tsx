import { useAuth } from "@/contexts/AuthContext";
import { bookings } from "@/lib/mockData";
import Timeline from "@/pages/admin/Timeline";

const ClientTimeline = () => {
  const { user } = useAuth();
  const booking = bookings.find((b) => b.clientId === (user?.clientId || "c-001"));
  return <Timeline bookingId={booking?.id} />;
};

export default ClientTimeline;
