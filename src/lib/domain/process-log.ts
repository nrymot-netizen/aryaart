import { ARYA_CANVAS_TOOL, CANVAS_HEIGHT, CANVAS_WIDTH, type CanvasOp, type CanvasPoint, type CanvasStroke } from "@/lib/domain/canvas";

export const PROCESS_LOG_MAX_OPS = 40;
export const PROCESS_LOG_MAX_POINTS = 16;
export const PROCESS_LOG_MAX_CHARS = 20_000;
export const REPLAY_MIN_MS = 8_000;
export const REPLAY_MAX_MS = 15_000;
export const REPLAY_TARGET_MS = 12_000;

export type ProcessSubjectKind = "artwork" | "order-file";

export interface ProcessLog {
  id: string;
  subjectId: string;
  subjectKind: ProcessSubjectKind;
  paperColor: string;
  width: number;
  height: number;
  ops: CanvasOp[];
  recordedAt: string;
  challengeId?: string;
}

export interface ProcessLogMeta {
  paperColor: string;
  width?: number;
  height?: number;
}

export function cloneCanvasOps(ops: CanvasOp[]): CanvasOp[] {
  return JSON.parse(JSON.stringify(ops)) as CanvasOp[];
}

function roundCoord(value: number) {
  return Math.round(value * 10) / 10;
}

function samplePoints(points: CanvasPoint[], max = PROCESS_LOG_MAX_POINTS): CanvasPoint[] {
  if (points.length === 0) return [];
  if (points.length <= max) {
    return points.map((point) => ({ x: roundCoord(point.x), y: roundCoord(point.y), p: Math.round(point.p * 100) / 100 }));
  }
  const sampled: CanvasPoint[] = [];
  for (let index = 0; index < max; index += 1) {
    const source = points[Math.round((index / (max - 1)) * (points.length - 1))];
    sampled.push({ x: roundCoord(source.x), y: roundCoord(source.y), p: Math.round(source.p * 100) / 100 });
  }
  return sampled;
}

function sampleStroke(stroke: CanvasStroke): CanvasStroke {
  return {
    ...stroke,
    size: Math.round(stroke.size * 10) / 10,
    opacity: Math.round(stroke.opacity * 100) / 100,
    hardness: Math.round(stroke.hardness * 100) / 100,
    points: samplePoints(stroke.points),
  };
}

function sampleOp(op: CanvasOp): CanvasOp | null {
  if (op.type === "fill") {
    return { type: "fill", x: roundCoord(op.x), y: roundCoord(op.y), color: op.color, layerId: op.layerId };
  }
  if (!op.stroke.points.length) return null;
  return { type: "stroke", stroke: sampleStroke(op.stroke) };
}

function pickEven(ops: CanvasOp[], max: number): CanvasOp[] {
  if (ops.length <= max) return ops;
  const picked: CanvasOp[] = [];
  for (let index = 0; index < max; index += 1) {
    picked.push(ops[Math.round((index / (max - 1)) * (ops.length - 1))]);
  }
  return picked;
}

export function processLogChars(ops: CanvasOp[], meta: ProcessLogMeta) {
  return JSON.stringify({ ...meta, ops }).length;
}

export function sampleProcessLog(ops: CanvasOp[], meta: ProcessLogMeta): CanvasOp[] {
  const sampled = ops.map(sampleOp).filter((op): op is CanvasOp => Boolean(op));
  let next = pickEven(sampled, PROCESS_LOG_MAX_OPS);
  while (next.length > 1 && processLogChars(next, meta) > PROCESS_LOG_MAX_CHARS) {
    next = pickEven(next, Math.max(1, next.length - 4));
  }
  return next;
}

export function replayDurationMs(ops: CanvasOp[]) {
  if (!ops.length) return 0;
  const units = ops.reduce((total, op) => total + (op.type === "stroke" ? Math.max(4, op.stroke.points.length) : 6), 0);
  const scaled = REPLAY_MIN_MS + Math.round((units / 80) * (REPLAY_MAX_MS - REPLAY_MIN_MS));
  return Math.min(REPLAY_MAX_MS, Math.max(REPLAY_MIN_MS, scaled || REPLAY_TARGET_MS));
}

export function humanMadeFromStrokes(input: {
  tools?: string[];
  source?: "arya-canvas" | "upload";
  processLog?: ProcessLog | null;
}) {
  if (!input.processLog || input.processLog.ops.length === 0) return false;
  return Boolean(input.tools?.includes(ARYA_CANVAS_TOOL) || input.source === "arya-canvas");
}

export function buildProcessLog(
  subjectId: string,
  subjectKind: ProcessSubjectKind,
  ops: CanvasOp[],
  meta: ProcessLogMeta,
  recordedAt: string,
  id: string,
  challengeId?: string,
): ProcessLog | null {
  const sampled = sampleProcessLog(ops, meta);
  if (!sampled.length) return null;
  return {
    id,
    subjectId,
    subjectKind,
    paperColor: meta.paperColor,
    width: meta.width ?? CANVAS_WIDTH,
    height: meta.height ?? CANVAS_HEIGHT,
    ops: sampled,
    recordedAt,
    ...(challengeId ? { challengeId } : {}),
  };
}

export function processLogFor(logs: ProcessLog[], subjectId: string) {
  return logs.find((item) => item.subjectId === subjectId) ?? null;
}
