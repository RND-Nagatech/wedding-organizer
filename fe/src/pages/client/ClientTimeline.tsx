import { useAuth } from "@/contexts/AuthContext";
import Timeline from "@/pages/admin/Timeline";
import { useBookings } from "@/lib/dataStore";

const ClientTimeline = () => {
  const { user } = useAuth();
  const bookings = useBookings();
  const booking = bookings.find((b) => b.clientId === (user?.clientId || ""));
  return <Timeline bookingId={booking?.id} />;
};

export default ClientTimeline;
