import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full resize-y rounded-[var(--radius-control)] border border-input bg-[var(--surface-control)] px-4 py-3 text-[1rem] font-medium outline-none transition-[color,border-color,background] focus-visible:border-ring/38 focus-visible:ring-[1px] focus-visible:ring-ring/16 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
