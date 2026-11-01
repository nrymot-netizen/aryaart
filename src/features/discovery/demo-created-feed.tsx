"use client";

import { PencilSimple } from "@phosphor-icons/react";
import { artists, services } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { ArtworkMasonry } from "@/features/discovery/discover-sections";
import { artworkMatchesFilters } from "@/lib/domain/discovery";
import type { DiscoveryFilters } from "@/types";

export function DemoCreatedFeed({ filters }: { filters?: DiscoveryFilters }) {
  const { state, hydrated } = useDemo();
  if (!hydrated) return null;
  const artworks = state.createdArtworks.filter((artwork) => {
    const artist = artists.find((item) => item.id === artwork.artistId);
    if (!artist) return false;
    return !filters || artworkMatchesFilters(artwork, artist, filters, services);
  });
  if (!artworks.length) return null;
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">Made here</p>
      <h2 className="mb-6 mt-1 flex items-center gap-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl"><PencilSimple size={28} className="text-plum" />Drawn on Arya</h2>
      <ArtworkMasonry artworks={artworks} artists={artists} />
    </section>
  );
}
