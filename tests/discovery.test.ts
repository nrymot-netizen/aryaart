import { describe, expect, it } from "vitest";
import { artists, artworks, services } from "@/data/mock-data";
import {
  describeFilterConstraints,
  discoverSomeoneNew,
  emptyDiscoveryFilters,
  filterArtworks,
  parseDiscoverySearchParams,
  rankDiscoveryCandidates,
  scoreArtwork,
  serializeDiscoverySearchParams,
} from "@/lib/domain/discovery";

describe("discovery search and filters", () => {
  it("matches title, artist, style, subject, and tags", () => {
    const filters = { ...emptyDiscoveryFilters(), q: "moon garden" };
    expect(filterArtworks(artworks, artists, services, filters).some((item) => item.id === "moon-garden")).toBe(true);
    expect(filterArtworks(artworks, artists, services, { ...emptyDiscoveryFilters(), q: "LunaLines" }).every((item) => item.artistId === "luna")).toBe(true);
    expect(filterArtworks(artworks, artists, services, { ...emptyDiscoveryFilters(), q: "pixel" }).length).toBeGreaterThan(0);
    expect(filterArtworks(artworks, artists, services, { ...emptyDiscoveryFilters(), q: "pet" }).length).toBeGreaterThan(0);
  });

  it("combines style and budget filters and can be cleared", () => {
    const filtered = filterArtworks(artworks, artists, services, { ...emptyDiscoveryFilters(), styles: ["Cute"], maxBudget: 50 });
    expect(filtered.every((item) => item.style === "Cute" && item.price <= 50)).toBe(true);
    expect(filterArtworks(artworks, artists, services, emptyDiscoveryFilters()).length).toBe(artworks.length);
  });

  it("explains empty-state constraints", () => {
    expect(describeFilterConstraints({ ...emptyDiscoveryFilters(), q: "unicorn", styles: ["Gothic"], maxBudget: 12 })).toContain("Gothic");
  });

  it("round-trips combined search state through the URL", () => {
    const filters = { ...emptyDiscoveryFilters(), q: "portrait", styles: ["Anime" as const], subjects: ["character" as const], maxBudget: 50, emerging: true };
    const parsed = parseDiscoverySearchParams(Object.fromEntries(new URLSearchParams(serializeDiscoverySearchParams(filters))));
    expect(parsed.q).toBe("portrait");
    expect(parsed.styles).toEqual(["Anime"]);
    expect(parsed.maxBudget).toBe(50);
    expect(parsed.emerging).toBe(true);
  });
});

describe("fair discovery ranking", () => {
  it("does not change rank when likes change", () => {
    const original = rankDiscoveryCandidates(artworks, artists).map((item) => item.id);
    const inflated = artworks.map((item) => ({ ...item, likes: 99_999 }));
    expect(rankDiscoveryCandidates(inflated, artists).map((item) => item.id)).toEqual(original);
  });

  it("boosts emerging artists without using a follower count", () => {
    const luna = artists.find((artist) => artist.id === "luna")!;
    const maya = artists.find((artist) => artist.id === "maya")!;
    const lunaArt = artworks.find((item) => item.artistId === "luna")!;
    const mayaArt = { ...artworks.find((item) => item.artistId === "maya")!, publishedAt: lunaArt.publishedAt, isNew: lunaArt.isNew };
    expect(scoreArtwork(mayaArt, maya)).toBeGreaterThan(scoreArtwork({ ...lunaArt, isNew: mayaArt.isNew }, { ...luna, availability: maya.availability }));
  });

  it("surfaces lower-exposure artists in Discover Someone New", () => {
    const rotated = discoverSomeoneNew(artists, 0);
    expect(rotated[0].exposureRank).toBe(Math.max(...artists.map((artist) => artist.exposureRank)));
    expect(rotated.map((artist) => artist.id)).not.toEqual(artists.map((artist) => artist.id));
  });
});
