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
  });

  it("falls back when the snapshot is corrupt", () => {
    expect(parseDemoState("{not json", "luna").personaId).toBe("luna");
  });
});
