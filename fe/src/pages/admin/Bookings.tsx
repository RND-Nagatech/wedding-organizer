import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/mockData";
import { store, useBookings, useClients, usePackages, useVendors } from "@/lib/dataStore";
import { Eye, MapPin, Trash2, Users as UsersIcon } from "lucide-react";
import { AddBookingDialog } from "@/components/dialogs/AddBookingDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { toast } from "sonner";
import { formatIDR } from "@/lib/mockData";

const Bookings = () => {
  const bookings = useBookings();
  const clients = useClients();
  const packages = usePackages();
  const vendors = useVendors();

  return (
    <>
      <PageHeader
        title="Booking Event"
        subtitle={`${bookings.length} booking terdaftar`}
        actions={<AddBookingDialog />}
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Booking</th>
                <th className="text-left px-5 py-3 font-medium">Klien</th>
                <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                <th className="text-left px-5 py-3 font-medium">Venue</th>
                <th className="text-left px-5 py-3 font-medium">Tamu</th>
                <th className="text-left px-5 py-3 font-medium">Paket</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => {
                const client = clients.find((c) => c.id === b.clientId);
                const pkg = packages.find((p) => p.id === b.packageId);
                const pkgName = b.packageSnapshot?.name || pkg?.name || "-";
                const pkgPrice = b.packageSnapshot?.price ?? pkg?.price ?? 0;
                const pkgFeatures = b.packageSnapshot?.features || pkg?.features || [];
                const allowedVendorIds = b.packageSnapshot?.vendorIds || pkg?.vendorIds || [];
                const allowedVendors = vendors.filter((v) => allowedVendorIds.includes(v.id));
                const selectedVendors = vendors.filter((v) => (b.vendorSelectedIds || []).includes(v.id));
                return (
                  <tr key={b.id} className="hover:bg-muted/30 transition-smooth">
                    <td className="px-5 py-4 font-medium">{(b.code || b.id).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <div>{client?.name ?? "-"}</div>
                      <div className="text-xs text-muted-foreground">& {client?.partner ?? "-"}</div>
                    </td>
                    <td className="px-5 py-4">{formatDate(b.eventDate)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" /> {b.venue}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="w-3.5 h-3.5 text-muted-foreground" /> {b.guests}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-primary font-medium">{pkgName}</td>
                    <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="font-display text-2xl">Detail Paket & Vendor</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-5">
                              <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground">Paket</div>
                                <div className="font-display text-xl">{pkgName}</div>
                                <div className="text-sm text-muted-foreground">{formatIDR(pkgPrice)}</div>
                              </div>

                              <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Fasilitas</div>
                                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                                  {pkgFeatures.map((f) => (
                                    <li key={f} className="flex items-start gap-2">
                                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                  {pkgFeatures.length === 0 ? (
                                    <li className="text-muted-foreground">—</li>
                                  ) : null}
                                </ul>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Vendor dalam Paket</div>
                                  <ul className="space-y-1 text-sm">
                                    {allowedVendors.map((v) => (
                                      <li key={v.id}>
                                        <span className="font-medium">{v.name}</span>{" "}
                                        <span className="text-muted-foreground">· {v.category}</span>
                                      </li>
                                    ))}
                                    {allowedVendors.length === 0 ? (
                                      <li className="text-muted-foreground">—</li>
                                    ) : null}
                                  </ul>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Vendor Dipilih</div>
                                  <ul className="space-y-1 text-sm">
                                    {selectedVendors.map((v) => (
                                      <li key={v.id}>
                                        <span className="font-medium">{v.name}</span>{" "}
                                        <span className="text-muted-foreground">· {v.category}</span>
                                      </li>
                                    ))}
                                    {selectedVendors.length === 0 ? (
                                      <li className="text-muted-foreground">—</li>
                                    ) : null}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <ConfirmActionDialog
                          title="Hapus booking?"
                          description={`Booking ${(b.code || b.id).toUpperCase()} akan dibatalkan/dihapus.`}
                          confirmText="Hapus"
                          onConfirm={async () => {
                            try {
                              await store.deleteBooking(b.id);
                              toast.success("Booking berhasil dihapus");
                            } catch (err: any) {
                              toast.error(err?.message || "Gagal menghapus booking");
                            }
                          }}
                          trigger={
                            <Button size="icon" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default Bookings;
