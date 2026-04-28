import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ambilUser, hapusUser } from "@/lib/api";
import { UserFormDialog } from "@/components/dialogs/UserFormDialog";
import { ConfirmUserDeleteDialog } from "@/components/dialogs/ConfirmUserDeleteDialog";

const ManageUsers = () => {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalPages = Math.ceil(users.length / perPage);
  const pagedList = users.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [perPage]);

  const refresh = async () => setUsers(await ambilUser());
  useEffect(() => { refresh(); }, []);

  return (
    <>
      <PageHeader
        title="Manajemen User"
        subtitle="Kelola user tim Anda di sini."
        actions={
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setOpenAdd(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Tambah User
          </Button>
        }
      />
      <UserFormDialog
        mode="add"
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSaved={refresh}
      />

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[160px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.nama}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{user.aktif ? <span className="text-green-600">Aktif</span> : <span className="text-red-500">Nonaktif</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <UserFormDialog
                        mode="edit"
                        user={user}
                        open={editUser?._id === user._id}
                        onOpenChange={(v: boolean) => setEditUser(v ? user : null)}
                        onSaved={refresh}
                        trigger={
                          <Button size="sm" variant="outline" onClick={() => setEditUser(user)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmUserDeleteDialog
                        user={user}
                        open={deleteUser?._id === user._id}
                        onOpenChange={(v: boolean) => setDeleteUser(v ? user : null)}
                        onConfirm={async () => {
                          setLoading(true);
                          await hapusUser(user._id);
                          setDeleteUser(null);
                          await refresh();
                          setLoading(false);
                        }}
                        trigger={
                          <Button size="sm" variant="destructive" onClick={() => setDeleteUser(user)} disabled={loading}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pagedList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 pt-0">
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

export default ManageUsers;
