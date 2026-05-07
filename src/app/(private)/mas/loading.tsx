import { CatalogLoadingSkeleton } from "@/components/app/app-skeletons";

export default function MoreLoading() {
  return (
    <div className="space-y-6">
      <CatalogLoadingSkeleton titleWidth="w-20" rows={1} />
      <CatalogLoadingSkeleton titleWidth="w-28" rows={3} />
      <CatalogLoadingSkeleton titleWidth="w-32" rows={3} />
    </div>
  );
}
