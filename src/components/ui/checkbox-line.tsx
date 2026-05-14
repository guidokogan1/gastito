import * as React from "react";

import { cn } from "@/lib/utils";

export function CheckboxLine({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-h-[3.65rem] items-center justify-between gap-4 rounded-[1rem] bg-[var(--surface-pill)] px-4 py-3 text-[0.96rem] font-medium text-foreground",
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <span className="relative shrink-0">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="block h-7 w-12 rounded-full bg-muted transition-colors peer-checked:bg-[var(--finance-green)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--finance-green)]/20" />
        <span className="pointer-events-none absolute left-1 top-1 block size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
