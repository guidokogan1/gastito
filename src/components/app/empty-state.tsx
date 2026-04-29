import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, compact, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-6" : "px-6 py-10 sm:py-12",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border border-border bg-background/70",
            compact ? "mb-2 size-9" : "mb-3 size-12",
          )}
        >
          <Icon className={cn("text-muted-foreground", compact ? "size-5" : "size-6")} />
        </div>
      ) : null}
      <h3 className="section-title text-balance">{title}</h3>
      {description ? (
        <p className={cn("section-description mt-1 max-w-md text-balance", compact && "text-xs")}>{description}</p>
      ) : null}
      {children ? <div className={cn("mt-4", compact && "mt-3")}>{children}</div> : null}
    </div>
  );
}
