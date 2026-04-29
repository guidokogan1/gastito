import { cn } from "@/lib/utils";

export function MetricHero({
  greeting,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  children,
  className,
}: {
  greeting?: string;
  primaryLabel: string;
  primaryValue: React.ReactNode;
  secondaryLabel?: string;
  secondaryValue?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("metric-hero", className)}>
      {greeting ? <p className="text-[0.9rem] font-medium text-muted-foreground">{greeting}</p> : null}
      <div className="mt-3.5 space-y-4">
        <div>
          <p className="text-[0.9rem] font-medium text-muted-foreground">{primaryLabel}</p>
          <p className="mt-1 text-[clamp(3rem,12vw,5.15rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-foreground tabular-nums">
            {primaryValue}
          </p>
        </div>
        {secondaryLabel && secondaryValue ? (
          <div>
            <p className="text-[0.9rem] font-medium text-muted-foreground">{secondaryLabel}</p>
            <p className="mt-1 text-[clamp(2rem,7vw,3.2rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-foreground/90 tabular-nums">
              {secondaryValue}
            </p>
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
