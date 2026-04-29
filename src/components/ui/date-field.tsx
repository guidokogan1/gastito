"use client";

import * as React from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Slideout } from "@/components/app/slideout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  "aria-invalid"?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

const WEEK_STARTS_ON = 1 as const;

function parseDate(value: string): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function toIsoDate(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

export function DateField({
  id,
  name,
  className,
  placeholder,
  required,
  disabled,
  min,
  max,
  defaultValue = "",
  value,
  onValueChange,
  "aria-invalid": ariaInvalid,
}: DateFieldProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const resolvedValue = value ?? internalValue;
  const setResolvedValue = onValueChange ?? setInternalValue;

  React.useEffect(() => {
    if (value !== undefined) return;
    setInternalValue(defaultValue);
  }, [defaultValue, value]);

  const selectedDate = React.useMemo(() => parseDate(resolvedValue), [resolvedValue]);
  const minDate = React.useMemo(() => parseDate(min ?? ""), [min]);
  const maxDate = React.useMemo(() => parseDate(max ?? ""), [max]);
  const [open, setOpen] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState(resolvedValue);
  const draftDate = React.useMemo(() => parseDate(draftValue), [draftValue]);
  const [month, setMonth] = React.useState<Date>(() => startOfMonth(selectedDate ?? new Date()));

  React.useEffect(() => {
    if (selectedDate) setMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  React.useEffect(() => {
    if (!open) return;
    setDraftValue(resolvedValue);
    setMonth(startOfMonth(selectedDate ?? new Date()));
  }, [open, resolvedValue, selectedDate]);

  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: WEEK_STARTS_ON });
  const resolvedPlaceholder = placeholder ?? "Seleccionar fecha";

  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const weekDays = React.useMemo(() => {
    const reference = startOfWeek(new Date(), { weekStartsOn: WEEK_STARTS_ON });
    return Array.from({ length: 7 }, (_, index) =>
      format(addDays(reference, index), "EEEEE", { locale: es }).toUpperCase(),
    );
  }, []);

  const isDayDisabled = React.useCallback(
    (day: Date): boolean => {
      if (minDate && isBefore(day, minDate)) return true;
      if (maxDate && isAfter(day, maxDate)) return true;
      return false;
    },
    [maxDate, minDate],
  );

  const selectDay = (day: Date) => {
    if (isDayDisabled(day) || disabled) return;
    setDraftValue(toIsoDate(day));
  };

  const confirmSelection = () => {
    setResolvedValue(draftValue);
    setOpen(false);
  };

  const calendar = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[1.35rem] font-semibold capitalize tracking-[-0.035em]">{format(monthStart, "MMMM yyyy", { locale: es })}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => setMonth((prev) => addDays(startOfMonth(prev), -1))}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Mes anterior</span>
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => setMonth((prev) => addDays(endOfMonth(prev), 1))}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Mes siguiente</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
        {weekDays.map((day, index) => (
          <div key={`${day}-${index}`} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const disabledDay = isDayDisabled(day);
          const selected = draftDate ? isSameDay(day, draftDate) : false;
          const today = isSameDay(day, new Date());
          const outside = !isSameMonth(day, monthStart);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabledDay}
              onClick={() => selectDay(day)}
              className={cn(
                "pressed-scale focus-hairline h-11 rounded-full text-base font-semibold transition-colors",
                selected && "bg-primary text-primary-foreground",
                !selected && !disabledDay && "text-foreground",
                outside && "text-muted-foreground/58",
                today && !selected && "ring-1 ring-border",
                disabledDay && "cursor-not-allowed text-muted-foreground/35",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="sheet-action-bar">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDraftValue("")}
          >
            Limpiar
          </Button>
          <Button type="button" variant="secondary" onClick={() => setDraftValue(toIsoDate(new Date()))}>
            Hoy
          </Button>
          <Button type="button" onClick={confirmSelection}>
            Listo
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {name ? <input type="hidden" name={name} value={resolvedValue} required={required} /> : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        data-invalid={ariaInvalid ? "true" : undefined}
        className={cn(
          "focus-hairline flex h-[2.875rem] w-full min-w-0 items-center justify-between gap-3 rounded-[1rem] border border-input bg-[var(--surface-control)] px-4 py-2 text-left text-sm font-medium transition-[color,border-color,background] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <span className={cn("truncate", !selectedDate && "text-muted-foreground")}>
          {selectedDate
            ? format(selectedDate, "d 'de' MMM, yyyy", { locale: es })
            : resolvedPlaceholder}
        </span>
        <CalendarDays className="size-4 text-muted-foreground" />
      </button>
      <Slideout
        open={open}
        title="Elegí la fecha"
        description={draftDate ? format(draftDate, "d 'de' MMMM, yyyy", { locale: es }) : "Sin fecha seleccionada"}
        className="min-h-[72dvh] lg:min-h-0"
        onClose={() => setOpen(false)}
      >
        {calendar}
      </Slideout>
    </>
  );
}
