"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, ChevronDown, ChevronRight } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Slideout } from "@/components/app/slideout";
import { Button } from "@/components/ui/button";
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
  variant = "field",
}: {
  value: string;
  monthsBack?: number;
  availableMonths?: { key: string; count: number }[];
  id?: string;
  label?: string;
  hint?: string;
  variant?: "field" | "pill";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

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

  const selectMonth = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("message");
    params.delete("error");
    params.set("month", next);
    setOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {variant === "pill" ? (
        <button
          id={id}
          type="button"
          className="pressed-scale focus-hairline inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-border/70 bg-[var(--surface-control)] px-3.5 text-left transition-colors"
          onClick={() => setOpen(true)}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate text-[0.9rem] font-medium">{formatMonthLabel(value)}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={id} className="flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">{hint}</span>
          </Label>
          <button
            id={id}
            type="button"
            className="pressed-scale focus-hairline flex min-h-14 w-full items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border/70 bg-[var(--surface-control)] px-4 text-left transition-colors"
            onClick={() => setOpen(true)}
          >
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate text-[1.05rem] font-semibold">{formatMonthLabel(value)}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </div>
      )}

      <Slideout
        open={open}
        title="Elegí el mes"
        description="Filtra la actividad sin cambiar tus datos."
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          <div className="divide-y divide-border/60">
            {options.map((key) => {
              const active = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    "pressed-scale focus-hairline flex min-h-[4.2rem] w-full items-center justify-between gap-3 py-3 text-left transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                  onClick={() => selectMonth(key)}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[1.05rem] font-semibold">{formatMonthLabel(key)}</span>
                    {counts.has(key) ? (
                      <span className="mt-0.5 block text-sm font-medium text-muted-foreground">
                        {counts.get(key)} movimiento{(counts.get(key) ?? 0) === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </span>
                  {active ? <Check className="size-4 text-[var(--finance-green)]" aria-hidden /> : null}
                </button>
              );
            })}
          </div>
          <div className="sheet-action-bar">
            <Button type="button" variant="ghost" className="w-full" onClick={() => selectMonth(formatMonthKey(new Date()))}>
              Ir al mes actual
            </Button>
          </div>
        </div>
      </Slideout>
    </>
  );
}
