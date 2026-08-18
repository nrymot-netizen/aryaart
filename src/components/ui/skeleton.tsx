export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-black/[0.08] motion-reduce:animate-none ${className}`} />;
}

export function ArtworkGridSkeleton({ count = 8 }: { count?: number }) {
  return <div className="columns-2 gap-3 sm:columns-3 sm:gap-5 lg:columns-4">{Array.from({ length: count }, (_, index) => <div key={index} className="mb-5 break-inside-avoid"><Skeleton className="aspect-[4/5] w-full rounded-[1.4rem]" /><Skeleton className="mt-3 h-4 w-3/4" /><Skeleton className="mt-2 h-3 w-1/2" /></div>)}</div>;
}
