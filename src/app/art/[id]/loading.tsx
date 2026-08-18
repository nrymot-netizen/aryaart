import { Skeleton } from "@/components/ui/skeleton";

export default function ArtworkLoading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    </div>
  );
}
