import { describe, expect, it } from "vitest";
import { ARYA_CANVAS_TOOL } from "@/lib/domain/canvas";
import { buildProcessLog } from "@/lib/domain/process-log";
import { createPublisherHandle, isPublisherHandle, normalizePublishArtistId, shouldSharePublish } from "@/lib/published/artist";
import { memoryPublishedStore, resetMemoryPublishedStore } from "@/lib/published/memory";
import { publishRequestSchema } from "@/lib/published/schema";
import type { Artwork, DrawBackPair } from "@/types";

const artwork: Artwork = {
  id: "art-shared-lantern-1",
  artistId: "ink-tester1",
  title: "Shared lantern",
  description: "Drawn on Arya.",
  image: "data:image/jpeg;base64,aaaaaaaaaaaaaaaa",
  style: "Anime",
  subject: "character",
  tags: ["lantern"],
  tools: [ARYA_CANVAS_TOOL],
  aiDisclosure: false,
  visibility: "public",
  publishedAt: "2026-11-01",
  price: 40,
  likes: 0,
  format: "digital",
};

const processLog = buildProcessLog(
  artwork.id,
  "artwork",
  [{ type: "fill", x: 12, y: 20, color: "#17151b", layerId: "layer-1" }],
  { paperColor: "#fffdf8", width: 720, height: 900 },
  "2026-11-01T18:00:00.000Z",
  "plog-shared-1",
);

const pair: DrawBackPair = {
  id: "dback-shared-1",
  sourceArtworkId: "lantern-study",
  replyArtworkId: artwork.id,
  publishedAt: "2026-11-01T18:00:00.000Z",
};

describe("publisher handles", () => {
  it("creates a shareable ink handle", () => {
    const handle = createPublisherHandle();
    expect(isPublisherHandle(handle)).toBe(true);
  });

  it("only shares visitor drawings", () => {
    expect(shouldSharePublish("you")).toBe(true);
    expect(shouldSharePublish("ink-tester1")).toBe(true);
    expect(shouldSharePublish("luna")).toBe(false);
    expect(normalizePublishArtistId("you", "ink-tester1")).toBe("ink-tester1");
    expect(normalizePublishArtistId("luna", "ink-tester1")).toBe("luna");
  });
});

describe("publish schema", () => {
  it("accepts a visitor drawing with a sampled log", () => {
    const parsed = publishRequestSchema.safeParse({ handle: "ink-tester1", artwork, processLog, pair });
    expect(parsed.success).toBe(true);
  });

  it("rejects likes and over-long art ids", () => {
    expect(publishRequestSchema.safeParse({ handle: "ink-tester1", artwork: { ...artwork, likes: 4 }, processLog, pair: null }).success).toBe(false);
    expect(publishRequestSchema.safeParse({ handle: "ink-tester1", artwork: { ...artwork, id: "moon-garden" }, processLog: null, pair: null }).success).toBe(false);
  });
});

describe("memory published store", () => {
  it("lists and reloads a shared drawing", async () => {
    resetMemoryPublishedStore("test");
    const store = memoryPublishedStore("test");
    const source = { ...artwork, id: "art-shared-source-1", title: "Source lantern" };
    const sourceLog = buildProcessLog(
      source.id,
      "artwork",
      [{ type: "fill", x: 8, y: 10, color: "#1c1922", layerId: "layer-1" }],
      { paperColor: "#fffdf8", width: 720, height: 900 },
      "2026-11-01T17:00:00.000Z",
      "plog-shared-source",
    );
    await store.publish({ handle: "ink-tester1", artwork: source, processLog: sourceLog, pair: null });
    await store.publish({ handle: "ink-tester1", artwork, processLog, pair: { ...pair, sourceArtworkId: source.id } });
    const catalog = await store.list();
    expect(catalog.artworks[0]?.id).toBe(artwork.id);
    expect(catalog.processLogs.some((item) => item.subjectId === artwork.id)).toBe(true);
    expect(catalog.pairs[0]?.id).toBe(pair.id);
    const loaded = await store.getArtwork(artwork.id);
    expect(loaded?.artwork.title).toBe("Shared lantern");
    const loadedPair = await store.getPair(pair.id);
    expect(loadedPair?.reply.artwork.id).toBe(artwork.id);
    expect(loadedPair?.source.artwork.id).toBe(source.id);
  });
});
