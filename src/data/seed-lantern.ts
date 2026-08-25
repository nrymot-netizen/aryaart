import { ARYA_CANVAS_TOOL } from "@/lib/domain/canvas";
import type { ProcessLog } from "@/lib/domain/process-log";
import type { Artwork, Post } from "@/types";

export const SEED_LANTERN_CHALLENGE_ID = "night-lantern";

export const seedLanternArtwork: Artwork = {
  id: "lantern-study",
  artistId: "luna",
  title: "Lantern study",
  description: "Drawn on Arya.",
  image: "/art/lantern-study.svg",
  style: "Anime",
  subject: "character",
  tags: ["arya-canvas", "lantern", "night"],
  tools: [ARYA_CANVAS_TOOL],
  aiDisclosure: false,
  visibility: "public",
  publishedAt: "2026-08-25",
  price: 40,
  likes: 0,
  isNew: true,
  format: "digital",
};

export const seedLanternPost: Post = {
  id: "post-lantern-study",
  artistId: "luna",
  artworkId: "lantern-study",
  postType: "finished",
  body: "Lantern study drawn on Arya.",
  publishedAt: "2026-08-25",
};

export const seedLanternLog: ProcessLog = {
  id: "plog-lantern-study",
  subjectId: "lantern-study",
  subjectKind: "artwork",
  challengeId: SEED_LANTERN_CHALLENGE_ID,
  paperColor: "#1c1922",
  width: 720,
  height: 900,
  recordedAt: "2026-08-25T17:35:48.975Z",
  ops: [
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 22, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 302.4, y: 270, p: 0.72 }, { x: 309.6, y: 254.3, p: 0.72 }, { x: 315.3, y: 241.9, p: 0.72 }, { x: 323.9, y: 223, p: 0.72 }, { x: 332.5, y: 204.1, p: 0.72 }, { x: 338.3, y: 191.5, p: 0.72 }, { x: 346.9, y: 172.6, p: 0.72 }, { x: 355.6, y: 153.7, p: 0.72 }, { x: 361.3, y: 149.3, p: 0.72 }, { x: 370, y: 165.9, p: 0.72 }, { x: 378.6, y: 184.7, p: 0.72 }, { x: 384.4, y: 197.3, p: 0.72 }, { x: 393, y: 216.2, p: 0.72 }, { x: 401.6, y: 235.1, p: 0.72 }, { x: 407.4, y: 247.7, p: 0.72 }, { x: 416, y: 266.6, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 22, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 259.2, y: 288, p: 0.72 }, { x: 309.2, y: 288, p: 0.72 }, { x: 352.3, y: 288, p: 0.72 }, { x: 409.8, y: 288, p: 0.72 }, { x: 456.7, y: 291.3, p: 0.72 }, { x: 451.6, y: 311, p: 0.72 }, { x: 445.4, y: 326.4, p: 0.72 }, { x: 437.2, y: 346.9, p: 0.72 }, { x: 416.4, y: 359.7, p: 0.72 }, { x: 375.8, y: 360, p: 0.72 }, { x: 345, y: 360, p: 0.72 }, { x: 303.8, y: 360, p: 0.72 }, { x: 283.1, y: 347.2, p: 0.72 }, { x: 274.7, y: 326.8, p: 0.72 }, { x: 268.5, y: 311.3, p: 0.72 }, { x: 260.3, y: 290.8, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 22, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 288, y: 360, p: 0.72 }, { x: 286.2, y: 370.2, p: 0.72 }, { x: 283.9, y: 384.1, p: 0.72 }, { x: 281.3, y: 399.1, p: 0.72 }, { x: 278.6, y: 414.6, p: 0.72 }, { x: 275.9, y: 430.3, p: 0.72 }, { x: 273.3, y: 446, p: 0.72 }, { x: 270.6, y: 461.8, p: 0.72 }, { x: 265.2, y: 493.3, p: 0.72 }, { x: 262.5, y: 509, p: 0.72 }, { x: 259.8, y: 524.8, p: 0.72 }, { x: 257.1, y: 540.5, p: 0.72 }, { x: 254.4, y: 556.3, p: 0.72 }, { x: 251.7, y: 572, p: 0.72 }, { x: 249, y: 587.8, p: 0.72 }, { x: 246.3, y: 603.5, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 22, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 432, y: 360, p: 0.72 }, { x: 433.8, y: 370.2, p: 0.72 }, { x: 436.1, y: 384.1, p: 0.72 }, { x: 438.7, y: 399.1, p: 0.72 }, { x: 441.4, y: 414.6, p: 0.72 }, { x: 444.1, y: 430.3, p: 0.72 }, { x: 446.7, y: 446, p: 0.72 }, { x: 449.4, y: 461.8, p: 0.72 }, { x: 454.8, y: 493.3, p: 0.72 }, { x: 457.5, y: 509, p: 0.72 }, { x: 460.2, y: 524.8, p: 0.72 }, { x: 462.9, y: 540.5, p: 0.72 }, { x: 465.6, y: 556.3, p: 0.72 }, { x: 468.3, y: 572, p: 0.72 }, { x: 471, y: 587.8, p: 0.72 }, { x: 473.7, y: 603.5, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 22, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 244.8, y: 612, p: 0.72 }, { x: 262.7, y: 628.8, p: 0.72 }, { x: 284.1, y: 648.9, p: 0.72 }, { x: 312.9, y: 675.9, p: 0.72 }, { x: 334.5, y: 696.1, p: 0.72 }, { x: 356.1, y: 716.4, p: 0.72 }, { x: 377.7, y: 703.1, p: 0.72 }, { x: 399.3, y: 683.1, p: 0.72 }, { x: 428.1, y: 656.1, p: 0.72 }, { x: 449.7, y: 635.9, p: 0.72 }, { x: 471.3, y: 615.6, p: 0.72 }, { x: 439.3, y: 612.2, p: 0.72 }, { x: 396.5, y: 612, p: 0.72 }, { x: 339, y: 612, p: 0.72 }, { x: 295.8, y: 612, p: 0.72 }, { x: 252.6, y: 612, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 22, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 273.6, y: 450, p: 0.72 }, { x: 284.8, y: 450, p: 0.72 }, { x: 300, y: 450, p: 0.72 }, { x: 316.5, y: 450, p: 0.72 }, { x: 333.6, y: 450, p: 0.72 }, { x: 350.7, y: 450, p: 0.72 }, { x: 368, y: 450, p: 0.72 }, { x: 385.3, y: 450, p: 0.72 }, { x: 402.5, y: 450, p: 0.72 }, { x: 419.8, y: 450, p: 0.72 }, { x: 437.1, y: 450, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#e0a51a", size: 22, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 259.2, y: 540, p: 0.72 }, { x: 272.3, y: 540, p: 0.72 }, { x: 290, y: 540, p: 0.72 }, { x: 309.3, y: 540, p: 0.72 }, { x: 329.1, y: 540, p: 0.72 }, { x: 349.2, y: 540, p: 0.72 }, { x: 369.3, y: 540, p: 0.72 }, { x: 389.5, y: 540, p: 0.72 }, { x: 409.6, y: 540, p: 0.72 }, { x: 429.8, y: 540, p: 0.72 }, { x: 449.9, y: 540, p: 0.72 }] } },
    { type: "fill", x: 360, y: 486, color: "#e0a51a", layerId: "layer-1" },
    { type: "stroke", stroke: { tool: "ink", color: "#ee6b5e", size: 10, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 345.6, y: 522, p: 0.72 }, { x: 347.4, y: 508.3, p: 0.72 }, { x: 348.6, y: 499.6, p: 0.72 }, { x: 351, y: 481.8, p: 0.72 }, { x: 352.2, y: 472.8, p: 0.72 }, { x: 354.6, y: 454.8, p: 0.72 }, { x: 357, y: 436.8, p: 0.72 }, { x: 358.2, y: 427.8, p: 0.72 }, { x: 360.6, y: 421.5, p: 0.72 }, { x: 361.8, y: 428.3, p: 0.72 }, { x: 364.2, y: 445.3, p: 0.72 }, { x: 366.6, y: 463.2, p: 0.72 }, { x: 367.8, y: 472.2, p: 0.72 }, { x: 370.2, y: 490.2, p: 0.72 }, { x: 371.4, y: 499.2, p: 0.72 }, { x: 373.8, y: 517.2, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#ffffff", size: 10, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 360, y: 252, p: 0.72 }, { x: 360, y: 240.3, p: 0.72 }, { x: 360, y: 224.5, p: 0.72 }, { x: 360, y: 207.3, p: 0.72 }, { x: 360, y: 189.5, p: 0.72 }, { x: 360, y: 171.6, p: 0.72 }, { x: 360, y: 153.7, p: 0.72 }, { x: 360, y: 135.7, p: 0.72 }, { x: 360, y: 117.7, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#ffffff", size: 10, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 446.4, y: 324, p: 0.72 }, { x: 455.8, y: 318.2, p: 0.72 }, { x: 468.4, y: 310.3, p: 0.72 }, { x: 482.2, y: 301.6, p: 0.72 }, { x: 496.4, y: 292.8, p: 0.72 }, { x: 510.7, y: 283.8, p: 0.72 }, { x: 525.1, y: 274.8, p: 0.72 }, { x: 539.5, y: 265.8, p: 0.72 }, { x: 553.8, y: 256.8, p: 0.72 }] } },
    { type: "stroke", stroke: { tool: "ink", color: "#ffffff", size: 10, opacity: 1, hardness: 1, symmetry: false, layerId: "layer-1", points: [{ x: 273.6, y: 324, p: 0.72 }, { x: 264.2, y: 318.2, p: 0.72 }, { x: 251.6, y: 310.3, p: 0.72 }, { x: 237.8, y: 301.6, p: 0.72 }, { x: 223.6, y: 292.8, p: 0.72 }, { x: 209.3, y: 283.8, p: 0.72 }, { x: 194.9, y: 274.8, p: 0.72 }, { x: 180.5, y: 265.8, p: 0.72 }, { x: 166.2, y: 256.8, p: 0.72 }] } },
  ],
};
