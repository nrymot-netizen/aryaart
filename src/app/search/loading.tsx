import { ArtworkGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-16 sm:px-6">
      <Skeleton className="mx-auto h-10 w-40" />
      <Skeleton className="mx-auto mt-6 h-16 w-2/3" />
      <div className="mt-12"><ArtworkGridSkeleton /></div>
    </div>
  );
}
