import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-12 w-[210px] rounded-2xl" />
          <Skeleton className="h-4 w-[320px] max-w-full" />
        </div>
        <Skeleton className="size-11 rounded-full" />
      </div>
      <Skeleton className="h-[220px] rounded-[1.4rem]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-[1.2rem]" />
        <Skeleton className="h-20 rounded-[1.2rem]" />
        <Skeleton className="h-20 rounded-[1.2rem]" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-[260px] rounded-[1.4rem]" />
        <Skeleton className="h-[260px] rounded-[1.4rem]" />
      </div>
    </div>
  );
}
