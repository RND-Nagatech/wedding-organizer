import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

function formatRupiah(value: number) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("id-ID").format(Math.max(0, Math.trunc(value)));
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
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    setText(formatted);
  }, [formatted, focused]);

  return (
    <Input
      name={name}
      inputMode="numeric"
      placeholder={placeholder || "0"}
      disabled={disabled}
      value={focused ? text : formatted}
      onFocus={() => {
        setFocused(true);
        setText(formatted);
      }}
      onBlur={() => {
        setFocused(false);
        setText(formatRupiah(value));
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        onValueChange(parseRupiah(raw));
      }}
    />
  );
}

