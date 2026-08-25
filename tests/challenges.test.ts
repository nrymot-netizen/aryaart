import { describe, expect, it } from "vitest";
import { ARYA_CANVAS_TOOL } from "@/lib/domain/canvas";
import { canEnterChallenge, eligibleChallengeEntries, rankChallengeEntries } from "@/lib/domain/challenges";
import { createDemoState } from "@/features/demo/demo-state";
import { reduceDemoState, type ReduceContext } from "@/features/demo/demo-reducer";
import { ACTIVE_CHALLENGE_ID, getActiveChallenge, seedLanternChallengeEntry, seedPaperLanternArtwork, seedPaperLanternChallengeEntry } from "@/data/seed-challenges";
import { seedLanternArtwork } from "@/data/seed-lantern";
import type { Artwork } from "@/types";

const luna: ReduceContext = { now: "2026-08-25T18:00:00Z", id: (prefix) => `${prefix}-1`, actorId: "luna", role: "artist", artistId: "luna", accountType: "adult" };

function artwork(id: string, extras: Partial<Artwork> = {}): Artwork {
  return {
    id,
    artistId: "luna",
    title: "Night lantern",
    description: "Drawn on Arya.",
    image: "data:image/jpeg;base64,aaaa",
    style: "Anime",
    subject: "character",
    tags: ["lantern"],
    tools: [ARYA_CANVAS_TOOL],
    aiDisclosure: false,
    visibility: "public",
    publishedAt: "2026-08-25",
    price: 40,
    likes: 0,
    format: "digital",
    ...extras,
  };
}

describe("human-only challenges", () => {
  it("ranks entries by saves, not likes or follower-style exposure", () => {
    const ranked = rankChallengeEntries(
      [seedPaperLanternChallengeEntry, seedLanternChallengeEntry],
      [],
    );
    expect(ranked.map((item) => item.artworkId)).toEqual(["lantern-study", "paper-lantern"]);
    expect(seedPaperLanternArtwork.likes).toBeGreaterThan(seedLanternArtwork.likes);
    const afterSave = rankChallengeEntries(
      [seedPaperLanternChallengeEntry, seedLanternChallengeEntry],
      ["paper-lantern", "lantern-study"],
    );
    expect(afterSave[0]?.artworkId).toBe("lantern-study");
  });

  it("lets a live save reorder the grid when seed counts are close", () => {
    const close = [
      { ...seedLanternChallengeEntry, seedSaves: 10 },
      { ...seedPaperLanternChallengeEntry, seedSaves: 10 },
    ];
    expect(rankChallengeEntries(close, ["paper-lantern"])[0]?.artworkId).toBe("paper-lantern");
  });

  it("rejects uploads and empty logs from a challenge", () => {
    const challenge = getActiveChallenge();
    expect(canEnterChallenge(challenge, null, [ARYA_CANVAS_TOOL])).toBe(false);
    expect(canEnterChallenge(challenge, { id: "p", subjectId: "a", subjectKind: "artwork", paperColor: "#fff", width: 720, height: 900, ops: [], recordedAt: "2026-08-25" }, [ARYA_CANVAS_TOOL])).toBe(false);
    const published = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      challengeId: ACTIVE_CHALLENGE_ID,
      artwork: artwork("art-upload-challenge", { tools: [ARYA_CANVAS_TOOL], title: "File drop" }),
    }, luna);
    expect(published.state.challengeEntries.some((item) => item.artworkId === "art-upload-challenge")).toBe(false);
    expect(published.href).toBe("/art/art-upload-challenge");
    expect(published.toast).toMatch(/uploads cannot enter/i);
  });

  it("enters the grid for Arya-canvas work with a process log", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      challengeId: ACTIVE_CHALLENGE_ID,
      processOps: [{ type: "fill", x: 40, y: 80, color: "#e0a51a", layerId: "layer-1" }],
      paperColor: "#1c1922",
      artwork: artwork("art-challenge-demo"),
    }, luna);
    expect(result.state.challengeEntries[0]?.artworkId).toBe("art-challenge-demo");
    expect(result.state.processLogs.find((item) => item.subjectId === "art-challenge-demo")?.challengeId).toBe(ACTIVE_CHALLENGE_ID);
    expect(result.state.events.some((event) => event.name === "challenge_entered")).toBe(true);
    expect(result.href).toBe(`/challenges/${ACTIVE_CHALLENGE_ID}`);
    expect(eligibleChallengeEntries(result.state.challengeEntries, ACTIVE_CHALLENGE_ID, result.state.createdArtworks, result.state.processLogs).some((item) => item.artworkId === "art-challenge-demo")).toBe(true);
  });

  it("does not enter a challenge when publishing without a brief id", () => {
    const before = createDemoState().challengeEntries.length;
    const result = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      processOps: [{ type: "fill", x: 12, y: 20, color: "#17151b", layerId: "layer-1" }],
      artwork: artwork("art-no-challenge"),
    }, luna);
    expect(result.state.challengeEntries.length).toBe(before);
    expect(result.state.challengeEntries.some((item) => item.artworkId === "art-no-challenge")).toBe(false);
  });

  it("hides an entry that is not bound to the brief", () => {
    const state = createDemoState();
    const unbound = { ...seedLanternChallengeEntry, id: "centry-fake", artworkId: "moon-garden" };
    expect(eligibleChallengeEntries([...state.challengeEntries, unbound], ACTIVE_CHALLENGE_ID, state.createdArtworks, state.processLogs).some((item) => item.artworkId === "moon-garden")).toBe(false);
  });
});
