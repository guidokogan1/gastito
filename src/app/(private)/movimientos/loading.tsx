import { ListRowsSkeleton } from "@/components/app/app-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 pt-1">
        <Skeleton className="h-11 w-56 rounded-2xl" />
        <Skeleton className="size-11 rounded-full" />
      </div>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-11 w-40 rounded-full" />
          <div className="flex shrink-0 gap-2">
            <Skeleton className="size-11 rounded-full" />
          </div>
        </div>

        <div className="finance-summary-strip rounded-[1.25rem] bg-[var(--surface-pill)] px-4 py-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>

        <Skeleton className="h-12 w-full rounded-[1.25rem]" />
        <div className="mobile-scroll-row">
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-24 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
        </div>
      </section>

      <ListRowsSkeleton rows={6} />
    </div>
  );
}
