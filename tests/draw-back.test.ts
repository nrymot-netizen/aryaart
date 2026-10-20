import { describe, expect, it } from "vitest";
import { ARYA_CANVAS_TOOL } from "@/lib/domain/canvas";
import { canDrawBack, canPublishDrawBack, publicDrawBacks } from "@/lib/domain/draw-back";
import { processLogFor } from "@/lib/domain/process-log";
import { createDemoState, parseDemoState } from "@/features/demo/demo-state";
import { reduceDemoState, type ReduceContext } from "@/features/demo/demo-reducer";
import { seedLanternArtwork } from "@/data/seed-lantern";
import { seedPaperLanternArtwork } from "@/data/seed-challenges";
import type { Artwork } from "@/types";

const luna: ReduceContext = { now: "2026-08-26T18:00:00Z", id: (prefix) => `${prefix}-1`, actorId: "luna", role: "artist", artistId: "luna", accountType: "adult" };

function artwork(id: string, extras: Partial<Artwork> = {}): Artwork {
  return {
    id,
    artistId: "luna",
    title: "Reply lantern",
    description: "Drawn on Arya.",
    image: "data:image/jpeg;base64,aaaa",
    style: "Anime",
    subject: "character",
    tags: ["lantern"],
    tools: [ARYA_CANVAS_TOOL],
    aiDisclosure: false,
    visibility: "public",
    publishedAt: "2026-08-26",
    price: 40,
    likes: 0,
    format: "digital",
    ...extras,
  };
}

describe("draw-back pairs", () => {
  it("only allows a public Arya replay as a source", () => {
    const state = createDemoState();
    const lanternLog = processLogFor(state.processLogs, seedLanternArtwork.id);
    expect(canDrawBack(seedLanternArtwork, lanternLog)).toBe(true);
    expect(canDrawBack({ ...seedLanternArtwork, visibility: "unlisted" }, lanternLog)).toBe(false);
    expect(canDrawBack(artwork("upload-only", { tools: ["Uploaded file"] }), null)).toBe(false);
  });

  it("refuses an upload as the reply", () => {
    const state = createDemoState();
    const sourceLog = processLogFor(state.processLogs, seedLanternArtwork.id);
    const reply = artwork("art-upload-reply", { tools: ["Uploaded file"] });
    expect(canPublishDrawBack(seedLanternArtwork, sourceLog, reply, null)).toBe(false);
  });

  it("publishes a pair when the reply was drawn on Arya", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      replyToArtworkId: seedLanternArtwork.id,
      processOps: [{ type: "fill", x: 40, y: 80, color: "#e0a51a", layerId: "layer-1" }],
      paperColor: "#1c1922",
      artwork: artwork("art-draw-back"),
    }, luna);
    expect(result.error).toBeUndefined();
    expect(result.state.drawBacks[0]).toMatchObject({
      sourceArtworkId: seedLanternArtwork.id,
      replyArtworkId: "art-draw-back",
    });
    expect(result.href).toBe("/draw-back/dback-1");
    expect(result.state.events.some((event) => event.name === "draw_back_published")).toBe(true);
    expect(publicDrawBacks(result.state.drawBacks, result.state.createdArtworks, result.state.processLogs).some((item) => item.replyArtworkId === "art-draw-back")).toBe(true);
  });

  it("does not create a pair for an upload reply", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      replyToArtworkId: seedLanternArtwork.id,
      artwork: artwork("art-upload-back", { tools: ["Uploaded file"] }),
    }, luna);
    expect(result.error).toMatch(/uploads cannot enter/i);
    expect(result.state.createdArtworks.some((item) => item.id === "art-upload-back")).toBe(false);
    expect(result.state.drawBacks.some((item) => item.replyArtworkId === "art-upload-back")).toBe(false);
  });

  it("does not attach a pair when the source has no replay", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      replyToArtworkId: "moon-garden",
      processOps: [{ type: "fill", x: 12, y: 20, color: "#17151b", layerId: "layer-1" }],
      artwork: artwork("art-orphan-back"),
    }, luna);
    expect(result.error).toMatch(/cannot be drawn back/i);
    expect(result.state.createdArtworks.some((item) => item.id === "art-orphan-back")).toBe(false);
  });

  it("keeps the seeded lantern pair public", () => {
    const state = createDemoState();
    expect(state.drawBacks.some((item) => item.id === "dback-lantern-paper")).toBe(true);
    expect(publicDrawBacks(state.drawBacks, state.createdArtworks, state.processLogs).some((item) => item.replyArtworkId === seedPaperLanternArtwork.id)).toBe(true);
  });

  it("hydrates the seeded pair onto older v2 snapshots", () => {
    const older = createDemoState("buyer-alex");
    older.drawBacks = [];
    const parsed = parseDemoState(JSON.stringify(older));
    expect(parsed.drawBacks.some((item) => item.id === "dback-lantern-paper")).toBe(true);
  });
});
