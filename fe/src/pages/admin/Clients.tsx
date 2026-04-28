import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { useClients } from "@/lib/dataStore";
import { Search } from "lucide-react";
import { useState } from "react";
import { AddClientDialog, ClientFormDialog } from "@/components/dialogs/AddClientDialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { store } from "@/lib/dataStore";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const Clients = () => {
  const clients = useClients();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.partner.toLowerCase().includes(q.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(q.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagedList = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <PageHeader
        title="Manajemen Klien"
        subtitle={`${clients.length} pasangan terdaftar`}
        actions={<AddClientDialog />}
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari nama klien..." className="pl-9" />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Kode</TableHead>
                <TableHead>Nama Pria</TableHead>
                <TableHead>Nama Wanita</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[160px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">{c.code || "—"}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.partner}</TableCell>
                  <TableCell>{c.email || "—"}</TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <ClientFormDialog
                        mode="edit"
                        initial={c}
                        triggerLabel="Edit"
                        trigger={
                          <Button size="sm" variant="outline">
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        }
                      />
                      <ConfirmActionDialog
                        title="Hapus klien?"
                        description={`Data klien ${c.name} akan dihapus permanen.`}
                        confirmText="Hapus"
                        onConfirm={async () => {
                          try {
                            await store.deleteClient(c.id);
                            toast.success("Klien berhasil dihapus");
                          } catch (err: any) {
                            toast.error(err?.message || "Gagal menghapus klien");
                          }
                        }}
                        trigger={
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Tidak ada data klien.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
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

export default Clients;
