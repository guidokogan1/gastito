"use client";

import * as React from "react";
import { Check, ChevronDown, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchPickerOption = {
  value: string;
  label: string;
  keywords?: string;
};

export function SearchPicker({
  value,
  options,
  onValueChange,
  placeholder = "Seleccionar…",
  className,
  contentClassName,
  emptyLabel = "Sin resultados",
  inputPlaceholder = "Buscar…",
  showSelectedLabel = true,
  side,
  align,
  sideOffset,
}: {
  value: string;
  options: SearchPickerOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  emptyLabel?: string;
  inputPlaceholder?: string;
  showSelectedLabel?: boolean;
  side?: React.ComponentProps<typeof PopoverContent>["side"];
  align?: React.ComponentProps<typeof PopoverContent>["align"];
  sideOffset?: React.ComponentProps<typeof PopoverContent>["sideOffset"];
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listId = React.useId();

  const selected = React.useMemo(() => {
    if (!showSelectedLabel) return null;
    return options.find((o) => o.value === value) ?? null;
  }, [options, showSelectedLabel, value]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const haystack = `${o.label} ${o.keywords ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [options, query]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(handle);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            "h-9 justify-between gap-2 rounded-full bg-background px-3 font-normal text-muted-foreground hover:bg-muted/40",
            value && "text-foreground",
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[min(21rem,calc(100vw-2rem))] rounded-[1.35rem] p-2", contentClassName)}
        align={align ?? "start"}
        side={side}
        sideOffset={sideOffset}
      >
        <div className="flex items-center gap-2 px-1 pb-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={inputPlaceholder}
            className="h-10 rounded-full border-border/45 bg-[var(--surface-inset)] focus-visible:border-[var(--finance-green)]/40 focus-visible:ring-0"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                return;
              }
              if (event.key !== "Enter") return;
              const first = filtered[0];
              if (!first) return;
              event.preventDefault();
              onValueChange(first.value);
              setOpen(false);
            }}
          />
        </div>

        <div id={listId} role="listbox" className="max-h-72 overflow-auto rounded-xl p-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <SearchX className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value || option.label}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 rounded-full px-4 py-2 text-left text-sm font-medium transition-colors",
                      "hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/20",
                      active && "bg-muted/70",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {active ? <Check className="h-4 w-4 text-foreground/80" /> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
