import { Skeleton } from "@/components/ui/skeleton";

const SectionSkeleton = () => (
  <div className="space-y-8 animate-fade-in">
    {/* Hero skeleton */}
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-28 h-28 rounded-full bg-muted" />
      <Skeleton className="h-8 w-40 bg-muted" />
      <Skeleton className="h-4 w-56 bg-muted" />
    </div>

    {/* Content blocks */}
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-lg bg-muted" />
      <Skeleton className="h-24 w-full rounded-lg bg-muted" />
      <Skeleton className="h-16 w-3/4 mx-auto rounded-lg bg-muted" />
    </div>
  </div>
);

export default SectionSkeleton;
