import { drawnOnArya, publicHumanMade } from "@/lib/domain/identity";
import { processLogFor, type ProcessLog } from "@/lib/domain/process-log";
import type { Artwork, DrawBackPair } from "@/types";

export function canDrawBack(artwork: Artwork | undefined, processLog: ProcessLog | null) {
  if (!artwork || artwork.visibility !== "public") return false;
  return publicHumanMade(artwork.tools, processLog);
}

export function canPublishDrawBack(
  source: Artwork | undefined,
  sourceLog: ProcessLog | null,
  reply: Artwork | undefined,
  replyLog: ProcessLog | null,
) {
  if (!canDrawBack(source, sourceLog) || !reply) return false;
  if (!replyLog || replyLog.ops.length === 0) return false;
  return drawnOnArya(reply.tools);
}

export function drawBackHref(artworkId: string) {
  return `/create/draw?back=${encodeURIComponent(artworkId)}`;
}

export function drawBackPairHref(pairId: string, options?: { watch?: boolean }) {
  return options?.watch ? `/draw-back/${pairId}?watch=1` : `/draw-back/${pairId}`;
}

export function findDemoArtwork(created: Artwork[], catalog: Artwork[], id: string) {
  return created.find((item) => item.id === id) ?? catalog.find((item) => item.id === id);
}

export function pairsForSource(pairs: DrawBackPair[], sourceArtworkId: string) {
  return pairs.filter((pair) => pair.sourceArtworkId === sourceArtworkId);
}

export function pairForReply(pairs: DrawBackPair[], replyArtworkId: string) {
  return pairs.find((pair) => pair.replyArtworkId === replyArtworkId) ?? null;
}

export function publicDrawBacks(pairs: DrawBackPair[], artworks: Artwork[], processLogs: ProcessLog[]) {
  return pairs.filter((pair) => {
    const source = artworks.find((item) => item.id === pair.sourceArtworkId);
    const reply = artworks.find((item) => item.id === pair.replyArtworkId);
    return canPublishDrawBack(source, processLogFor(processLogs, pair.sourceArtworkId), reply, processLogFor(processLogs, pair.replyArtworkId));
  });
}
