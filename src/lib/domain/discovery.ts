import type { Artist, Artwork, ArtworkStyle, ArtworkSubject, Availability, CommissionService, DiscoveryFilters, IntendedUse, ArtworkFormat } from "@/types";

const styleValues: ArtworkStyle[] = ["Anime", "Cartoon", "Realism", "Semi-realism", "Pixel art", "Watercolor", "Manga", "Comic", "Fantasy", "Minimalist", "Cute", "Gothic"];
const subjectValues: ArtworkSubject[] = ["character", "portrait", "pet", "landscape", "environment", "fan art", "original character", "emote/avatar"];
const availabilityValues: Availability[] = ["open", "limited", "waitlist", "closed"];

export const emptyDiscoveryFilters = (): DiscoveryFilters => ({
  q: "",
  styles: [],
  subjects: [],
  availability: [],
});

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : value.split(",")).map((item) => item.trim()).filter(Boolean);
}

function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export function parseDiscoverySearchParams(params: Record<string, string | string[] | undefined>): DiscoveryFilters {
  const styles = asArray(params.style).filter((item): item is ArtworkStyle => styleValues.includes(item as ArtworkStyle));
  const subjects = asArray(params.subject).filter((item): item is ArtworkSubject => subjectValues.includes(item as ArtworkSubject));
  const availability = asArray(params.availability).filter((item): item is Availability => availabilityValues.includes(item as Availability));
  const budget = Number(Array.isArray(params.budget) ? params.budget[0] : params.budget);
  const turnaround = Number(Array.isArray(params.turnaround) ? params.turnaround[0] : params.turnaround);
  const usage = pick(Array.isArray(params.usage) ? params.usage[0] : params.usage, ["personal", "commercial"] as const);
  const format = pick(Array.isArray(params.format) ? params.format[0] : params.format, ["digital", "physical"] as const);
  const emergingRaw = Array.isArray(params.emerging) ? params.emerging[0] : params.emerging;

  return {
    q: (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "",
    styles,
    subjects,
    maxBudget: Number.isFinite(budget) && budget > 0 ? budget : undefined,
    availability,
    maxTurnaroundDays: Number.isFinite(turnaround) && turnaround > 0 ? turnaround : undefined,
    usage,
    format,
    emerging: emergingRaw === "1" || emergingRaw === "true",
  };
}

export function serializeDiscoverySearchParams(filters: DiscoveryFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const style of filters.styles) params.append("style", style);
  for (const subject of filters.subjects) params.append("subject", subject);
  if (filters.maxBudget) params.set("budget", String(filters.maxBudget));
  for (const availability of filters.availability) params.append("availability", availability);
  if (filters.maxTurnaroundDays) params.set("turnaround", String(filters.maxTurnaroundDays));
  if (filters.usage) params.set("usage", filters.usage);
  if (filters.format) params.set("format", filters.format);
  if (filters.emerging) params.set("emerging", "1");
  return params.toString();
}

export function hasActiveFilters(filters: DiscoveryFilters): boolean {
  return Boolean(
    filters.q ||
    filters.styles.length ||
    filters.subjects.length ||
    filters.maxBudget ||
    filters.availability.length ||
    filters.maxTurnaroundDays ||
    filters.usage ||
    filters.format ||
    filters.emerging,
  );
}

export function describeFilterConstraints(filters: DiscoveryFilters): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`“${filters.q}”`);
  if (filters.styles.length) parts.push(filters.styles.join(", "));
  if (filters.subjects.length) parts.push(filters.subjects.join(", "));
  if (filters.maxBudget) parts.push(`under $${filters.maxBudget}`);
  if (filters.availability.length) parts.push(filters.availability.join(", "));
  if (filters.maxTurnaroundDays) parts.push(`within ${filters.maxTurnaroundDays} days`);
  if (filters.usage) parts.push(`${filters.usage} use`);
  if (filters.format) parts.push(filters.format);
  if (filters.emerging) parts.push("emerging artists");
  if (!parts.length) return "Try a different search or style.";
  return `No artwork matches ${parts.join(" + ")}. Clear a filter to widen the results.`;
}

function artistById(artists: Artist[], id: string) {
  return artists.find((artist) => artist.id === id);
}

function matchesQuery(artwork: Artwork, artist: Artist, query: string): boolean {
  if (!query) return true;
  const haystack = [artwork.title, artwork.description, artwork.style, artwork.subject, artwork.tags.join(" "), artist.username, artist.displayName, artist.specialty].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function artworkMatchesFilters(
  artwork: Artwork,
  artist: Artist,
  filters: DiscoveryFilters,
  services: CommissionService[],
): boolean {
  if (artwork.visibility !== "public") return false;
  if (!matchesQuery(artwork, artist, filters.q)) return false;
  if (filters.styles.length && !filters.styles.includes(artwork.style)) return false;
  if (filters.subjects.length && !filters.subjects.includes(artwork.subject)) return false;
  if (filters.maxBudget && artwork.price > filters.maxBudget) return false;
  if (filters.availability.length && !filters.availability.includes(artist.availability)) return false;
  if (filters.format && artwork.format !== filters.format) return false;
  if (filters.emerging && !artist.emerging) return false;
  if (filters.usage) {
    const artistServices = services.filter((service) => service.artistId === artist.id);
    if (!artistServices.some((service) => service.usageOptions.includes(filters.usage as IntendedUse))) return false;
  }
  if (filters.maxTurnaroundDays) {
    const fastest = Math.min(...services.filter((service) => service.artistId === artist.id).map((service) => service.turnaroundDays), Number.POSITIVE_INFINITY);
    if (!Number.isFinite(fastest) || fastest > filters.maxTurnaroundDays) return false;
  }
  return true;
}

export function filterArtworks(artworks: Artwork[], artists: Artist[], services: CommissionService[], filters: DiscoveryFilters): Artwork[] {
  return artworks.filter((artwork) => {
    const artist = artistById(artists, artwork.artistId);
    return artist ? artworkMatchesFilters(artwork, artist, filters, services) : false;
  });
}

function daysSince(isoDate: string, now = new Date("2026-08-17T12:00:00Z")): number {
  return Math.max(0, (now.getTime() - new Date(`${isoDate}T00:00:00Z`).getTime()) / 86_400_000);
}

export function scoreArtwork(artwork: Artwork, artist: Artist): number {
  let score = 0;
  if (artist.availability === "open") score += 4;
  else if (artist.availability === "limited") score += 3;
  else if (artist.availability === "waitlist") score += 1;
  if (artwork.isNew) score += 2;
  score += Math.max(0, 21 - daysSince(artwork.publishedAt)) * 0.08;
  if (artist.emerging) score += 2.5;
  score += artist.exposureRank * 0.15;
  return score;
}

export function rankDiscoveryCandidates(artworks: Artwork[], artists: Artist[]): Artwork[] {
  const byId = new Map(artists.map((artist) => [artist.id, artist]));
  return [...artworks].sort((a, b) => {
    const artistA = byId.get(a.artistId);
    const artistB = byId.get(b.artistId);
    if (!artistA || !artistB) return 0;
    const delta = scoreArtwork(b, artistB) - scoreArtwork(a, artistA);
    if (delta !== 0) return delta;
    return a.title.localeCompare(b.title);
  });
}

export function artistsAcceptingCommissions(artists: Artist[]): Artist[] {
  return artists.filter((artist) => artist.availability !== "closed");
}

export function emergingArtists(artists: Artist[]): Artist[] {
  return [...artists].filter((artist) => artist.emerging).sort((a, b) => b.exposureRank - a.exposureRank);
}

export function discoverSomeoneNew(artists: Artist[], seed = 17): Artist[] {
  const ranked = [...artists].sort((a, b) => b.exposureRank - a.exposureRank || a.username.localeCompare(b.username));
  const offset = seed % Math.max(ranked.length, 1);
  return [...ranked.slice(offset), ...ranked.slice(0, offset)];
}

export function trendingStyles(artworks: Artwork[]): ArtworkStyle[] {
  const counts = new Map<ArtworkStyle, number>();
  for (const artwork of artworks) counts.set(artwork.style, (counts.get(artwork.style) ?? 0) + (artwork.isNew ? 2 : 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([style]) => style);
}

export function newArtwork(artworks: Artwork[]): Artwork[] {
  return [...artworks].filter((artwork) => artwork.isNew || daysSince(artwork.publishedAt) <= 21).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function artUnderBudget(artworks: Artwork[], max = 50): Artwork[] {
  return artworks.filter((artwork) => artwork.price < max);
}

export const STYLE_OPTIONS = styleValues;
export const SUBJECT_OPTIONS = subjectValues;
export const AVAILABILITY_OPTIONS = availabilityValues;
export const USAGE_OPTIONS: IntendedUse[] = ["personal", "commercial"];
export const FORMAT_OPTIONS: ArtworkFormat[] = ["digital", "physical"];
export const BUDGET_BANDS = [50, 100, 200];
export const TURNAROUND_BANDS = [7, 14, 21];
