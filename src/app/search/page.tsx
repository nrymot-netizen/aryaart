import { artists } from "@/data/mock-data";
import { PageIntro } from "@/components/page-intro";
import { SearchFilters } from "@/features/discovery/search-filters";
import { FilteredDiscoverResults } from "@/features/discovery/discover-sections";
import { searchCatalog } from "@/lib/dal/catalog";
import { parseDiscoverySearchParams } from "@/lib/domain/discovery";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseDiscoverySearchParams(await searchParams);
  const results = searchCatalog(filters);

  return (
    <>
      <PageIntro eyebrow="Search" title="Find the right work" description="Combine search, style, budget, availability, and usage. Results stay in the URL so you can share or come back to the same view." />
      <div className="mx-auto max-w-[1480px] px-4 pb-6 sm:px-6 lg:px-10"><SearchFilters filters={filters} action="/search" showAdvanced /></div>
      {filters.format === "physical" && <p className="mx-auto mb-6 max-w-3xl px-4 text-sm text-black/55 sm:px-6">Physical commissions are listed for discovery, but checkout stays digital-only in this demo.</p>}
      <FilteredDiscoverResults artworks={results} artists={artists} filters={filters} />
    </>
  );
}
