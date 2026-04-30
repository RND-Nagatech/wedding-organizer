import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Packages from "@/pages/admin/Packages";
import { store, useBookings, useClients } from "@/lib/dataStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { statusLabel } from "@/lib/labels";

const ClientPackages = () => {
  const { user } = useAuth();
  const clients = useClients();
  const bookings = useBookings();
  const nav = useNavigate();
  const client = clients.find((c) => c.id === (user?.clientId || ""));
  const clientId = user?.clientId || "";

  const activeBooking = bookings
    .filter((b) => b.clientId === clientId)
    .filter((b) => ["draft", "menunggu_review", "approved", "ongoing"].includes(String(b.statusBooking || "")))
    .sort((a, b) => String(b.eventDate || "").localeCompare(String(a.eventDate || "")))[0];

  return (
    <Packages
      adminMode={false}
      pickDisabled={!!activeBooking}
      topNotice={
        activeBooking ? (
          <Card className="border-border shadow-soft p-5">
            <div className="font-medium">Anda masih memiliki booking aktif</div>
            <div className="text-sm text-muted-foreground mt-1">
              Selesaikan atau batalkan booking tersebut sebelum memilih paket lain.
            </div>
            <div className="text-sm mt-3">
              <span className="text-muted-foreground">Booking:</span>{" "}
              <span className="font-medium">{String(activeBooking.code || activeBooking.id).toUpperCase()}</span>{" "}
              <span className="text-muted-foreground">·</span>{" "}
              <span className="font-medium">{statusLabel(String(activeBooking.statusBooking || "menunggu_review"))}</span>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => nav("/client/booking")}>
                Lihat Booking Saya
              </Button>
              {["draft", "menunggu_review"].includes(String(activeBooking.statusBooking || "")) ? (
                <ConfirmActionDialog
                  title="Batalkan booking?"
                  description="Booking akan dibatalkan. Anda bisa memilih paket dan booking baru setelahnya."
                  confirmText="Batalkan"
                  onConfirm={async () => {
                    try {
                      await store.updateBookingStatus(activeBooking.id, "cancelled");
                      toast.success("Booking berhasil dibatalkan");
                    } catch (err: any) {
                      toast.error(err?.message || "Gagal membatalkan booking");
                    }
                  }}
                  trigger={<Button variant="destructive">Batalkan Booking</Button>}
                />
              ) : null}
            </div>
          </Card>
        ) : null
      }
      onPickPackage={async (packageId) => {
        if (!client) {
          toast.error("Data klien tidak ditemukan. Silakan login ulang.");
          return;
        }
        if (activeBooking) {
          toast.error("Anda masih memiliki booking aktif. Batalkan/selesaikan booking tersebut dulu.");
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
