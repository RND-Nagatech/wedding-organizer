import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ambilProfilBisnis, updateProfilBisnis, tambahProfilBisnis } from "@/lib/api";
import { toast } from "sonner";
import { useSystemProfile } from "@/contexts/SystemProfileContext";

const defaultForm = {
  nama_bisnis: "",
  telepon: "",
  alamat: "",
  email: "",
};

const ProfileSettings = () => {
  const { refresh } = useSystemProfile();
  const [form, setForm] = useState(defaultForm);
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    ambilProfilBisnis().then((data) => {
      if (data) {
        setForm({
          nama_bisnis: data.nama_bisnis || "",
          telepon: data.telepon || "",
          alamat: data.alamat || "",
          email: data.email || "",
        });
        setId(data._id);
      }
    });
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await updateProfilBisnis(id, form);
      } else {
        const res = await tambahProfilBisnis(form);
        setId(res._id);
      }
      await refresh();
      toast.success("Profil bisnis tersimpan");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan profil bisnis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Profil Bisnis" subtitle="Atur identitas bisnis Anda di sini." />
      <Card className="max-w-xl mx-auto p-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nama Bisnis</label>
            <Input
              value={form.nama_bisnis}
              onChange={e => setForm(f => ({ ...f, nama_bisnis: e.target.value }))}
              placeholder="Nama Bisnis WO"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">No HP / WA</label>
            <Input
              value={form.telepon}
              onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))}
              placeholder="No HP / WA"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Alamat</label>
            <Input
              value={form.alamat}
              onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))}
              placeholder="Alamat"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              type="email"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
          </div>
          {success && <div className="text-green-600 text-sm text-center">Tersimpan!</div>}
        </form>
      </Card>
    </>
  );
};

export default ProfileSettings;
