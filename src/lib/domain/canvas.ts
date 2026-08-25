import type { DemoFile } from "@/types";

export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 900;
export const CANVAS_JPEG_QUALITY = 0.82;
export const ARYA_CANVAS_TOOL = "Arya Canvas";
export const MIN_BRUSH_SIZE = 2;
export const MAX_BRUSH_SIZE = 128;
export const MAX_LAYERS = 8;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 4;

export type BrushKind = "pencil" | "ink" | "marker" | "airbrush";
export type CanvasTool = BrushKind | "eraser" | "fill" | "eyedropper";
export type CanvasPoint = { x: number; y: number; p: number };
export type CanvasStroke = {
  tool: Extract<CanvasTool, BrushKind | "eraser">;
  color: string;
  size: number;
  opacity: number;
  hardness: number;
  symmetry: boolean;
  layerId: string;
  points: CanvasPoint[];
};
export type CanvasOp =
  | { type: "stroke"; stroke: CanvasStroke }
  | { type: "fill"; x: number; y: number; color: string; layerId: string };

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
}

export const BRUSH_PRESETS: { id: BrushKind; label: string; size: number; hardness: number; opacity: number }[] = [
  { id: "pencil", label: "Pencil", size: 4, hardness: 0.92, opacity: 0.85 },
  { id: "ink", label: "Ink", size: 10, hardness: 1, opacity: 1 },
  { id: "marker", label: "Marker", size: 22, hardness: 0.7, opacity: 0.72 },
  { id: "airbrush", label: "Airbrush", size: 48, hardness: 0.18, opacity: 0.28 },
];

export const BRUSH_COLORS = [
  { label: "Ink", value: "#17151b" },
  { label: "Plum", value: "#6941c6" },
  { label: "Coral", value: "#ee6b5e" },
  { label: "Sky", value: "#3d7ee8" },
  { label: "Leaf", value: "#2f8a5b" },
  { label: "Gold", value: "#e0a51a" },
  { label: "Blush", value: "#e789b0" },
  { label: "Clay", value: "#8b5a2b" },
  { label: "Fog", value: "#8b8794" },
  { label: "White", value: "#ffffff" },
];

export const PAPER_PRESETS = [
  { id: "studio", label: "Studio", value: "#fffdf8" },
  { id: "cream", label: "Cream", value: "#f3ead8" },
  { id: "mist", label: "Mist", value: "#ece7f6" },
  { id: "night", label: "Night", value: "#1c1922" },
] as const;

export const SIZE_PRESETS = [4, 10, 18, 28, 44];

export interface ExportedDrawing {
  dataUrl: string;
  byteLength: number;
  width: number;
  height: number;
  paperColor: string;
  ops?: CanvasOp[];
}

export function isInlineArtworkSrc(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

export function isJpegDataUrl(value: string): boolean {
  return value.startsWith("data:image/jpeg");
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((payload.length * 3) / 4);
}

export function clampBrushSize(size: number): number {
  return Math.min(MAX_BRUSH_SIZE, Math.max(MIN_BRUSH_SIZE, Math.round(size)));
}

export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

export function createLayer(index: number, id?: string): CanvasLayer {
  const layerId = id ?? `layer-${index + 1}`;
  return { id: layerId, name: index === 0 ? "Layer 1" : `Layer ${index + 1}`, visible: true, opacity: 1, locked: false };
}

export function stabilizePoint(from: CanvasPoint, to: CanvasPoint, amount: number): CanvasPoint {
  const t = 1 - clampUnit(amount);
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, p: from.p + (to.p - from.p) * t };
}

export function mirrorPoint(point: CanvasPoint, width = CANVAS_WIDTH): CanvasPoint {
  return { ...point, x: width - point.x };
}

export function pointerPressure(event: { pointerType: string; pressure: number }): number {
  if (event.pointerType === "mouse" || event.pressure === 0) return 0.72;
  return Math.min(1, Math.max(0.18, event.pressure));
}

export function emptyDrawingMessage(hasMarks: boolean): string | null {
  return hasMarks ? null : "Draw something before continuing.";
}

export function paintStroke(ctx: CanvasRenderingContext2D, stroke: CanvasStroke) {
  if (!stroke.points.length) return;
  stampPolyline(ctx, stroke, stroke.points);
  if (stroke.symmetry) stampPolyline(ctx, stroke, stroke.points.map((point) => mirrorPoint(point)));
}

function stampPolyline(ctx: CanvasRenderingContext2D, stroke: CanvasStroke, points: CanvasPoint[]) {
  ctx.save();
  ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
  const [r, g, b] = hexToRgba(stroke.color);
  const stepsFor = (from: CanvasPoint, to: CanvasPoint) => {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const spacing = Math.max(0.6, stroke.size * (stroke.hardness < 0.4 ? 0.18 : 0.28));
    return Math.max(1, Math.ceil(distance / spacing));
  };
  const stamp = (point: CanvasPoint) => {
    const radius = Math.max(0.5, (stroke.size / 2) * point.p);
    const alpha = stroke.tool === "eraser" ? 1 : stroke.opacity;
    if (stroke.hardness >= 0.94) {
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const gradient = ctx.createRadialGradient(point.x, point.y, radius * stroke.hardness, point.x, point.y, radius);
    gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  if (points.length === 1) {
    stamp(points[0]);
    ctx.restore();
    return;
  }
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const steps = stepsFor(from, to);
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      stamp({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        p: from.p + (to.p - from.p) * t,
      });
    }
  }
  ctx.restore();
}

export function drawingToDemoFile(drawing: ExportedDrawing, kind: DemoFile["kind"], name: string, createdAt: string): DemoFile {
  return {
    id: `${kind}-${createdAt.replace(/[^\d]/g, "").slice(-10)}-${name.replace(/[^a-z0-9]+/gi, "").slice(0, 12)}`,
    name,
    type: "image/jpeg",
    size: drawing.byteLength,
    kind,
    preview: drawing.dataUrl,
    source: "arya-canvas",
    createdAt,
  };
}

export function hexToRgba(hex: string): [number, number, number, number] {
  const raw = hex.replace("#", "").trim();
  const full = raw.length === 3 ? raw.split("").map((part) => `${part}${part}`).join("") : raw.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value)) return [23, 21, 27, 255];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
}

export function rgbaToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function colorMatch(data: Uint8ClampedArray, index: number, color: [number, number, number, number], tolerance: number) {
  if (data[index + 3] <= tolerance && color[3] <= tolerance) return true;
  return (
    Math.abs(data[index] - color[0]) <= tolerance &&
    Math.abs(data[index + 1] - color[1]) <= tolerance &&
    Math.abs(data[index + 2] - color[2]) <= tolerance &&
    Math.abs(data[index + 3] - color[3]) <= tolerance
  );
}

export function floodFillRgba(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  fill: [number, number, number, number],
  tolerance = 20,
): number {
  const x = Math.floor(startX);
  const y = Math.floor(startY);
  if (x < 0 || y < 0 || x >= width || y >= height) return 0;
  const start = (y * width + x) * 4;
  const target: [number, number, number, number] = [data[start], data[start + 1], data[start + 2], data[start + 3]];
  if (colorMatch(data, start, fill, 0)) return 0;
  const stack = [start];
  const seen = new Uint8Array(width * height);
  seen[y * width + x] = 1;
  let filled = 0;
  while (stack.length) {
    const index = stack.pop() as number;
    if (!colorMatch(data, index, target, tolerance)) continue;
    data[index] = fill[0];
    data[index + 1] = fill[1];
    data[index + 2] = fill[2];
    data[index + 3] = fill[3];
    filled += 1;
    const pixel = index >> 2;
    const px = pixel % width;
    const py = Math.floor(pixel / width);
    const neighbors = [
      px > 0 ? index - 4 : -1,
      px + 1 < width ? index + 4 : -1,
      py > 0 ? index - width * 4 : -1,
      py + 1 < height ? index + width * 4 : -1,
    ];
    for (const next of neighbors) {
      if (next < 0) continue;
      const nextPixel = next >> 2;
      if (seen[nextPixel]) continue;
      seen[nextPixel] = 1;
      stack.push(next);
    }
  }
  return filled;
}

export function applyCanvasOp(ctx: CanvasRenderingContext2D, op: CanvasOp) {
  if (op.type === "stroke") {
    paintStroke(ctx, op.stroke);
    return;
  }
  const image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const filled = floodFillRgba(image.data, ctx.canvas.width, ctx.canvas.height, op.x, op.y, hexToRgba(op.color));
  if (filled) ctx.putImageData(image, 0, 0);
}

export function latestFileOfKind<T extends { kind: string; createdAt: string }>(files: T[], kind: string): T | undefined {
  return files.filter((file) => file.kind === kind).at(-1);
}
