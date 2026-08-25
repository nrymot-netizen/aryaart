import { ARYA_CANVAS_TOOL } from "@/lib/domain/canvas";
import type { ProcessLog } from "@/lib/domain/process-log";
import type { Artwork, Challenge, ChallengeEntry, Post } from "@/types";
import { seedLanternArtwork } from "@/data/seed-lantern";

export const ACTIVE_CHALLENGE_ID = "night-lantern";

export const seedNightLanternChallenge: Challenge = {
  id: ACTIVE_CHALLENGE_ID,
  title: "Night lantern",
  brief: "Draw a lantern at night. Warm light on still paper. Drawn on Arya — no generative AI.",
  opensAt: "2026-08-18T00:00:00Z",
  closesAt: "2026-09-30T23:59:59Z",
  status: "active",
};

export const challenges: Challenge[] = [seedNightLanternChallenge];

export function getChallenge(id: string) {
  return challenges.find((item) => item.id === id);
}

export function getActiveChallenge() {
  return challenges.find((item) => item.status === "active") ?? seedNightLanternChallenge;
}

export const seedPaperLanternArtwork: Artwork = {
  id: "paper-lantern",
  artistId: "maya",
  title: "Paper lantern",
  description: "Drawn on Arya.",
  image: "/art/paper-lantern.svg",
  style: "Cute",
  subject: "character",
  tags: ["arya-canvas", "lantern", "cozy"],
  tools: [ARYA_CANVAS_TOOL],
  aiDisclosure: false,
  visibility: "public",
  publishedAt: "2026-08-24",
  price: 22,
  likes: 9000,
  isNew: true,
  format: "digital",
};

export const seedPaperLanternPost: Post = {
  id: "post-paper-lantern",
  artistId: "maya",
  artworkId: "paper-lantern",
  postType: "finished",
  body: "Paper lantern drawn on Arya.",
  publishedAt: "2026-08-24",
};

export const seedPaperLanternLog: ProcessLog = {
  id: "plog-paper-lantern",
  subjectId: "paper-lantern",
  subjectKind: "artwork",
  challengeId: ACTIVE_CHALLENGE_ID,
  paperColor: "#f4e6d4",
  width: 720,
  height: 900,
  recordedAt: "2026-08-24T16:12:00Z",
  ops: [
    { type: "stroke", stroke: { tool: "ink", color: "#c45c48", size: 16, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 360, y: 168, p: 0.7 }, { x: 360, y: 200, p: 0.7 }, { x: 360, y: 248, p: 0.7 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#c45c48", size: 16, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 288, y: 268, p: 0.7 }, { x: 360, y: 248, p: 0.7 }, { x: 432, y: 268, p: 0.7 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#c45c48", size: 16, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 276, y: 288, p: 0.7 }, { x: 444, y: 288, p: 0.7 }, { x: 432, y: 520, p: 0.7 }, { x: 288, y: 520, p: 0.7 }, { x: 276, y: 288, p: 0.7 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#c45c48", size: 16, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 300, y: 360, p: 0.7 }, { x: 360, y: 360, p: 0.7 }, { x: 420, y: 360, p: 0.7 }] } },
    { type: "fill", x: 360, y: 400, color: "#f3c07a", layerId: "layer-1" },
    { type: "stroke", stroke: { tool: "ink", color: "#ee6b5e", size: 8, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 360, y: 430, p: 0.7 }, { x: 356, y: 390, p: 0.7 }, { x: 360, y: 360, p: 0.7 }, { x: 364, y: 400, p: 0.7 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#c45c48", size: 16, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 318, y: 520, p: 0.7 }, { x: 318, y: 612, p: 0.7 }, { x: 402, y: 612, p: 0.7 }, { x: 402, y: 520, p: 0.7 }] } },
  ],
};

export const seedLanternChallengeEntry: ChallengeEntry = {
  id: "centry-lantern-study",
  challengeId: ACTIVE_CHALLENGE_ID,
  artworkId: seedLanternArtwork.id,
  artistId: "luna",
  seedSaves: 18,
};

export const seedPaperLanternChallengeEntry: ChallengeEntry = {
  id: "centry-paper-lantern",
  challengeId: ACTIVE_CHALLENGE_ID,
  artworkId: seedPaperLanternArtwork.id,
  artistId: "maya",
  seedSaves: 11,
};

export const seedChallengeEntries: ChallengeEntry[] = [seedLanternChallengeEntry, seedPaperLanternChallengeEntry];

export const challengeDrawHref = (challengeId = ACTIVE_CHALLENGE_ID) => `/create/draw?challenge=${encodeURIComponent(challengeId)}`;
