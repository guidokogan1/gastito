import { cn } from "@/lib/utils";

type TrendMonth = {
  key: string;
  label: string;
  incomes: number;
  expenses: number;
};

function buildPoints(values: number[], maxValue: number) {
  const left = 20;
  const right = 340;
  const top = 16;
  const height = 88;
  const step = (right - left) / Math.max(values.length - 1, 1);
  const safeMax = maxValue > 0 ? maxValue : 1;

  return values.map((value, index) => {
    const x = Math.round(left + index * step);
    const y = maxValue > 0 ? Math.round(top + (1 - value / safeMax) * height) : top + Math.round(height * 0.55);
    return { x, y };
  });
}

function toPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function toAreaPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  const baseline = 128;
  return `${toPath(points)} L ${points[points.length - 1]?.x ?? 0} ${baseline} L ${points[0]?.x ?? 0} ${baseline} Z`;
}

export function MonthlyTrendChart({
  months,
  deltaLabel,
  trendTone = "neutral",
  className,
}: {
  months: TrendMonth[];
  deltaLabel: string;
  trendTone?: "positive" | "warning" | "neutral";
  className?: string;
}) {
  const expenses = months.map((month) => month.expenses);
  const incomes = months.map((month) => month.incomes);
  const maxValue = Math.max(0, ...expenses, ...incomes);
  const expensePoints = buildPoints(expenses, maxValue);
  const incomePoints = buildPoints(incomes, maxValue);
  const lastExpensePoint = expensePoints[expensePoints.length - 1];

  return (
    <section className={cn("space-y-4 border-b border-border/70 pb-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.74rem] font-medium uppercase tracking-[0.075em] text-muted-foreground">Tendencia · 7 meses</p>
          <p
            className={cn(
              "mt-1 text-[1.02rem] font-medium",
              trendTone === "positive" && "text-[var(--income)]",
              trendTone === "warning" && "text-amber-700",
              trendTone === "neutral" && "text-muted-foreground",
            )}
          >
            {deltaLabel}
          </p>
        </div>
        <div className="shrink-0 space-y-1 text-right text-[0.88rem] font-normal text-muted-foreground">
          <p className="flex items-center justify-end gap-2">
            <span className="h-1 w-6 rounded-full bg-[var(--finance-green)]" />
            Gastos
          </p>
          <p className="flex items-center justify-end gap-2">
            <span className="h-0.5 w-6 border-t-2 border-dashed border-muted-foreground/45" />
            Ingresos
          </p>
        </div>
      </div>

      <div role="img" aria-label="Tendencia de gastos e ingresos de los últimos 7 meses" className="-mx-1">
        <svg viewBox="0 0 360 158" className="h-[12.25rem] w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="dashboard-expense-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--finance-green)" stopOpacity="0.13" />
              <stop offset="100%" stopColor="var(--finance-green)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={toAreaPath(expensePoints)} fill="url(#dashboard-expense-fill)" />
          <path
            d={toPath(incomePoints)}
            fill="none"
            stroke="currentColor"
            strokeDasharray="5 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="text-muted-foreground/45"
          />
          <path
            d={toPath(expensePoints)}
            fill="none"
            stroke="var(--finance-green)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {lastExpensePoint ? (
            <circle cx={lastExpensePoint.x} cy={lastExpensePoint.y} r="4.5" fill="var(--surface-base)" stroke="var(--finance-green)" strokeWidth="3" />
          ) : null}
          {months.map((month, index) => {
            const x = expensePoints[index]?.x ?? 0;
            return (
              <text key={month.key} x={x} y="150" textAnchor="middle" className="fill-muted-foreground text-[0.72rem] font-medium">
                {month.label}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
