import { PageHeader } from "@/components/PageHeader";
import { store, useVendors } from "@/lib/dataStore";
import { Star } from "lucide-react";
import { AddVendorDialog, VendorFormDialog } from "@/components/dialogs/AddVendorDialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";


const Vendors = () => {
  const vendors = useVendors();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return vendors;
    return vendors.filter((v) => {
      const hay = `${v.name} ${v.category} ${v.priceRange} ${v.telepon || ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [vendors, q]);

  const totalPages = Math.ceil(list.length / perPage);
  const pagedList = list.slice((page - 1) * perPage, page * perPage);

  // Reset ke halaman 1 jika pencarian berubah
  // (opsional, bisa dihilangkan jika ingin tetap di halaman yang sama)
  // useEffect(() => { setPage(1); }, [q]);

  return (
    <>
      <PageHeader
        title="Manajemen Vendor"
        subtitle={`${vendors.length} vendor terdaftar`}
        actions={<AddVendorDialog />}
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="max-w-sm space-y-1.5">
            <Label>Search</Label>
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari nama vendor / kategori / kontak..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Vendor</th>
                <th className="text-left px-5 py-3 font-medium">Kategori</th>
                {/* <th className="text-left px-5 py-3 font-medium">Kontak</th> */}
                <th className="text-left px-5 py-3 font-medium">Telepon</th>
                <th className="text-left px-5 py-3 font-medium">Harga</th>
                <th className="text-left px-5 py-3 font-medium">Rating</th>
                <th className="text-right px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedList.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-smooth">
                  <td className="px-5 py-4 font-medium">{v.name}</td>
                  <td className="px-5 py-4">{v.category}</td>
                  {/* <td className="px-5 py-4">{v.contact || "—"}</td> */}
                  <td className="px-5 py-4">{v.telepon || "—"}</td>
                  <td className="px-5 py-4 text-primary font-medium">{v.priceRange || "—"}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                      <span className="font-medium">{v.rating}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <VendorFormDialog
                        mode="edit"
                        initial={v}
                        trigger={
                          <Button size="icon" variant="outline">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus vendor?"
                        description={`Vendor \"${v.name}\" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteVendor(v.id);
                            toast.success("Vendor berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus vendor");
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
              ))}
              {pagedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    Tidak ada data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Tampilkan</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm">per halaman</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            &lt;
          </Button>
          <span className="text-sm">Halaman {page} dari {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
            &gt;
          </Button>
        </div>
      </div>
    </>
  );
};

export default Vendors;
