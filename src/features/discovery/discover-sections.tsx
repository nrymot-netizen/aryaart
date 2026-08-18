import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import type { Artist, Artwork, DiscoveryFilters } from "@/types";
import { ArtworkCard } from "@/components/artwork-card";
import { ArtistCard } from "@/components/artist-card";
import { EmptyState } from "@/components/ui/empty-state";
import { describeFilterConstraints, hasActiveFilters } from "@/lib/domain/discovery";

export function DiscoverHero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-black/5 bg-[#f4f0ea]">
      <div className="absolute -left-24 -top-36 size-72 rounded-full bg-[#f1b6ad]/55 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-80 rounded-full bg-[#cfc0ef]/55 blur-3xl" />
      <div className="relative mx-auto max-w-[1480px] px-4 py-12 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-plum ring-1 ring-black/5"><Sparkle size={14} weight="fill" />Independent art, thoughtfully discovered</div>
          <h1 className="text-balance font-[family-name:var(--font-display)] text-5xl leading-[0.94] tracking-[-0.03em] sm:text-7xl lg:text-[5.8rem]">Find art that feels<br className="hidden sm:block" /> like <em className="text-plum">you.</em></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">Discover artists by what they create—not by how many followers they have. Commission something completely personal.</p>
        </div>
        <div className="mt-9">{children}</div>
      </div>
    </section>
  );
}

export function ArtworkMasonry({ artworks, artists, empty, filters }: { artworks: Artwork[]; artists: Artist[]; empty?: { title: string; description: string }; filters?: DiscoveryFilters }) {
  if (!artworks.length) {
    return <EmptyState icon={Sparkle} title={empty?.title ?? "No artwork found"} description={empty?.description ?? (filters ? describeFilterConstraints(filters) : "Try a different search or style.")} />;
  }
  return <div className="columns-2 gap-3 sm:columns-3 sm:gap-5 lg:columns-4">{artworks.map((artwork, index) => {
    const artist = artists.find((item) => item.id === artwork.artistId);
    return artist ? <ArtworkCard key={artwork.id} artwork={artwork} artist={artist} priority={index < 2} /> : null;
  })}</div>;
}

export function ArtistRail({ title, eyebrow, artists, href }: { title: string; eyebrow: string; artists: Artist[]; href?: string }) {
  if (!artists.length) return null;
  return (
    <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">{eyebrow}</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">{title}</h2></div>
        {href && <Link href={href} className="hidden text-sm font-bold text-plum sm:block">See all artists →</Link>}
      </div>
      <div className="no-scrollbar -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>
    </section>
  );
}

export function StylePills({ styles }: { styles: string[] }) {
  if (!styles.length) return null;
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-6 sm:px-6 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Trending styles</p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">What people are exploring</h2>
      <div className="mt-5 flex flex-wrap gap-2">{styles.map((style) => <Link key={style} href={`/?style=${encodeURIComponent(style)}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black/70 ring-1 ring-black/10 hover:text-plum">{style}</Link>)}</div>
    </section>
  );
}

export function DiscoverSomeoneNew({ artists }: { artists: Artist[] }) {
  const featured = artists[0];
  return (
    <section className="mx-auto mb-10 max-w-[1400px] px-4 sm:px-6">
      <div className="overflow-hidden rounded-4xl bg-ink px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c7b4ff]">Discover someone new</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-6xl">Great art can come from anywhere.</h2>
          <p className="mt-4 max-w-lg text-white/60">We rotate lower-exposure artists into this slot using fit, availability, and freshness—not follower counts.</p>
          {featured && <Link href={`/artists/${featured.id}`} className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Meet @{featured.username}</Link>}
        </div>
      </div>
    </section>
  );
}

export function FilteredDiscoverResults({ artworks, artists, filters }: { artworks: Artwork[]; artists: Artist[]; filters: DiscoveryFilters }) {
  const heading = filters.styles[0] ?? (filters.maxBudget === 50 ? "Art under $50" : filters.q ? `Results for “${filters.q}”` : "Recommended for you");
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">{hasActiveFilters(filters) ? "Filtered" : "Made with intention"}</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">{heading}</h2></div><span className="text-sm text-black/45">{artworks.length} pieces</span></div>
      <ArtworkMasonry artworks={artworks} artists={artists} filters={filters} />
    </section>
  );
}
