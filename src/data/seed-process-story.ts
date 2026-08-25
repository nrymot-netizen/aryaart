import type { DemoFile } from "@/types";
import type { ProcessLog } from "@/lib/domain/process-log";

export const seedLunaSketchFile: DemoFile = {
  id: "file-luna-first-sketch",
  orderId: "order-luna-first-paid",
  name: "garden-sketch.svg",
  type: "image/svg+xml",
  size: 16000,
  kind: "sketch",
  preview: "/art/lunar-vow.svg",
  source: "arya-canvas",
  createdAt: "2026-06-10T15:00:00Z",
};

export const seedLunaFinalFile: DemoFile = {
  id: "file-luna-first-final",
  orderId: "order-luna-first-paid",
  name: "garden-final.svg",
  type: "image/svg+xml",
  size: 22000,
  kind: "final",
  preview: "/art/moon-garden.svg",
  source: "arya-canvas",
  createdAt: "2026-06-17T16:00:00Z",
};

export const seedLunaFinalLog: ProcessLog = {
  id: "plog-file-luna-first-final",
  subjectId: "file-luna-first-final",
  subjectKind: "order-file",
  paperColor: "#1c1922",
  width: 720,
  height: 900,
  recordedAt: "2026-06-17T16:00:00Z",
  ops: [
    { type: "stroke", stroke: { tool: "ink", color: "#c7b4ff", size: 18, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 180, y: 720, p: 0.7 }, { x: 240, y: 640, p: 0.7 }, { x: 320, y: 520, p: 0.7 }, { x: 400, y: 400, p: 0.7 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 12, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 360, y: 280, p: 0.7 }, { x: 390, y: 240, p: 0.7 }, { x: 420, y: 210, p: 0.7 }] } },
    { type: "fill", x: 360, y: 360, color: "#3d2a58", layerId: "layer-1" },
  ],
};
