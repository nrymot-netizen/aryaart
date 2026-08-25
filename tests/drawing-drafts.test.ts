import { describe, expect, it } from "vitest";
import { createDemoState, parseDemoState } from "@/features/demo/demo-state";
import { reduceDemoState, type ReduceContext } from "@/features/demo/demo-reducer";
import {
  DRAWING_DRAFT_MAX,
  capDrawingDraft,
  createDraftId,
  drawingDraftFor,
  layersHaveBitmaps,
  upsertDrawingDraft,
} from "@/lib/domain/drawing-drafts";
import type { DrawingDraft } from "@/types";

const luna: ReduceContext = {
  now: "2026-08-25T18:00:00Z",
  id: (prefix) => `${prefix}-1`,
  actorId: "luna",
  role: "artist",
  artistId: "luna",
  accountType: "adult",
};

function draft(id: string, extra?: Partial<DrawingDraft>): DrawingDraft {
  return {
    id,
    paperColor: "#fffdf8",
    activeLayerId: "layer-1",
    composite: "data:image/jpeg;base64,aaa",
    updatedAt: luna.now,
    layers: [{ id: "layer-1", name: "Layer 1", visible: true, opacity: 1, locked: false, dataUrl: "data:image/png;base64,bbb" }],
    ...extra,
  };
}

describe("drawing drafts", () => {
  it("keeps layer bitmaps when the draft fits the size cap", () => {
    const kept = capDrawingDraft(draft("draft-create-luna"));
    expect(layersHaveBitmaps(kept.layers)).toBe(true);
    expect(kept.layers[0]?.dataUrl).toBeTruthy();
  });

  it("drops per-layer bitmaps when the draft is over budget and keeps the composite", () => {
    const oversized = draft("draft-create-luna", {
      composite: `data:image/jpeg;base64,${"A".repeat(1_100_000)}`,
    });
    const capped = capDrawingDraft(oversized);
    expect(capped.composite.startsWith("data:image/jpeg")).toBe(true);
    expect(layersHaveBitmaps(capped.layers)).toBe(false);
    expect(capped.layers[0]).toMatchObject({ id: "layer-1", name: "Layer 1" });
  });

  it("upserts the newest draft first and keeps at most three", () => {
    const drafts = ["a", "b", "c", "d"].reduce(
      (current, id) => upsertDrawingDraft(current, draft(`draft-${id}`)),
      [] as DrawingDraft[],
    );
    expect(drafts).toHaveLength(DRAWING_DRAFT_MAX);
    expect(drafts.map((item) => item.id)).toEqual(["draft-d", "draft-c", "draft-b"]);
    expect(drawingDraftFor(drafts, "draft-a")).toBeUndefined();
  });

  it("replaces an existing draft id instead of duplicating it", () => {
    const first = upsertDrawingDraft([], draft("draft-create-luna", { paperColor: "#111111" }));
    const next = upsertDrawingDraft(first, draft("draft-create-luna", { paperColor: "#eeeeee" }));
    expect(next).toHaveLength(1);
    expect(next[0]?.paperColor).toBe("#eeeeee");
  });

  it("saves and clears drafts through the reducer without a toast", () => {
    const id = createDraftId("create", "luna");
    const saved = reduceDemoState(createDemoState("luna"), { type: "save-drawing-draft", draft: draft(id) }, luna);
    expect(saved.toast).toBeUndefined();
    expect(drawingDraftFor(saved.state.drawingDrafts, id)?.composite).toBe("data:image/jpeg;base64,aaa");
    const cleared = reduceDemoState(saved.state, { type: "clear-drawing-draft", id }, luna);
    expect(cleared.toast).toBeUndefined();
    expect(drawingDraftFor(cleared.state.drawingDrafts, id)).toBeUndefined();
  });

  it("hydrates drawing drafts from a persisted snapshot", () => {
    const state = createDemoState("luna");
    state.drawingDrafts = [draft("draft-create-luna")];
    const parsed = parseDemoState(JSON.stringify(state));
    expect(drawingDraftFor(parsed.drawingDrafts, "draft-create-luna")?.activeLayerId).toBe("layer-1");
  });

  it("defaults missing drawing drafts on older v2 snapshots", () => {
    const older = createDemoState("luna");
    const raw = JSON.parse(JSON.stringify(older)) as { drawingDrafts?: DrawingDraft[] };
    delete raw.drawingDrafts;
    expect(parseDemoState(JSON.stringify(raw)).drawingDrafts).toEqual([]);
  });
});
