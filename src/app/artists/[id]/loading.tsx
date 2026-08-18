import { Skeleton } from "@/components/ui/skeleton";

export default function ArtistLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex gap-6">
        <Skeleton className="size-28 rounded-[2rem] sm:size-36" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-16 w-full max-w-xl" />
        </div>
      </div>
    </div>
  );
}
