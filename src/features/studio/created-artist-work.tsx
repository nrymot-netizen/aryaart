"use client";

import { getArtist } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { ArtworkCard } from "@/components/artwork-card";

export function CreatedArtistWork({ artistId }: { artistId: string }) {
  const { state, hydrated } = useDemo();
  if (!hydrated) return null;
  const artist = getArtist(artistId);
  const items = state.createdArtworks.filter((item) => item.artistId === artistId && item.visibility === "public");
  if (!artist || !items.length) return null;
  return (
    <div className="mb-6 columns-2 gap-4">
      {items.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} artist={artist} />)}
    </div>
  );
}
