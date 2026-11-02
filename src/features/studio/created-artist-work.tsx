"use client";

import Link from "next/link";
import { getArtist } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { usePublished } from "@/features/published/published-provider";
import { isVisitorArtist } from "@/lib/published/artist";
import { ArtworkCard } from "@/components/artwork-card";

export function CreatedArtistWork({ artistId }: { artistId: string }) {
  const { state, hydrated } = useDemo();
  const published = usePublished();
  if (!hydrated) return null;
  const artist = getArtist(artistId);
  const items = [...published.artworks, ...state.createdArtworks.filter((item) => !published.artworks.some((shared) => shared.id === item.id))]
    .filter((item) => item.artistId === artistId && item.visibility === "public");
  if (!artist) return null;
  if (!items.length) {
    if (!isVisitorArtist(artistId)) return null;
    return (
      <div className="mb-6 rounded-3xl border border-black/[0.07] bg-white p-6">
        <h2 className="text-lg font-bold">Nothing published yet</h2>
        <p className="mt-2 text-sm leading-6 text-black/55">Open the studio and put a drawing here.</p>
        <Link href="/create/draw" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-white">Draw something</Link>
      </div>
    );
  }
  return (
    <div className="mb-6 columns-2 gap-4">
      {items.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} artist={artist} />)}
    </div>
  );
}
