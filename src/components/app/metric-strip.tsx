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
  return (
    <div className={cn("grid gap-3", columns === 2 ? "grid-cols-2" : "grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[0.8rem] font-normal text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              "mt-1 truncate text-[0.96rem] font-medium leading-none tabular-nums text-foreground",
              item.tone === "income" && "text-[var(--income)] dark:text-[var(--income-soft)]",
              item.tone === "danger" && "text-red-700",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
