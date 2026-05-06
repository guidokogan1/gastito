import { Skeleton } from "@/components/ui/skeleton";

export function SectionHeaderSkeleton({ titleWidth = "w-36" }: { titleWidth?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 pb-3 pt-1">
      <Skeleton className={`h-8 ${titleWidth} rounded-xl`} />
      <Skeleton className="size-11 rounded-full" />
    </div>
  );
}

export function ListRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grouped-row">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[min(12rem,70%)] rounded-full" />
            <Skeleton className="h-3 w-[min(16rem,82%)] rounded-full" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CatalogLoadingSkeleton({ titleWidth = "w-36", rows = 5 }: { titleWidth?: string; rows?: number }) {
  return (
    <div className="space-y-2">
      <SectionHeaderSkeleton titleWidth={titleWidth} />
      <ListRowsSkeleton rows={rows} />
    </div>
  );
}
