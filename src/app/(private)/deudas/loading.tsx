import { Skeleton } from "@/components/ui/skeleton";
import { CardContent, CardHeader } from "@/components/ui/card";
import { CardPage } from "@/components/ui/card-page";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-[180px]" />
        <Skeleton className="h-4 w-[520px] max-w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <CardPage>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[160px]" />
            <Skeleton className="h-7 w-[220px]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-[140px] rounded-2xl" />
            <Skeleton className="h-[140px] rounded-2xl" />
          </CardContent>
        </CardPage>
        <CardPage>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-7 w-[220px]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11 w-[160px]" />
          </CardContent>
        </CardPage>
      </div>
    </div>
  );
}

