"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatArs, formatMoneyInput, normalizeMoneyString, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MoneyField({
  id,
  name,
  label = "Monto",
  defaultValue = "",
  required = true,
  className,
  inputClassName,
  showPreview = true,
}: {
  id: string;
  name: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  showPreview?: boolean;
}) {
  const [value, setValue] = useState(() => formatMoneyInput(defaultValue));
  const handleValueChange = (rawValue: string) => {
    setValue(formatMoneyInput(rawValue));
  };

  useEffect(() => {
    setValue(formatMoneyInput(defaultValue));
  }, [defaultValue]);
  const preview = useMemo(() => {
    const normalized = normalizeMoneyString(value);
    if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
    const number = toNumber(normalized || 0);
    return number > 0 ? formatArs(number) : null;
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <input type="hidden" name={name} value={normalizeMoneyString(value)} />
      <Input
        id={id}
        name={`${name}Display`}
        type="text"
        inputMode="decimal"
        required={required}
        placeholder="$0"
        value={value}
        onChange={(event) => handleValueChange(event.target.value)}
        onInput={(event) => handleValueChange(event.currentTarget.value)}
        onBlur={(event) => handleValueChange(event.currentTarget.value)}
        className={cn(
          "h-20 appearance-none border-0 bg-transparent px-0 text-center text-[clamp(3.1rem,17vw,4.35rem)] font-semibold leading-none tracking-[-0.035em] shadow-none focus-visible:bg-transparent focus-visible:ring-0",
          inputClassName,
        )}
      />
      {showPreview ? (
        <p className="min-h-5 text-center text-sm font-medium text-muted-foreground">{preview ?? "Ingresá el importe en ARS"}</p>
      ) : null}
    </div>
  );
}
