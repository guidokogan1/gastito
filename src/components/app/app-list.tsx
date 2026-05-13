import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function AppList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("app-list", className)} {...props} />;
}

export function AppListRow({
  icon: Icon,
  title,
  eyebrow,
  meta,
  value,
  tone = "default",
  children,
  className,
  interactive = false,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  meta?: React.ReactNode;
  value?: React.ReactNode;
  tone?: "default" | "positive" | "negative" | "muted";
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={cn("app-list-row", className)} data-interactive={interactive ? "true" : undefined}>
      {Icon ? (
        <div className="app-icon-tile">
          <Icon className="size-3.5" aria-hidden />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="text-[0.72rem] font-medium text-muted-foreground">{eyebrow}</p> : null}
        <p className="truncate text-[0.96rem] font-semibold tracking-[-0.012em] text-foreground">{title}</p>
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
