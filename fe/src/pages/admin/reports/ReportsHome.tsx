import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, CalendarDays, Receipt } from "lucide-react";

const ReportsHome = () => {
  return (
    <>
      <PageHeader title="Laporan" subtitle="Pilih jenis laporan yang ingin dilihat" />

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div className="font-display text-xl">Laporan Event</div>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Status event, paket, PIC, dan progress persiapan per booking.
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/reports/events">Buka</Link>
          </Button>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div className="font-display text-xl">Pembayaran Klien</div>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Rekap pembayaran per booking: DP, cicilan, sisa, dan status lunas/belum.
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/reports/payments">Buka</Link>
          </Button>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="font-display text-xl">Keuangan Detail</div>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Semua transaksi pemasukan/pengeluaran beserta saldo berjalan.
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/reports/keuangan-detail">Buka</Link>
          </Button>
        </Card>

        <Card className="p-6 border-border shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="font-display text-xl">Keuangan Rekap</div>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Rekap total pemasukan/pengeluaran per kategori + summary saldo akhir.
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/reports/keuangan-rekap">Buka</Link>
          </Button>
        </Card>
      </div>
    </>
  );
};

export default ReportsHome;

