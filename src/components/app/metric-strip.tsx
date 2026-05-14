import { cn } from "@/lib/utils";

export function MetricStrip({
  items,
  columns,
  className,
}: {
  items: {
    label: string;
    value: React.ReactNode;
    tone?: "default" | "income" | "danger";
  }[];
  columns?: 2 | 3;
  className?: string;
}) {
  const isThreeColumns = columns !== 2;

  return (
    <div className={cn("grid", columns === 2 ? "grid-cols-2 gap-3" : "grid-cols-3 gap-x-2.5 gap-y-3 sm:gap-x-3", className)}>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "min-w-0",
            isThreeColumns && items.length === 3 && index === items.length - 1 && "col-span-1",
          )}
        >
          <p className={cn("font-normal text-muted-foreground", isThreeColumns ? "text-[0.76rem] sm:text-[0.8rem]" : "text-[0.8rem]")}>
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 overflow-hidden whitespace-nowrap text-ellipsis font-medium leading-none tabular-nums text-foreground",
              isThreeColumns ? "text-[clamp(0.84rem,3.95vw,1rem)] sm:text-[0.96rem]" : "text-[0.96rem]",
              item.tone === "income" && "text-[var(--income)] dark:text-[var(--income-soft)]",
              item.tone === "danger" && "text-red-700",
            )}
            title={typeof item.value === "string" ? item.value : undefined}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
