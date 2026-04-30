import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type BookingSelectOption = {
  code: string;
  label: string;
  searchText?: string;
};

export function BookingSelect({
  value,
  onValueChange,
  options,
  placeholder = "Pilih Booking",
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: BookingSelectOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = String(o.searchText || o.label || o.code || "").toLowerCase();
      return hay.includes(q);
    });
  }, [options, search]);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 border-b border-border sticky top-0 bg-popover z-10">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari: kode / nama client / tanggal" />
        </div>
        {rows.map((o) => (
          <SelectItem key={o.code} value={o.code}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

