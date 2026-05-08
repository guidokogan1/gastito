import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-7 pb-8">
      <header className="space-y-2 pt-1">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </header>

      <section className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-16 w-56 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-6 pt-1">
          <div className="space-y-2">
            <Skeleton className="h-3 w-14 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-[4.9rem] rounded-[1.35rem]" />
          <Skeleton className="h-[4.9rem] rounded-[1.35rem]" />
        </div>
      </section>

      <section className="space-y-4 border-b border-border/70 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-36 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-[1.25rem]" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-40 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-[1rem]" />
          <Skeleton className="h-16 w-full rounded-[1rem]" />
        </div>
      </section>
    </div>
  );
}
