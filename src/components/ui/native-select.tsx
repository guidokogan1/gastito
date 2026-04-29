import * as React from "react";

import { cn } from "@/lib/utils";

export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "border-input h-12 w-full rounded-[var(--radius-control)] border bg-[var(--surface-control)] px-4 py-2 text-[1rem] font-medium outline-none transition-[color,border-color,background] focus-visible:border-ring/38 focus-visible:ring-[1px] focus-visible:ring-ring/16 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
