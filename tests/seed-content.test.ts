import { describe, expect, it } from "vitest";
import { artists, artworks, posts, reviews, services } from "@/data/mock-data";

describe("seeded catalog volume", () => {
  it("gives every required artist at least 6 portfolio pieces, 3 posts, 2 services, and reviews", () => {
    for (const artist of artists) {
      expect(artworks.filter((item) => item.artistId === artist.id).length, artist.username).toBeGreaterThanOrEqual(6);
      expect(posts.filter((item) => item.artistId === artist.id).length, artist.username).toBeGreaterThanOrEqual(3);
      expect(services.filter((item) => item.artistId === artist.id).length, artist.username).toBeGreaterThanOrEqual(2);
      expect(reviews.filter((item) => item.artistId === artist.id).length, artist.username).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not store follower counts on artists", () => {
    for (const artist of artists) {
      expect(artist).not.toHaveProperty("followers");
      expect(artist).not.toHaveProperty("followerCount");
    }
  });
});
