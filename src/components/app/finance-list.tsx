import { ArrowDownLeft, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/app/pill-chip";

export function FinanceList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("app-list", className)} {...props} />;
}

export function FinanceRow({
  icon: Icon,
  title,
  meta,
  amount,
  direction = "expense",
  status,
  active,
  children,
  className,
  interactive = false,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  meta?: React.ReactNode;
  amount?: React.ReactNode;
  direction?: "expense" | "income" | "neutral";
  status?: React.ReactNode;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const FallbackIcon = direction === "income" ? ArrowDownLeft : ArrowUpRight;
  const RowIcon = Icon ?? FallbackIcon;

  return (
    <div className={cn("app-list-row", active && "bg-[var(--surface-selected)]/55", className)} data-interactive={interactive ? "true" : undefined}>
      <div
        className={cn(
          "app-icon-tile",
          direction === "income" && "bg-[var(--income-soft)] text-[var(--income)]",
          direction === "expense" && "bg-[var(--surface-pill)] text-foreground",
        )}
      >
        <RowIcon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="row-title truncate">{title}</p>
        {meta ? <p className="row-meta mt-0.5 truncate">{meta}</p> : null}
        {status ? <div className="mt-2"><StatusPill>{status}</StatusPill></div> : null}
        {children}
      </div>
      {amount ? (
        <div
          className={cn(
            "money-row shrink-0 text-right",
            direction === "income" && "text-[var(--income)] dark:text-[var(--income-soft)]",
            direction === "expense" && "text-foreground",
            direction === "neutral" && "text-muted-foreground",
          )}
        >
          {amount}
        </div>
      ) : null}
    </div>
  );
}
