import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { usePayments } from "@/lib/dataStore";
import { formatDate, formatIDR } from "@/lib/mockData";
import { AddPaymentDialog } from "@/components/dialogs/AddPaymentDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";

const Payments = ({
  filterClientCode,
  readOnly = false,
}: {
  filterClientCode?: string;
  readOnly?: boolean;
}) => {
  const payments = usePayments();
  const list = filterClientCode ? payments.filter((p) => p.clientCode === filterClientCode) : payments;

  const totalPaid = list.reduce((s, p) => s + p.amountPaid, 0);
  const totalRemaining = list.reduce((s, p) => s + p.remaining, 0);

  return (
    <>
      <PageHeader
        title="Pembayaran"
        subtitle={`${list.length} transaksi pembayaran`}
        actions={readOnly ? undefined : <AddPaymentDialog />}
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Diterima</div>
          <div className="font-display text-3xl text-success mt-2">{formatIDR(totalPaid)}</div>
        </Card>
        <Card className="p-5 border-border shadow-soft bg-gradient-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Sisa Tagihan (akumulasi)</div>
          <div className="font-display text-3xl text-primary mt-2">{formatIDR(totalRemaining)}</div>
        </Card>
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Kode</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-smooth">
                  <TableCell className="font-medium">{p.code}</TableCell>
                  <TableCell>{p.bookingCode}</TableCell>
                  <TableCell>
                    <div>{p.clientName}</div>
                    <div className="text-xs text-muted-foreground">{p.clientCode}</div>
                  </TableCell>
                  <TableCell>{formatDate(p.paidDate)}</TableCell>
                  <TableCell>{p.method.toUpperCase()}</TableCell>
                  <TableCell className="text-right">{formatIDR(p.amountPaid)}</TableCell>
                  <TableCell className="text-right">{formatIDR(p.remaining)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    Belum ada transaksi pembayaran.
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

export default Payments;
