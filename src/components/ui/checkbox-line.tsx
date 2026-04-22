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
    <label className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <input
        type="checkbox"
        className="size-4 rounded border border-input bg-background/85 text-primary shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}

