import { artists, artworks } from "@/data/mock-data";
import { ArtworkCard } from "@/components/artwork-card";
import { SearchFilters } from "@/features/discovery/search-filters";
import { ArtistRail, DiscoverHero, DiscoverSomeoneNew, FilteredDiscoverResults, StylePills } from "@/features/discovery/discover-sections";
import { searchCatalog } from "@/lib/dal/catalog";
import { artistsAcceptingCommissions, artUnderBudget, discoverSomeoneNew, emergingArtists, hasActiveFilters, newArtwork, parseDiscoverySearchParams, rankDiscoveryCandidates, trendingStyles } from "@/lib/domain/discovery";

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseDiscoverySearchParams(await searchParams);
  const filtered = searchCatalog(filters);
  const recommended = rankDiscoveryCandidates(artworks, artists).slice(0, 12);
  const filteredMode = hasActiveFilters(filters);

  return (
    <div>
      <DiscoverHero><SearchFilters filters={filters} /></DiscoverHero>
      {filteredMode ? (
        <FilteredDiscoverResults artworks={filtered} artists={artists} filters={filters} />
      ) : (
        <>
          <ArtistRail eyebrow="Ready when you are" title="Artists accepting commissions" artists={artistsAcceptingCommissions(artists)} href="/commissions" />
          <ArtistRail eyebrow="Still growing" title="Emerging artists" artists={emergingArtists(artists)} href="/search?emerging=1" />
          <FilteredDiscoverResults artworks={recommended} artists={artists} filters={filters} />
          <ArtworkSection eyebrow="Just arrived" title="New artwork" artworks={newArtwork(artworks).slice(0, 8)} />
          <ArtworkSection eyebrow="Accessible starting points" title="Art under $50" artworks={artUnderBudget(artworks).slice(0, 8)} />
          <StylePills styles={trendingStyles(artworks).slice(0, 8)} />
          <DiscoverSomeoneNew artists={discoverSomeoneNew(artists)} />
        </>
      )}
    </div>
  );
}

function ArtworkSection({ eyebrow, title, artworks: items }: { eyebrow: string; title: string; artworks: typeof artworks }) {
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">{eyebrow}</p>
      <h2 className="mb-6 mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">{title}</h2>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {items.map((artwork, index) => {
          const artist = artists.find((item) => item.id === artwork.artistId);
          return artist ? <ArtworkCard key={artwork.id} artwork={artwork} artist={artist} priority={index < 2} /> : null;
        })}
      </div>
    </section>
  );
}
