"use client";

import { notFound } from "next/navigation";
import { getArtist, getArtistArt } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { ArtworkDetailBody } from "@/features/artwork/artwork-detail-body";
import { Skeleton } from "@/components/ui/skeleton";

export function CreatedArtworkPage({ id }: { id: string }) {
  const { state, hydrated } = useDemo();
  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  const artwork = state.createdArtworks.find((item) => item.id === id);
  const artist = artwork ? getArtist(artwork.artistId) : undefined;
  if (!artwork || !artist) notFound();
  const related = [...state.createdArtworks.filter((item) => item.id !== id && item.artistId === artwork.artistId), ...getArtistArt(artist.id)].slice(0, 6);
  return <ArtworkDetailBody artwork={artwork} artist={artist} related={related} />;
}
