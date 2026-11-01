import { drawnOnArya } from "@/lib/domain/identity";
import { processLogFor, type ProcessLog } from "@/lib/domain/process-log";
import type { Artwork, Challenge, ChallengeEntry } from "@/types";

export function isChallengeOpen(challenge: Challenge, now = new Date().toISOString()) {
  if (challenge.status !== "active") return false;
  return now >= challenge.opensAt && now <= challenge.closesAt;
}

export function canEnterChallenge(challenge: Challenge | undefined, processLog: ProcessLog | null, tools: string[], now?: string) {
  if (!challenge || !isChallengeOpen(challenge, now)) return false;
  if (!processLog || processLog.ops.length === 0) return false;
  return drawnOnArya(tools);
}

export function challengeSaveCount(entry: ChallengeEntry, savedArtworkIds: string[]) {
  return entry.seedSaves + (savedArtworkIds.includes(entry.artworkId) ? 1 : 0);
}

export function eligibleChallengeEntries(
  entries: ChallengeEntry[],
  challengeId: string,
  artworks: Artwork[],
  processLogs: ProcessLog[],
) {
  return entries.filter((entry) => {
    if (entry.challengeId !== challengeId) return false;
    const artwork = artworks.find((item) => item.id === entry.artworkId);
    const log = artwork ? processLogFor(processLogs, artwork.id) : null;
    return Boolean(artwork && drawnOnArya(artwork.tools) && log && log.ops.length > 0 && log.challengeId === challengeId);
  });
}

export function rankChallengeEntries(entries: ChallengeEntry[], savedArtworkIds: string[]) {
  return entries.slice().sort((left, right) => {
    const diff = challengeSaveCount(right, savedArtworkIds) - challengeSaveCount(left, savedArtworkIds);
    if (diff !== 0) return diff;
    return left.artworkId.localeCompare(right.artworkId);
  });
}

export function entryForArtwork(entries: ChallengeEntry[], artworkId: string) {
  return entries.find((entry) => entry.artworkId === artworkId) ?? null;
}
