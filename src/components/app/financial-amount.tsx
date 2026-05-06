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
  const prefix = showSign ? (direction === "income" ? "+" : direction === "expense" ? "-" : "") : "";

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
      {formatArs(value)}
    </span>
  );
}
