"use client";

import { BookmarkSimple, Heart } from "@phosphor-icons/react";
import { artists, artworks } from "@/data/mock-data";
import { ArtworkCard } from "@/components/artwork-card";
import { ArtistCard } from "@/components/artist-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/page-intro";
import { useDemo } from "@/features/demo/demo-provider";

export default function SavedPage() {
  const { state } = useDemo();
  const savedArt = artworks.filter((artwork) => state.savedArtworkIds.includes(artwork.id));
  const savedArtists = artists.filter((artist) => state.savedArtistIds.includes(artist.id));

  return (
    <>
      <PageIntro eyebrow="Your collection" title="Saved work" description="Artwork and artists you save stay on this device for the demo. Reset demo clears them." />
      <div className="mx-auto max-w-[1480px] space-y-16 px-4 pb-20 sm:px-6 lg:px-10">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Saved artwork</h2>
          <div className="mt-6">
            {savedArt.length ? <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">{savedArt.map((artwork) => {
              const artist = artists.find((item) => item.id === artwork.artistId);
              return artist ? <ArtworkCard key={artwork.id} artwork={artwork} artist={artist} /> : null;
            })}</div> : <EmptyState icon={Heart} title="No saved artwork yet" description="Tap the heart on a piece to keep it here." />}
          </div>
        </section>
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Saved artists</h2>
          <div className="mt-6">
            {savedArtists.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{savedArtists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div> : <EmptyState icon={BookmarkSimple} title="No saved artists yet" description="Save an artist from their profile to follow up later." />}
          </div>
        </section>
      </div>
    </>
  );
}
