import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function GroupedSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grouped-section", className)}>
      {eyebrow || title || description ? (
        <header className="grouped-section-header">
          {eyebrow ? <p className="stat-label">{eyebrow}</p> : null}
          {title ? <h2 className="section-title mt-1">{title}</h2> : null}
          {description ? <p className="section-description mt-1">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function GroupedRow({
  icon: Icon,
  title,
  meta,
  value,
  tone = "default",
  children,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  meta?: React.ReactNode;
  value?: React.ReactNode;
  tone?: "default" | "positive" | "negative" | "muted";
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grouped-row", className)}>
      {Icon ? (
        <div className="app-icon-tile">
          <Icon className="size-3.5" aria-hidden />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.95rem] font-semibold tracking-[-0.012em] text-foreground">{title}</p>
        {meta ? <p className="mt-0.5 truncate text-[0.82rem] font-medium text-muted-foreground">{meta}</p> : null}
        {children}
      </div>
      {value ? (
        <div
          className={cn(
            "shrink-0 text-right text-[0.88rem] font-semibold tabular-nums",
            tone === "positive" && "text-emerald-600",
            tone === "negative" && "text-destructive",
            tone === "muted" && "text-muted-foreground",
          )}
        >
          {value}
        </div>
      ) : null}
    </div>
  );
}
