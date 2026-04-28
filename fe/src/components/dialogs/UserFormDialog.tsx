import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { editUser, tambahUser } from "@/lib/api";
import { toast } from "sonner";

export function UserFormDialog({ mode, user, open, onOpenChange, onSaved, trigger }: any) {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "staff",
    aktif: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      nama: user?.nama || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "staff",
      aktif: user?.aktif ?? true,
    });
  }, [open, user]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (mode === "edit") {
        await editUser(user._id, { ...form, password: form.password || undefined });
        toast.success("User berhasil diperbarui");
      } else {
        await tambahUser(form);
        toast.success("User berhasil ditambahkan");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit User" : "Tambah User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={form.nama}
            onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
            placeholder="Nama"
            required
          />
          <Input
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            type="email"
            required
            disabled={mode === "edit"}
          />
          <Input
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder={mode === "edit" ? "Password (biarkan kosong jika tidak diubah)" : "Password"}
            type="password"
            required={mode !== "edit"}
          />
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={e => setForm(f => ({ ...f, aktif: e.target.checked }))}
            />
            Aktif
          </label>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{mode === "edit" ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
