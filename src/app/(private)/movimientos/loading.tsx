import { Skeleton } from "@/components/ui/skeleton";
import { CardContent, CardHeader } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-[220px]" />
          <Skeleton className="h-4 w-[420px] max-w-full" />
        </div>
        <Skeleton className="h-11 w-full sm:w-[220px]" />
      </div>

      <CardPage>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-[220px]" />
          <Skeleton className="h-7 w-[360px] max-w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <Skeleton className="h-11 sm:col-span-2" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
          <Skeleton className="h-[320px] rounded-2xl" />
        </CardContent>
      </CardPage>
    </div>
  );
}

