import { estimateDataUrlBytes } from "@/lib/domain/canvas";
import type { DrawingDraft, DrawingDraftLayer } from "@/types";

export const DRAWING_DRAFT_MAX = 3;
export const DRAWING_DRAFT_MAX_BYTES = 750_000;

export function createDraftId(scope: "create" | "order", key: string) {
  return scope === "create" ? `draft-create-${key}` : `draft-order-${key}`;
}

export function drawingDraftBytes(draft: DrawingDraft) {
  return estimateDataUrlBytes(draft.composite) + draft.layers.reduce((sum, layer) => sum + (layer.dataUrl ? estimateDataUrlBytes(layer.dataUrl) : 0), 0);
}

export function capDrawingDraft(draft: DrawingDraft): DrawingDraft {
  if (drawingDraftBytes(draft) <= DRAWING_DRAFT_MAX_BYTES) return draft;
  return {
    ...draft,
    layers: draft.layers.map((layer) => {
      const { dataUrl: _dropped, ...meta } = layer;
      return meta;
    }),
  };
}

export function upsertDrawingDraft(drafts: DrawingDraft[], draft: DrawingDraft): DrawingDraft[] {
  const capped = capDrawingDraft(draft);
  return [capped, ...drafts.filter((item) => item.id !== capped.id)].slice(0, DRAWING_DRAFT_MAX);
}

export function drawingDraftFor(drafts: DrawingDraft[] | undefined, id: string) {
  return (drafts ?? []).find((item) => item.id === id);
}

export function layersHaveBitmaps(layers: DrawingDraftLayer[]) {
  return layers.some((layer) => Boolean(layer.dataUrl));
}
