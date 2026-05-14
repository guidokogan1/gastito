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
        variant === "default" && "h-9 bg-[var(--surface-pill)] px-4 text-[0.9rem] font-medium",
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
        "inline-flex h-8 shrink-0 items-center rounded-full border border-transparent px-3.5 text-[0.84rem] font-medium transition-colors",
        tone === "neutral" && "bg-[var(--surface-pill)] text-muted-foreground",
        tone === "success" && "bg-[var(--income-soft)] text-[var(--income)]",
        tone === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-200",
        tone === "danger" && "bg-destructive/10 text-destructive",
        tone === "info" && "bg-[var(--finance-blue)]/10 text-[var(--finance-blue)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
