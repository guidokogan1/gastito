import { cn } from "@/lib/utils";

export function FinanceHero({
  greeting,
  primaryLabel,
  primaryValue,
  description,
  secondaryLabel,
  secondaryValue,
  insight,
  children,
  className,
}: {
  greeting?: React.ReactNode;
  primaryLabel: React.ReactNode;
  primaryValue: React.ReactNode;
  description?: React.ReactNode;
  secondaryLabel?: React.ReactNode;
  secondaryValue?: React.ReactNode;
  insight?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("metric-hero space-y-5", className)}>
      <div>
        {greeting ? <p className="mb-3 text-[0.95rem] font-semibold text-muted-foreground">{greeting}</p> : null}
        <p className="section-eyebrow text-muted-foreground">{primaryLabel}</p>
        <p className="money-hero mt-3">{primaryValue}</p>
        {description ? <p className="mt-2 max-w-[34rem] text-[0.95rem] leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {secondaryLabel || secondaryValue ? (
        <div>
          {secondaryLabel ? <p className="text-[0.95rem] font-semibold text-muted-foreground">{secondaryLabel}</p> : null}
          {secondaryValue ? <p className="mt-1 text-[2.2rem] font-semibold leading-none tracking-[-0.05em] tabular-nums">{secondaryValue}</p> : null}
        </div>
      ) : null}
      {insight ? (
        <div className="border-t border-border/70 pt-3 text-[0.92rem] font-semibold text-[var(--finance-green)]">
          {insight}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function FinanceHeroSplit({
  items,
  className,
}: {
  items: Array<{
    label: React.ReactNode;
    value: React.ReactNode;
    meta?: React.ReactNode;
    tone?: "default" | "income" | "danger";
  }>;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-5 border-b border-border/70 pb-5 sm:grid-cols-2", className)}>
      {items.map((item, index) => (
        <div key={String(item.label)} className={cn(index === 0 && items.length > 1 ? "sm:border-r sm:border-border/70 sm:pr-5" : "")}>
          <p className="section-eyebrow">{item.label}</p>
          <p
            className={cn(
              "stat-value mt-2",
              item.tone === "income" && "text-[var(--income)]",
              item.tone === "danger" && "text-red-700",
            )}
          >
            {item.value}
          </p>
          {item.meta ? <p className="row-meta mt-1">{item.meta}</p> : null}
        </div>
      ))}
    </section>
  );
}
