import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function PillChip({
  icon: Icon,
  active,
  count,
  variant = "default",
  children,
  className,
}: {
  icon?: LucideIcon;
  active?: boolean;
  count?: number;
  variant?: "default" | "scope";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border border-transparent text-foreground transition-colors hover:bg-[var(--surface-selected)]",
        variant === "default" && "h-8 bg-[var(--surface-pill)] px-3.5 text-[0.875rem] font-normal",
        variant === "scope" && "h-9 bg-[var(--surface-pill)] px-4 text-[0.9rem] font-medium",
        active && "bg-foreground text-background hover:bg-foreground",
        className,
      )}
    >
      {Icon ? <Icon className="size-4" aria-hidden /> : null}
      {children}
      {typeof count === "number" && count > 0 ? (
        <span className="grid size-5 place-items-center rounded-full bg-background/75 text-[0.72rem] tabular-nums">
          {count}
        </span>
      ) : null}
    </span>
  );
}

export function StatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-[0.74rem] font-semibold",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "warning" && "bg-amber-500/12 text-amber-800 dark:text-amber-200",
        tone === "danger" && "bg-destructive/10 text-destructive",
        tone === "info" && "bg-[var(--finance-blue)]/10 text-[var(--finance-blue)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
