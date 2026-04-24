"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";

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
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
}

export function MonthSelector({
  value,
  monthsBack = 18,
  id = "month",
  label = "Mes",
}: {
  value: string;
  monthsBack?: number;
  id?: string;
  label?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    for (let i = 0; i < monthsBack; i += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(formatMonthKey(date));
    }
    return months;
  }, [monthsBack]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          const params = new URLSearchParams(searchParams.toString());
          params.delete("message");
          params.delete("error");
          params.set("month", next);
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        {options.map((key) => (
          <option key={key} value={key}>
            {formatMonthLabel(key)}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

