import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { waConnect, waLogout, waQr, waReconnect, waStatus } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, LogOut, Loader2 } from "lucide-react";

export default function WhatsAppSettings() {
  const [status, setStatus] = useState<any>(null);
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const st = await waStatus();
    setStatus(st);
    const q = await waQr();
    setQr(q?.qr || "");
  }

  useEffect(() => {
    refresh().catch(() => {});
    const t = setInterval(() => {
      refresh().catch(() => {});
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const st = status?.status || "disconnected";
  const connectedNumber = status?.connectedNumber ? `+${status.connectedNumber}` : "—";
  const lastError = status?.lastError || "";
  const lastState = status?.lastState || "";
  const showSpinner = loading || (st !== "connected" && !qr);

  return (
    <>
      <PageHeader title="WhatsApp Connection" subtitle="Connect WhatsApp untuk notifikasi otomatis + PDF" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6 border-border shadow-soft space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={st === "connected" ? "default" : "secondary"}>{st}</Badge>
                <div className="text-sm text-muted-foreground">Pengirim: {connectedNumber}</div>
              </div>
              {lastState || lastError ? (
                <div className="text-xs text-muted-foreground mt-2">
                  {lastState ? <div>State: {lastState}</div> : null}
                  {lastError ? <div className="text-destructive">Error: {lastError}</div> : null}
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await waConnect();
                    await refresh();
                    toast.success("WhatsApp connecting...");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal connect WhatsApp");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <RefreshCcw className="w-4 h-4 mr-1.5" /> Connect/Init
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await waReconnect();
                    await refresh();
                    toast.success("WhatsApp reconnect...");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal reconnect WhatsApp");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Reconnect
              </Button>
              <Button
                variant="destructive"
                disabled={loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await waLogout();
                    await refresh();
                    toast.success("WhatsApp logout");
                  } catch (err: any) {
                    toast.error(err?.message || "Gagal logout WhatsApp");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <LogOut className="w-4 h-4 mr-1.5" /> Logout
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Scan QR di bawah menggunakan WhatsApp pada ponsel: <span className="font-medium">Linked Devices</span>.
          </div>

          <div className="rounded-xl border border-border bg-muted/10 p-4 flex items-center justify-center min-h-[360px]">
            {st === "connected" ? (
              <div className="text-sm text-muted-foreground text-center">
                WhatsApp sudah terkoneksi.
                <div className="text-xs mt-1">Session disimpan, tidak perlu scan ulang.</div>
              </div>
            ) : showSpinner ? (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyiapkan QR / menunggu koneksi...
              </div>
            ) : qr ? (
              <img src={qr} alt="WhatsApp QR" className="w-[320px] h-[320px] object-contain" />
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                QR belum tersedia. Klik <span className="font-medium">Connect/Init</span> lalu tunggu beberapa detik.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-border shadow-soft space-y-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Catatan</div>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>Notifikasi WhatsApp hanya dikirim jika nomor HP client tersedia.</li>
            <li>PDF akan dibuat dulu, jika gagal maka WA tidak dikirim dan log tercatat failed.</li>
            <li>Jika WA disconnected, log tetap tercatat failed dan bisa resend setelah terkoneksi.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
