import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useVendors } from "@/lib/dataStore";
import { ambilKategoriVendor, reportVendorAvailability, reportVendorBookings } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { statusLabel } from "@/lib/labels";
import { exportToExcel, exportToPdf } from "@/lib/exporters";
import { Download } from "lucide-react";

const VendorReport = () => {
  const vendors = useVendors();
  const [categories, setCategories] = useState<any[]>([]);

  const today = new Date().toISOString().slice(0, 10);
  const [filterBy, setFilterBy] = useState<"tanggal" | "vendor">("tanggal");

  // Availability filter
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [kategoriId, setKategoriId] = useState("all");
  const [vendorId, setVendorId] = useState<string>("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const vendorOptions = useMemo(() => {
    const filtered = kategoriId === "all" ? vendors : vendors.filter((v) => String(v.categoryId || "") === String(kategoriId));
    return filtered.map((v) => ({
      id: v.id,
      label: `${v.name}${v.category ? ` · ${v.category}` : ""}`,
    }));
  }, [vendors, kategoriId]);

  const load = async () => {
    if (!from) {
      toast.error("Tanggal dari wajib diisi");
      return;
    }
    const tglTo = to || from;
    try {
      setLoading(true);
      if (filterBy === "tanggal") {
        const data = await reportVendorAvailability({
          tgl_from: from,
          tgl_to: tglTo,
          kategori_vendor_id: kategoriId !== "all" ? kategoriId : undefined,
          vendor_id: vendorId !== "all" ? vendorId : undefined,
        } as any);
        setRows(Array.isArray(data) ? data : []);
      } else {
        const data = await reportVendorBookings({
          tgl_from: from,
          tgl_to: tglTo,
          kategori_vendor_id: kategoriId !== "all" ? kategoriId : undefined,
          vendor_id: vendorId !== "all" ? vendorId : undefined,
        });
        const cleaned = (Array.isArray(data) ? data : []).map((g: any) => ({
          ...g,
          bookings: (g.bookings || []).filter((b: any) => String(b.status_vendor_booking || "") !== "batal"),
        }));
        setRows(cleaned);
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil laporan vendor");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilKategoriVendor()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title="Laporan Vendor" subtitle="Availability & jadwal booking vendor" />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="space-y-1.5 lg:col-span-3">
              <Label>Filter By</Label>
              <Select value={filterBy} onValueChange={(v: any) => setFilterBy(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tanggal">Tanggal</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <Label>Tanggal Dari</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <Label>Tanggal Sampai</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <Label>Kategori Vendor</Label>
              <Select
                value={kategoriId}
                onValueChange={(v) => {
                  setKategoriId(v);
                  setVendorId("all");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua kategori</SelectItem>
                  {categories.map((c: any) => (
                    <SelectItem key={String(c._id || c.id)} value={String(c._id || c.id)}>
                      {c.nama_kategori || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 lg:col-span-6">
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua vendor</SelectItem>
                  {vendorOptions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 justify-start lg:justify-end lg:col-span-6">
              <Button className="bg-primary hover:bg-primary/90" onClick={load} disabled={loading}>
                {loading ? "Memuat..." : "Cari Data"}
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (filterBy === "tanggal") {
                        await exportToExcel({
                          filename: "laporan-vendor.xlsx",
                          sheetName: "Vendor",
                          rows: rows.map((r: any) => ({
                            Vendor: String(r.nama_vendor || ""),
                            Kategori: String(r.kategori_vendor_nama || ""),
                            Status: String(r.status || "").toUpperCase(),
                            "Kode Booking": (r.bookings || []).map((b: any) => String(b.kode_booking || "").toUpperCase()).join(", "),
                          })),
                        });
                      } else {
                        const flat = rows.flatMap((g: any) =>
                          (g.bookings || [])
                            .filter((b: any) => String(b.status_vendor_booking || "") !== "batal")
                            .map((b: any) => ({
                            Vendor: String(g.nama_vendor || ""),
                            Kategori: String(g.kategori_vendor_nama || ""),
                            "Tanggal Booking": String(b.tanggal_booking || ""),
                            "Kode Booking": String(b.kode_booking || "").toUpperCase(),
                            "Nama Client": String(b.nama_client || ""),
                            Status: statusLabel(String(b.status_vendor_booking || "")),
                          }))
                        );
                        await exportToExcel({
                          filename: "laporan-vendor.xlsx",
                          sheetName: "Vendor",
                          rows: flat,
                        });
                      }
                      toast.success("Export Excel berhasil");
                    } catch (err: any) {
                      toast.error(err?.message || "Gagal export Excel");
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1.5" /> Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (filterBy === "tanggal") {
                        await exportToPdf({
                          filename: "laporan-vendor.pdf",
                          title: "Laporan Vendor",
                          columns: ["Vendor", "Kategori", "Status", "Kode Booking"],
                          rows: rows.map((r: any) => [
                            String(r.nama_vendor || ""),
                            String(r.kategori_vendor_nama || "—"),
                            String(r.status || "").toUpperCase(),
                            (r.bookings || []).map((b: any) => String(b.kode_booking || "").toUpperCase()).join(", ") || "—",
                          ]),
                        });
                      } else {
                        const flat = rows.flatMap((g: any) =>
                          (g.bookings || [])
                            .filter((b: any) => String(b.status_vendor_booking || "") !== "batal")
                            .map((b: any) => [
                            String(g.nama_vendor || ""),
                            String(g.kategori_vendor_nama || "—"),
                            String(b.tanggal_booking || ""),
                            String(b.kode_booking || "").toUpperCase(),
                            String(b.nama_client || "—"),
                            statusLabel(String(b.status_vendor_booking || "")),
                          ])
                        );
                        await exportToPdf({
                          filename: "laporan-vendor.pdf",
                          title: "Laporan Vendor",
                          columns: ["Vendor", "Kategori", "Tanggal Booking", "Kode Booking", "Nama Client", "Status"],
                          rows: flat.length ? flat : [],
                        });
                      }
                      toast.success("Export PDF berhasil");
                    } catch (err: any) {
                      toast.error(err?.message || "Gagal export PDF");
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1.5" /> PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          {filterBy === "tanggal" ? (
            <Table className="border border-border">
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r: any) => (
                  <TableRow key={String(r.vendor_id)}>
                    <TableCell className="font-medium">{r.nama_vendor}</TableCell>
                    <TableCell>{r.kategori_vendor_nama || "—"}</TableCell>
                    <TableCell>
                      {String(r.status) === "available" ? (
                        <span className="text-success">Available</span>
                      ) : String(r.status) === "booked" ? (
                        <span className="text-destructive">Booked</span>
                      ) : (
                        <span className="text-muted-foreground">Hold</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                      Tidak ada data.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              {rows.map((g: any) => (
                <Card key={String(g.vendor_id)} className="p-4 border-border shadow-soft">
                  <div className="font-medium">{g.nama_vendor || "—"}</div>
                  <div className="text-sm text-muted-foreground">{g.kategori_vendor_nama || "—"}</div>
                  <div className="mt-3 overflow-x-auto">
                    <Table className="border border-border">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal Booking</TableHead>
                          <TableHead>Kode Booking</TableHead>
                          <TableHead>Nama Client</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(g.bookings || []).map((b: any, idx: number) => (
                          <TableRow key={`${g.vendor_id}-${idx}`}>
                            <TableCell>{b.tanggal_booking ? formatDate(b.tanggal_booking) : "—"}</TableCell>
                            <TableCell className="font-medium">{String(b.kode_booking || "").toUpperCase()}</TableCell>
                            <TableCell>{b.nama_client || "—"}</TableCell>
                            <TableCell>{statusLabel(String(b.status_vendor_booking || ""))}</TableCell>
                          </TableRow>
                        ))}
                        {(g.bookings || []).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Tidak ada jadwal.
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              ))}
              {rows.length === 0 ? <div className="text-center text-muted-foreground py-10">Tidak ada data.</div> : null}
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default VendorReport;
