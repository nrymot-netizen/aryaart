import { describe, expect, it } from "vitest";
import { createDemoState, parseDemoState, toggleSavedId } from "@/features/demo/demo-state";

describe("demo persistence helpers", () => {
  it("toggles saved artwork and artist ids", () => {
    expect(toggleSavedId([], "moon-garden")).toEqual(["moon-garden"]);
    expect(toggleSavedId(["moon-garden"], "moon-garden")).toEqual([]);
  });

  it("restores a valid persisted demo snapshot", () => {
    const state = createDemoState("buyer-alex");
    state.savedArtworkIds = ["moon-garden"];
    const parsed = parseDemoState(JSON.stringify(state));
    expect(parsed.savedArtworkIds).toEqual(["moon-garden"]);
    expect(parsed.waitlists.length).toBeGreaterThan(0);
    expect(Array.isArray(parsed.processLogs)).toBe(true);
  });

  it("falls back when the snapshot is corrupt", () => {
    expect(parseDemoState("{not json", "luna").personaId).toBe("luna");
  });

  it("adds the seeded lantern to older v2 snapshots that lack it", () => {
    const older = createDemoState("buyer-alex");
    older.createdArtworks = [];
    older.createdPosts = [];
    older.processLogs = [];
    older.challengeEntries = [];
    const parsed = parseDemoState(JSON.stringify(older));
    expect(parsed.createdArtworks.some((item) => item.id === "lantern-study")).toBe(true);
    expect(parsed.createdArtworks.some((item) => item.id === "paper-lantern")).toBe(true);
    expect(parsed.createdPosts.some((item) => item.id === "post-lantern-study")).toBe(true);
    expect(parsed.processLogs.some((item) => item.id === "plog-lantern-study")).toBe(true);
    expect(parsed.challengeEntries.some((item) => item.id === "centry-lantern-study")).toBe(true);
    expect(parsed.files.some((item) => item.id === "file-luna-first-sketch")).toBe(true);
    expect(parsed.files.some((item) => item.id === "file-luna-first-final")).toBe(true);
    expect(parsed.processLogs.some((item) => item.id === "plog-file-luna-first-final")).toBe(true);
    expect(Array.isArray(parsed.processStories)).toBe(true);
    expect(parsed.drawBacks.some((item) => item.id === "dback-lantern-paper")).toBe(true);
  });
});
