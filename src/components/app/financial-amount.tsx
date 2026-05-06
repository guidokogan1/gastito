import { formatArs, type MoneyLike } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FinancialAmount({
  value,
  direction = "neutral",
  showSign = false,
  className,
}: {
  value: MoneyLike;
  direction?: "expense" | "income" | "neutral";
  showSign?: boolean;
  className?: string;
}) {
  const numericValue = typeof value === "number" ? value : Number(value.toString());
  const isNegative = Number.isFinite(numericValue) && numericValue < 0;
  const shouldShowExplicitSign = showSign || isNegative;
  const displayValue = shouldShowExplicitSign ? Math.abs(Number.isFinite(numericValue) ? numericValue : 0) : value;
  const prefix =
    shouldShowExplicitSign && (direction === "income" || (!isNegative && direction !== "expense"))
      ? "+"
      : shouldShowExplicitSign
        ? "-"
        : "";

  return (
    <span
      className={cn(
        "tabular-nums",
        direction === "income" && "text-[var(--income)] dark:text-[var(--income-soft)]",
        direction === "expense" && "text-foreground",
        direction === "neutral" && "text-muted-foreground",
        className,
      )}
    >
      {prefix}
      {formatArs(displayValue)}
    </span>
  );
}
