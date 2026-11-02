import { artists, artworks } from "@/data/mock-data";
import { SearchFilters } from "@/features/discovery/search-filters";
import { ArtistRail, DiscoverHero, FilteredDiscoverResults } from "@/features/discovery/discover-sections";
import { DiscoverOpenHero } from "@/features/discovery/discover-open";
import { DemoCreatedFeed } from "@/features/discovery/demo-created-feed";
import { DiscoverDrawBacks } from "@/features/artwork/discover-draw-backs";
import { searchCatalog } from "@/lib/dal/catalog";
import { artistsAcceptingCommissions, hasActiveFilters, parseDiscoverySearchParams, rankDiscoveryCandidates } from "@/lib/domain/discovery";

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseDiscoverySearchParams(await searchParams);
  const filtered = searchCatalog(filters);
  const recommended = rankDiscoveryCandidates(artworks, artists).slice(0, 8);
  const filteredMode = hasActiveFilters(filters);

  if (filteredMode) {
    return (
      <div>
        <DiscoverHero><SearchFilters filters={filters} /></DiscoverHero>
        <DemoCreatedFeed filters={filters} />
        <FilteredDiscoverResults artworks={filtered} artists={artists} filters={filters} />
      </div>
    );
  }

  return (
    <div>
      <DiscoverOpenHero />
      <DiscoverDrawBacks excludePairId="dback-lantern-paper" />
      <DemoCreatedFeed />
      <FilteredDiscoverResults artworks={recommended} artists={artists} filters={filters} />
      <ArtistRail eyebrow="Ready when you are" title="Artists accepting commissions" artists={artistsAcceptingCommissions(artists)} href="/commissions" />
    </div>
  );
}
