import { artworks, getRelatedArtworks } from "@/data/mock-data";
import { getArtworkPage } from "@/lib/dal/catalog";
import { ArtworkDetailBody } from "@/features/artwork/artwork-detail-body";
import { CreatedArtworkPage } from "@/features/artwork/created-artwork-page";

export function generateStaticParams() {
  return artworks.map((artwork) => ({ id: artwork.id }));
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = getArtworkPage(id);
  if (!page) return <CreatedArtworkPage id={id} />;
  return <ArtworkDetailBody artwork={page.artwork} artist={page.artist} related={getRelatedArtworks(page.artwork)} />;
}
