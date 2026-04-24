"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { SearchPicker } from "@/components/ui/search-picker";
import { cn } from "@/lib/utils";

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
  quickDays = [1, 5, 10, 15, 20, 25],
}: {
  id: string;
  name: string;
  defaultValue: number;
  quickDays?: number[];
}) {
  const [value, setValue] = React.useState(() => toDayString(defaultValue));

  const options = React.useMemo(
    () => Array.from({ length: 31 }, (_, idx) => ({ value: String(idx + 1), label: String(idx + 1) })),
    [],
  );

  const normalizedQuickDays = React.useMemo(() => {
    const seen = new Set<number>();
    const result: number[] = [];
    for (const d of quickDays) {
      const n = Math.max(1, Math.min(31, Math.trunc(d)));
      if (seen.has(n)) continue;
      seen.add(n);
      result.push(n);
    }
    return result.slice(0, 8);
  }, [quickDays]);

  return (
    <div className="space-y-2">
      <input type="hidden" id={id} name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {normalizedQuickDays.map((day) => (
          <Button
            key={day}
            type="button"
            variant={value === String(day) ? "default" : "outline"}
            size="sm"
            className={cn("h-9 rounded-full", value !== String(day) && "bg-background")}
            onClick={() => setValue(String(day))}
          >
            {day}
          </Button>
        ))}
        <SearchPicker
          value={value}
          placeholder="Más…"
          options={options}
          onValueChange={setValue}
          className="h-9"
          inputPlaceholder="Buscar día…"
        />
      </div>
    </div>
  );
}

