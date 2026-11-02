import { NextResponse } from "next/server";
import { evaluatePublicCopy } from "@/lib/domain/safety";
import type { ProcessLog } from "@/lib/domain/process-log";
import { isPublisherHandle, normalizePublishArtistId, shouldSharePublish } from "@/lib/published/artist";
import { PUBLISHER_COOKIE, publishedStoreConfigured } from "@/lib/published/config";
import { publishRequestSchema } from "@/lib/published/schema";
import { getPublishedStore } from "@/lib/published/store";
import type { Artwork, DrawBackPair } from "@/types";

const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || current.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

export async function GET() {
  if (!publishedStoreConfigured()) {
    return NextResponse.json({ configured: false, artworks: [], processLogs: [], pairs: [], profiles: [] });
  }
  try {
    const catalog = await getPublishedStore().list();
    return NextResponse.json({ configured: true, ...catalog });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load the shared gallery." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!publishedStoreConfigured()) {
    return NextResponse.json({ configured: false, error: "Shared gallery is not connected." }, { status: 503 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many publishes from this network. Try again in a few minutes." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid publish payload." }, { status: 400 });
  }
  const parsed = publishRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "That drawing could not be shared." }, { status: 400 });
  }
  const { artwork, processLog, pair, handle } = parsed.data;
  if (!shouldSharePublish(artwork.artistId) || !isPublisherHandle(handle)) {
    return NextResponse.json({ error: "Only visitor drawings are shared." }, { status: 400 });
  }
  if (!artwork.image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Share a drawing, not a remote file." }, { status: 400 });
  }
  const contact = evaluatePublicCopy([artwork.title, artwork.description]);
  if (!contact.allowed) {
    return NextResponse.json({ error: contact.message }, { status: 400 });
  }
  if (processLog && processLog.subjectId !== artwork.id) {
    return NextResponse.json({ error: "Process log does not match this drawing." }, { status: 400 });
  }
  if (pair && pair.replyArtworkId !== artwork.id) {
    return NextResponse.json({ error: "Draw-back pair does not match this drawing." }, { status: 400 });
  }
  try {
    const shared = await getPublishedStore().publish({
      handle,
      artwork: { ...artwork, artistId: normalizePublishArtistId(artwork.artistId, handle), likes: 0 } as Artwork,
      processLog: processLog as ProcessLog | null,
      pair: pair as DrawBackPair | null,
    });
    const response = NextResponse.json({ configured: true, ...shared });
    response.cookies.set(PUBLISHER_COOKIE, handle, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not share this drawing." }, { status: 500 });
  }
}
