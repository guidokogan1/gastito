"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function formatMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(key: string) {
  const [yearRaw, monthRaw] = key.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return key;

  const date = new Date(year, Math.max(0, month - 1), 1);
  const raw = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
  const withoutDe = raw.replace(/\s+de\s+/i, " ");
  return withoutDe.charAt(0).toUpperCase() + withoutDe.slice(1);
}

export function MonthSelector({
  value,
  monthsBack = 18,
  availableMonths,
  id = "month",
  label = "Mes",
  hint = "Elegí el mes a ver",
}: {
  value: string;
  monthsBack?: number;
  availableMonths?: { key: string; count: number }[];
  id?: string;
  label?: string;
  hint?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = useMemo(() => {
    if (availableMonths && availableMonths.length) {
      return availableMonths.map((entry) => entry.key);
    }
    const now = new Date();
    const months: string[] = [];
    for (let i = 0; i < monthsBack; i += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(formatMonthKey(date));
    }
    return months;
  }, [availableMonths, monthsBack]);

  const counts = useMemo(() => {
    if (!availableMonths) return new Map<string, number>();
    return new Map(availableMonths.map((entry) => [entry.key, entry.count]));
  }, [availableMonths]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-xs font-normal text-muted-foreground">{hint}</span>
      </Label>
      <Select
        value={value}
        onValueChange={(next) => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("message");
          params.delete("error");
          params.set("month", next);
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        <SelectTrigger id={id} className="w-full justify-between">
          <SelectValue>
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span className="truncate">{formatMonthLabel(value)}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((key) => (
            <SelectItem key={key} value={key}>
              <span className="flex w-full items-center justify-between gap-3">
                <span>{formatMonthLabel(key)}</span>
                {counts.has(key) ? (
                  <span
                    className={cn(
                      "text-xs tabular-nums text-muted-foreground",
                      (counts.get(key) ?? 0) === 0 && "opacity-70",
                    )}
                  >
                    {counts.get(key)}
                  </span>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
