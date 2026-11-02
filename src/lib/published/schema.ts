import { z } from "zod";

const canvasPoint = z.object({ x: z.number(), y: z.number(), p: z.number() });
const canvasStroke = z.object({
  tool: z.string(),
  color: z.string(),
  size: z.number(),
  opacity: z.number(),
  hardness: z.number(),
  symmetry: z.boolean(),
  layerId: z.string(),
  points: z.array(canvasPoint).max(16),
});
const canvasOp = z.union([
  z.object({ type: z.literal("fill"), x: z.number(), y: z.number(), color: z.string(), layerId: z.string() }),
  z.object({ type: z.literal("stroke"), stroke: canvasStroke }),
]);

export const publishArtworkSchema = z.object({
  id: z.string().regex(/^art-[a-z0-9-]{3,48}$/),
  artistId: z.string().min(1).max(32),
  title: z.string().min(1).max(80),
  description: z.string().max(400),
  image: z.string().min(20).max(1_200_000),
  style: z.string().min(1).max(40),
  subject: z.string().min(1).max(40),
  tags: z.array(z.string().max(32)).max(12),
  tools: z.array(z.string().max(40)).max(8),
  aiDisclosure: z.boolean(),
  visibility: z.enum(["public", "unlisted"]),
  publishedAt: z.string().min(8).max(32),
  price: z.number().int().min(0).max(10_000),
  likes: z.number().int().min(0).max(0),
  format: z.enum(["digital", "physical"]),
  isNew: z.boolean().optional(),
});

export const publishProcessLogSchema = z.object({
  id: z.string().min(3).max(64),
  subjectId: z.string().min(3).max(64),
  subjectKind: z.literal("artwork"),
  paperColor: z.string().max(32),
  width: z.number().int().min(32).max(2400),
  height: z.number().int().min(32).max(2400),
  ops: z.array(canvasOp).max(40),
  recordedAt: z.string().min(8).max(40),
  challengeId: z.string().max(64).optional(),
});

export const publishPairSchema = z.object({
  id: z.string().min(3).max(64),
  sourceArtworkId: z.string().min(3).max(64),
  replyArtworkId: z.string().min(3).max(64),
  publishedAt: z.string().min(8).max(40),
});

export const publishRequestSchema = z.object({
  handle: z.string().regex(/^ink-[a-z0-9]{6,16}$/),
  artwork: publishArtworkSchema,
  processLog: publishProcessLogSchema.nullable(),
  pair: publishPairSchema.nullable(),
});
