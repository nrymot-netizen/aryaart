import { ArtworkGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6 lg:px-10">
      <Skeleton className="mx-auto h-12 w-2/3 max-w-xl" />
      <Skeleton className="mx-auto mt-4 h-5 w-1/2 max-w-md" />
      <Skeleton className="mx-auto mt-8 h-14 w-full max-w-2xl rounded-2xl" />
      <div className="mt-12"><ArtworkGridSkeleton /></div>
    </div>
  );
}
