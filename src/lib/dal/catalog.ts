import { artists, artworks, getArtist, getArtwork, getService, posts, reviews, services } from "@/data/mock-data";
import { artworkMatchesFilters, filterArtworks, rankDiscoveryCandidates } from "@/lib/domain/discovery";
import type { DiscoveryFilters } from "@/types";

export function getPublicArtworks() {
  return artworks.filter((artwork) => artwork.visibility === "public");
}

export function searchCatalog(filters: DiscoveryFilters) {
  const matches = filterArtworks(getPublicArtworks(), artists, services, filters);
  return rankDiscoveryCandidates(matches, artists);
}

export function getArtworkPage(id: string) {
  const artwork = getArtwork(id);
  if (!artwork) return null;
  const artist = getArtist(artwork.artistId);
  if (!artist) return null;
  return { artwork, artist };
}

export { artists, artworks, posts, reviews, services, getArtist, getArtwork, getService };
export { artworkMatchesFilters };
