"use client";

import { getArtist } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { usePublished } from "@/features/published/published-provider";
import { ArtworkCard } from "@/components/artwork-card";

export function CreatedArtistWork({ artistId }: { artistId: string }) {
  const { state, hydrated } = useDemo();
  const published = usePublished();
  if (!hydrated) return null;
  const artist = getArtist(artistId);
  const items = [...published.artworks, ...state.createdArtworks.filter((item) => !published.artworks.some((shared) => shared.id === item.id))]
    .filter((item) => item.artistId === artistId && item.visibility === "public");
  if (!artist || !items.length) return null;
  return (
    <div className="mb-6 columns-2 gap-4">
      {items.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} artist={artist} />)}
    </div>
  );
}
