import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

function formatRupiah(value: number) {
  if (!Number.isFinite(value)) return "";
  const n = Math.max(0, Math.trunc(value));
  return `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;
}

function parseRupiah(raw: string) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits);
}

export function RupiahInput(props: {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
}) {
  const { value, onValueChange, disabled, placeholder, name } = props;
  const formatted = useMemo(() => formatRupiah(value), [value]);
  const [text, setText] = useState(formatted);

  useEffect(() => {
    setText(formatted);
  }, [formatted]);

  return (
    <Input
      name={name}
      inputMode="numeric"
      placeholder={placeholder || "0"}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        const next = parseRupiah(raw);
        onValueChange(next);
        setText(formatRupiah(next));
      }}
    />
  );
}
