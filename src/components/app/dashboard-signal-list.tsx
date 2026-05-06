import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardSignal = {
  icon: LucideIcon;
  title: React.ReactNode;
  meta?: React.ReactNode;
  value?: React.ReactNode;
  tone?: "neutral" | "positive" | "warning";
};

export function DashboardSignalList({
  signals,
  className,
}: {
  signals: DashboardSignal[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border/65", className)}>
      {signals.map((signal, index) => {
        const Icon = signal.icon;
        return (
          <div key={index} className="flex min-h-[4.1rem] items-center gap-3 py-2.5">
            <div
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full bg-muted text-foreground",
                signal.tone === "positive" && "bg-[var(--income-soft)] text-[var(--income)]",
                signal.tone === "warning" && "bg-amber-500/10 text-amber-700 dark:text-amber-200",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="row-title truncate">{signal.title}</p>
              {signal.meta ? <p className="row-meta mt-0.5 truncate">{signal.meta}</p> : null}
            </div>
            {signal.value ? <div className="money-row shrink-0 text-right">{signal.value}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
