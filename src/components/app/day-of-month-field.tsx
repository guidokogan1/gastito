"use client";

import * as React from "react";

import { PillChip } from "@/components/app/pill-chip";
import { SearchPicker } from "@/components/ui/search-picker";

function toDayString(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "";
  const normalized = Math.max(1, Math.min(31, Math.trunc(n)));
  return String(normalized);
}

export function DayOfMonthField({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue: number;
}) {
  const [value, setValue] = React.useState(() => toDayString(defaultValue));

  const options = React.useMemo(
    () =>
      Array.from({ length: 31 }, (_, idx) => {
        const day = idx + 1;
        return {
          value: String(day),
          label: `Día ${day}`,
        };
      }),
    [],
  );
  const quickOptions = [
    { label: "Primer día", value: "1" },
    { label: "Mitad", value: "15" },
    { label: "Último día", value: "31" },
  ];

  return (
    <div className="space-y-2">
      <input type="hidden" id={id} name={name} value={value} />
      <div className="flex flex-wrap gap-2.5">
        {quickOptions.map((option) => (
          <button key={option.value} type="button" className="pressable" aria-pressed={value === option.value} onClick={() => setValue(option.value)}>
            <PillChip active={value === option.value}>{option.label}</PillChip>
          </button>
        ))}
        <SearchPicker
          value={value}
          placeholder="Día exacto"
          options={options}
          onValueChange={setValue}
          className="h-9 min-w-[8.5rem] rounded-full bg-[var(--surface-pill)] px-4 text-[0.9rem] font-medium text-foreground hover:bg-[var(--surface-selected)]"
          inputPlaceholder="Buscar día…"
        />
      </div>
    </div>
  );
}
