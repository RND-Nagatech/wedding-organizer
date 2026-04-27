import { PageHeader } from "@/components/PageHeader";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ambilKategoriVendor,
  hapusKategoriVendor
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { VendorCategoryFormDialog } from "@/components/dialogs/VendorCategoryFormDialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";


const VendorCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => setCategories(await ambilKategoriVendor());

  useEffect(() => { refresh(); }, []);

  return (
    <>
      <PageHeader
        title="Kategori Vendor"
        subtitle="Kelola kategori vendor"
        actions={
          <VendorCategoryFormDialog
            mode="add"
            onSaved={refresh}
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Kategori
              </Button>
            }
          />
        }
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[180px]">Kode</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead className="text-right w-[160px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell className="font-medium">{cat.kode_kategori}</TableCell>
                  <TableCell>{cat.nama_kategori}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <VendorCategoryFormDialog
                        mode="edit"
                        initial={{ id: cat._id, kode_kategori: cat.kode_kategori, nama_kategori: cat.nama_kategori }}
                        onSaved={refresh}
                        trigger={
                          <Button size="sm" variant="outline" disabled={loading}>
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus kategori vendor?"
                        description={`Kategori "${cat.nama_kategori}" akan dihapus.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            setLoading(true);
                            await hapusKategoriVendor(cat._id);
                            await refresh();
                            toast.success("Kategori vendor berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus kategori vendor");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        trigger={
                          <Button size="sm" variant="destructive" disabled={loading}>
                            <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    Belum ada kategori vendor.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
};

export default VendorCategories;
