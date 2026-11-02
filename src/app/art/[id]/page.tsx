import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { artworks, getRelatedArtworks } from "@/data/mock-data";
import { seedPaperLanternArtwork } from "@/data/seed-challenges";
import { seedLanternArtwork } from "@/data/seed-lantern";
import { getArtworkPage } from "@/lib/dal/catalog";
import { getArtist } from "@/data/mock-data";
import { publishedStoreConfigured } from "@/lib/published/config";
import { getPublishedStore } from "@/lib/published/store";
import { ArtworkDetailBody } from "@/features/artwork/artwork-detail-body";
import { CreatedArtworkPage } from "@/features/artwork/created-artwork-page";

export function generateStaticParams() {
  return artworks.map((artwork) => ({ id: artwork.id }));
}

function isDemoArtworkId(id: string) {
  return id.startsWith("art-") || id === seedLanternArtwork.id || id === seedPaperLanternArtwork.id;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const page = getArtworkPage(id);
  if (page) return { title: page.artwork.title };
  if (publishedStoreConfigured()) {
    const shared = await getPublishedStore().getArtwork(id).catch(() => null);
    if (shared) return { title: shared.artwork.title };
  }
  if (id === seedLanternArtwork.id) return { title: seedLanternArtwork.title };
  if (id === seedPaperLanternArtwork.id) return { title: seedPaperLanternArtwork.title };
  if (id.startsWith("art-")) return { title: "Drawn on Arya" };
  return { title: "Artwork not found" };
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = getArtworkPage(id);
  if (page) return <ArtworkDetailBody artwork={page.artwork} artist={page.artist} related={getRelatedArtworks(page.artwork)} />;
  if (publishedStoreConfigured()) {
    const shared = await getPublishedStore().getArtwork(id).catch(() => null);
    const artist = shared ? getArtist(shared.artwork.artistId) : undefined;
    if (shared && artist) return <ArtworkDetailBody artwork={shared.artwork} artist={artist} related={getRelatedArtworks(shared.artwork)} />;
  }
  if (!isDemoArtworkId(id)) notFound();
  return <CreatedArtworkPage id={id} />;
}
