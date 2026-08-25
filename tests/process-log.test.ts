import { describe, expect, it } from "vitest";
import { ARYA_CANVAS_TOOL } from "@/lib/domain/canvas";
import { firstPaidPiece } from "@/lib/domain/identity";
import {
  PROCESS_LOG_MAX_CHARS,
  PROCESS_LOG_MAX_OPS,
  REPLAY_MAX_MS,
  REPLAY_MIN_MS,
  buildProcessLog,
  humanMadeFromStrokes,
  processLogChars,
  replayDurationMs,
  sampleProcessLog,
} from "@/lib/domain/process-log";
import { createDemoState } from "@/features/demo/demo-state";
import type { CanvasOp } from "@/lib/domain/canvas";

function stroke(points: number): CanvasOp {
  return {
    type: "stroke",
    stroke: {
      tool: "ink",
      color: "#17151b",
      size: 10,
      opacity: 1,
      hardness: 1,
      symmetry: false,
      layerId: "layer-1",
      points: Array.from({ length: points }, (_, index) => ({ x: index, y: index, p: 0.8 })),
    },
  };
}

describe("process log and human-made proof", () => {
  it("cannot claim human-made-from-strokes without a non-empty log", () => {
    expect(humanMadeFromStrokes({ tools: [ARYA_CANVAS_TOOL], processLog: null })).toBe(false);
    expect(humanMadeFromStrokes({
      tools: [ARYA_CANVAS_TOOL],
      processLog: { id: "p", subjectId: "a", subjectKind: "artwork", paperColor: "#fff", width: 720, height: 900, ops: [], recordedAt: "2026-08-25" },
    })).toBe(false);
  });

  it("allows human-made only for Arya canvas work with strokes or fills", () => {
    const log = buildProcessLog("art-1", "artwork", [stroke(8)], { paperColor: "#fffdf8" }, "2026-08-25T12:00:00Z", "plog-1");
    expect(log?.ops.length).toBeGreaterThan(0);
    expect(humanMadeFromStrokes({ tools: [ARYA_CANVAS_TOOL], processLog: log })).toBe(true);
    expect(humanMadeFromStrokes({ tools: ["Procreate"], processLog: log })).toBe(false);
  });

  it("samples a huge drawing down under the documented size cap", () => {
    const ops = Array.from({ length: 200 }, (_, index) => stroke(80 + (index % 20)));
    const sampled = sampleProcessLog(ops, { paperColor: "#fffdf8", width: 720, height: 900 });
    expect(sampled.length).toBeLessThanOrEqual(PROCESS_LOG_MAX_OPS);
    expect(processLogChars(sampled, { paperColor: "#fffdf8", width: 720, height: 900 })).toBeLessThanOrEqual(PROCESS_LOG_MAX_CHARS);
  });

  it("keeps replay duration inside 8–15 seconds when there is a log", () => {
    const duration = replayDurationMs([stroke(12), stroke(20), { type: "fill", x: 10, y: 10, color: "#6941c6", layerId: "layer-1" }]);
    expect(duration).toBeGreaterThanOrEqual(REPLAY_MIN_MS);
    expect(duration).toBeLessThanOrEqual(REPLAY_MAX_MS);
    expect(replayDurationMs([])).toBe(0);
  });

  it("derives first paid piece from the earliest completed order", () => {
    const order = firstPaidPiece(createDemoState().orders, "luna");
    expect(order?.id).toBe("order-luna-first-paid");
    expect(firstPaidPiece(createDemoState().orders, "maya")).toBeNull();
  });

  it("seeds a lantern with a real process log so replay is not fake", () => {
    const state = createDemoState();
    expect(state.createdArtworks[0]?.id).toBe("lantern-study");
    expect(state.processLogs[0]?.ops.length).toBeGreaterThan(0);
  });
});
