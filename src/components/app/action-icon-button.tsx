import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ActionIconButton({
  icon: Icon,
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "pressable grid size-11 place-items-center rounded-full border border-border bg-[var(--surface-pill)] text-foreground transition-colors hover:bg-[var(--surface-selected)] hover:text-[var(--finance-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/18",
        className,
      )}
      {...props}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
