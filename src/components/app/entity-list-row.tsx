import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function EntityListRow({
  icon,
  title,
  meta,
  status,
  value,
  valueMeta,
  progress,
  progressClassName,
  chevron = true,
  className,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  status?: React.ReactNode;
  value?: React.ReactNode;
  valueMeta?: React.ReactNode;
  progress?: number;
  progressClassName?: string;
  chevron?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grouped-row", className)} data-interactive="true">
      <div className="app-icon-tile">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="row-title truncate">{title}</p>
        {meta ? <p className="row-meta mt-1 truncate">{meta}</p> : null}
        {status ? <div className="mt-1.5 flex flex-wrap items-center gap-2">{status}</div> : null}
      </div>
      {(value || valueMeta) ? (
        <div className="shrink-0 text-right">
          {value ? <p className="money-row">{value}</p> : null}
          {valueMeta ? <div className="row-meta mt-1">{valueMeta}</div> : null}
        </div>
      ) : null}
      {chevron ? <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden /> : null}
      {typeof progress === "number" ? (
        <div className="ml-[3.35rem] mt-2 h-1.5 basis-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full bg-[var(--finance-green)]", progressClassName)} style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </div>
  );
}
