import { cn } from "@/lib/utils";

export function FinanceHero({
  greeting,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  insight,
  children,
  className,
}: {
  greeting?: React.ReactNode;
  primaryLabel: React.ReactNode;
  primaryValue: React.ReactNode;
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
        <p className="text-[1.05rem] font-semibold text-foreground">{primaryLabel}</p>
        <p className="money-hero mt-1">{primaryValue}</p>
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
