"use client";

import { useMemo, useState } from "react";

import { formatArs } from "@/lib/format";
import { cn } from "@/lib/utils";

type TrendMonth = {
  key: string;
  label: string;
  incomes: number;
  expenses: number;
};

function buildPoints(values: number[], maxValue: number) {
  const left = 18;
  const right = 330;
  const top = 20;
  const height = 96;
  const step = (right - left) / Math.max(values.length - 1, 1);
  const safeMax = maxValue > 0 ? maxValue : 1;

  return values.map((value, index) => {
    const x = left + index * step;
    const y = maxValue > 0 ? top + (1 - value / safeMax) * height : top + height * 0.55;
    return { x, y };
  });
}

function toPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function toAreaPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  const baseline = 132;
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
  const [activeIndex, setActiveIndex] = useState(Math.max(months.length - 1, 0));

  const { expensePoints, incomePoints } = useMemo(() => {
    const expenses = months.map((month) => month.expenses);
    const incomes = months.map((month) => month.incomes);
    const maxValue = Math.max(0, ...expenses, ...incomes);
    return {
      expensePoints: buildPoints(expenses, maxValue),
      incomePoints: buildPoints(incomes, maxValue),
    };
  }, [months]);

  const activeMonth = months[activeIndex] ?? months[months.length - 1];
  const activeExpensePoint = expensePoints[activeIndex];
  const activeIncomePoint = incomePoints[activeIndex];
  const monthSummary = activeMonth
    ? [
        {
          label: "Gastos",
          value: formatArs(activeMonth.expenses),
          toneClass: "text-foreground",
        },
        {
          label: "Ingresos",
          value: formatArs(activeMonth.incomes),
          toneClass: "text-muted-foreground",
        },
      ]
    : [];

  return (
    <section className={cn("space-y-4 border-b border-border/70 pb-5", className)}>
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

      <div className="overflow-hidden rounded-[1.15rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.005))] px-2 py-3">
        <div className="min-w-0">
          {activeMonth ? (
            <div className="grid min-h-[3.6rem] grid-cols-[auto,1fr] gap-3 px-1 pb-2">
              <span className="self-start rounded-full bg-[var(--surface-pill)] px-2.5 py-1 text-[0.84rem] font-medium text-foreground">
                {activeMonth.label}
              </span>
              <div className="grid min-w-0 grid-cols-2 gap-3">
                {monthSummary.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <p className="truncate text-[0.72rem] font-medium uppercase tracking-[0.07em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className={cn("truncate text-[0.98rem] font-medium tabular-nums", item.toneClass)}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div role="img" aria-label="Tendencia de gastos e ingresos de los últimos 7 meses">
          <svg viewBox="0 0 348 146" className="h-[11.25rem] w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="dashboard-expense-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--finance-green)" stopOpacity="0.16" />
                <stop offset="100%" stopColor="var(--finance-green)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line x1="18" x2="330" y1="132" y2="132" stroke="currentColor" strokeOpacity="0.08" />
            <line x1="18" x2="330" y1="76" y2="76" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 6" />

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

            {activeExpensePoint ? (
              <>
                <line
                  x1={activeExpensePoint.x}
                  x2={activeExpensePoint.x}
                  y1="14"
                  y2="132"
                  stroke="var(--finance-green)"
                  strokeOpacity="0.12"
                  strokeDasharray="4 6"
                />
                <circle cx={activeExpensePoint.x} cy={activeExpensePoint.y} r="5" fill="var(--surface-base)" stroke="var(--finance-green)" strokeWidth="3" />
              </>
            ) : null}

            {activeIncomePoint ? (
              <circle
                cx={activeIncomePoint.x}
                cy={activeIncomePoint.y}
                r="4"
                fill="var(--surface-base)"
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="2"
                className="text-muted-foreground"
              />
            ) : null}

            {months.map((month, index) => {
              const point = expensePoints[index];
              if (!point) return null;
              return (
                <g key={month.key}>
                  <rect
                    x={point.x - 22}
                    y="0"
                    width="44"
                    height="132"
                    rx="12"
                    fill="transparent"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {months.map((month, index) => (
            <button
              key={month.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-full px-1 py-1 text-center text-[0.74rem] font-medium capitalize text-muted-foreground transition-colors",
                activeIndex === index && "bg-[var(--surface-pill)] text-foreground",
              )}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
