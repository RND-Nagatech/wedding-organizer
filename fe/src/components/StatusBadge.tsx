import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/labels";

const variants: Record<string, string> = {
  Booked: "bg-primary-soft text-primary",
  Lead: "bg-accent-soft text-accent-foreground",
  Ongoing: "bg-warning/15 text-warning",
  Completed: "bg-success/15 text-success",
  Confirmed: "bg-primary-soft text-primary",
  Pending: "bg-warning/15 text-warning",
  Done: "bg-success/15 text-success",
  Paid: "bg-success/15 text-success",
  Partial: "bg-warning/15 text-warning",
  Unpaid: "bg-destructive/10 text-destructive",
  "belum bayar": "bg-destructive/10 text-destructive",
  DP: "bg-warning/15 text-warning",
  cicilan: "bg-warning/15 text-warning",
  lunas: "bg-success/15 text-success",
  draft: "bg-muted text-muted-foreground",
  aktif: "bg-primary-soft text-primary",
  selesai: "bg-success/15 text-success",
  batal: "bg-destructive/10 text-destructive",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
      variants[status] || "bg-muted text-muted-foreground"
    )}
  >
    {statusLabel(status)}
  </span>
);
