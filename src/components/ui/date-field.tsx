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

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  "aria-invalid": ariaInvalid,
}: DateFieldProps) {
  const [value, setValue] = React.useState(defaultValue);
  const selectedDate = React.useMemo(() => parseDate(value), [value]);
  const minDate = React.useMemo(() => parseDate(min ?? ""), [min]);
  const maxDate = React.useMemo(() => parseDate(max ?? ""), [max]);
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(() => startOfMonth(selectedDate ?? new Date()));

  React.useEffect(() => {
    if (selectedDate) setMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

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
    setValue(toIsoDate(day));
    setOpen(false);
  };

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            data-invalid={ariaInvalid ? "true" : undefined}
            className={cn(
              "border-input text-left file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-11 w-full min-w-0 rounded-xl border bg-background/85 px-3 py-2 text-sm transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40 data-[invalid=true]:border-destructive",
              "flex items-center justify-between gap-3",
              className,
            )}
          >
            <span className={cn("truncate", !selectedDate && "text-muted-foreground")}>
              {selectedDate
                ? format(selectedDate, "d 'de' MMM, yyyy", { locale: es })
                : resolvedPlaceholder}
            </span>
            <CalendarDays className="size-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] rounded-2xl border-border/70 p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold capitalize">{format(monthStart, "MMMM yyyy", { locale: es })}</p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-lg"
                  onClick={() => setMonth((prev) => addDays(startOfMonth(prev), -1))}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Mes anterior</span>
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-lg"
                  onClick={() => setMonth((prev) => addDays(endOfMonth(prev), 1))}
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Mes siguiente</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {weekDays.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const disabledDay = isDayDisabled(day);
                const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                const today = isSameDay(day, new Date());
                const outside = !isSameMonth(day, monthStart);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => selectDay(day)}
                    className={cn(
                      "h-9 rounded-lg text-sm font-medium transition-colors",
                      selected && "bg-primary text-primary-foreground shadow-sm",
                      !selected && !disabledDay && "hover:bg-accent hover:text-accent-foreground",
                      outside && "text-muted-foreground/70",
                      today && !selected && "ring-1 ring-border",
                      disabledDay && "cursor-not-allowed text-muted-foreground/45",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  setValue("");
                  setOpen(false);
                }}
              >
                Limpiar
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => selectDay(new Date())}>
                Hoy
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

