import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Artwork, DrawBackPair } from "@/types";
import type { ProcessLog } from "@/lib/domain/process-log";
import { PUBLISHED_LIST_LIMIT, supabaseServiceRoleKey, supabaseUrl } from "./config";
import type { PublishedArtStore, PublishedBundle, PublishedCatalog, PublishedProfile, PublishInput } from "./types";

interface ArtworkRow {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  image: string;
  style: string;
  subject: string;
  tags: string[];
  tools: string[];
  ai_disclosure: boolean;
  visibility: "public" | "unlisted";
  published_at: string;
  price: number;
  format: "digital" | "physical";
  published_profiles?: { id: string; handle: string } | { id: string; handle: string }[] | null;
}

interface LogRow {
  id: string;
  artwork_id: string;
  paper_color: string;
  width: number;
  height: number;
  ops: ProcessLog["ops"];
  recorded_at: string;
  challenge_id: string | null;
}

interface PairRow {
  id: string;
  source_artwork_id: string;
  reply_artwork_id: string;
  published_at: string;
}

function adminClient(): SupabaseClient {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { persistSession: false, autoRefreshToken: false } });
}

function profileFromJoin(row: ArtworkRow): PublishedProfile {
  const joined = Array.isArray(row.published_profiles) ? row.published_profiles[0] : row.published_profiles;
  return { id: joined?.id ?? row.profile_id, handle: joined?.handle ?? row.profile_id };
}

function artworkFromRow(row: ArtworkRow, handle: string): Artwork {
  return {
    id: row.id,
    artistId: handle,
    title: row.title,
    description: row.description,
    image: row.image,
    style: row.style as Artwork["style"],
    subject: row.subject as Artwork["subject"],
    tags: row.tags,
    tools: row.tools,
    aiDisclosure: row.ai_disclosure,
    visibility: row.visibility,
    publishedAt: row.published_at,
    price: row.price,
    likes: 0,
    isNew: true,
    format: row.format,
  };
}

function logFromRow(row: LogRow): ProcessLog {
  return {
    id: row.id,
    subjectId: row.artwork_id,
    subjectKind: "artwork",
    paperColor: row.paper_color,
    width: row.width,
    height: row.height,
    ops: row.ops ?? [],
    recordedAt: row.recorded_at,
    ...(row.challenge_id ? { challengeId: row.challenge_id } : {}),
  };
}

function pairFromRow(row: PairRow): DrawBackPair {
  return {
    id: row.id,
    sourceArtworkId: row.source_artwork_id,
    replyArtworkId: row.reply_artwork_id,
    publishedAt: row.published_at,
  };
}

async function ensureProfile(client: SupabaseClient, handle: string): Promise<PublishedProfile> {
  const existing = await client.from("published_profiles").select("id, handle").eq("handle", handle).maybeSingle();
  if (existing.data) return existing.data;
  const created = await client.from("published_profiles").insert({ handle }).select("id, handle").single();
  if (created.error || !created.data) throw new Error(created.error?.message ?? "Could not create a publisher profile.");
  return created.data;
}

async function loadBundle(client: SupabaseClient, id: string): Promise<PublishedBundle | null> {
  const artworkRes = await client.from("published_artworks").select("*, published_profiles(id, handle)").eq("id", id).maybeSingle();
  if (artworkRes.error || !artworkRes.data) return null;
  const row = artworkRes.data as ArtworkRow;
  const profile = profileFromJoin(row);
  const logRes = await client.from("published_process_logs").select("*").eq("artwork_id", id).maybeSingle();
  const pairRes = await client.from("published_draw_backs").select("*").eq("reply_artwork_id", id).maybeSingle();
  return {
    artwork: artworkFromRow(row, profile.handle),
    processLog: logRes.data ? logFromRow(logRes.data as LogRow) : null,
    pair: pairRes.data ? pairFromRow(pairRes.data as PairRow) : null,
    profile,
  };
}

export function supabasePublishedStore(): PublishedArtStore {
  const client = adminClient();
  return {
    configured: true,
    async list(): Promise<PublishedCatalog> {
      const artworkRes = await client
        .from("published_artworks")
        .select("*, published_profiles(id, handle)")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(PUBLISHED_LIST_LIMIT);
      if (artworkRes.error) throw new Error(artworkRes.error.message);
      const rows = (artworkRes.data ?? []) as ArtworkRow[];
      const ids = rows.map((row) => row.id);
      const [logsRes, pairsRes] = await Promise.all([
        ids.length ? client.from("published_process_logs").select("*").in("artwork_id", ids) : Promise.resolve({ data: [], error: null }),
        ids.length ? client.from("published_draw_backs").select("*").in("reply_artwork_id", ids) : Promise.resolve({ data: [], error: null }),
      ]);
      if (logsRes.error) throw new Error(logsRes.error.message);
      if (pairsRes.error) throw new Error(pairsRes.error.message);
      const profiles = new Map<string, PublishedProfile>();
      const artworks = rows.map((row) => {
        const profile = profileFromJoin(row);
        profiles.set(profile.handle, profile);
        return artworkFromRow(row, profile.handle);
      });
      return {
        artworks,
        processLogs: ((logsRes.data ?? []) as LogRow[]).map(logFromRow),
        pairs: ((pairsRes.data ?? []) as PairRow[]).map(pairFromRow),
        profiles: [...profiles.values()],
      };
    },
    async getArtwork(id) {
      return loadBundle(client, id);
    },
    async getPair(id) {
      const pairRes = await client.from("published_draw_backs").select("*").eq("id", id).maybeSingle();
      if (pairRes.error || !pairRes.data) return null;
      const pair = pairFromRow(pairRes.data as PairRow);
      const [source, reply] = await Promise.all([loadBundle(client, pair.sourceArtworkId), loadBundle(client, pair.replyArtworkId)]);
      if (!reply) return null;
      if (!source) return null;
      return { pair, source, reply };
    },
    async publish(input: PublishInput) {
      const profile = await ensureProfile(client, input.handle);
      const artwork = { ...input.artwork, artistId: profile.handle };
      const { error: artError } = await client.from("published_artworks").upsert({
        id: artwork.id,
        profile_id: profile.id,
        title: artwork.title,
        description: artwork.description,
        image: artwork.image,
        style: artwork.style,
        subject: artwork.subject,
        tags: artwork.tags,
        tools: artwork.tools,
        ai_disclosure: artwork.aiDisclosure,
        visibility: artwork.visibility,
        published_at: artwork.publishedAt,
        price: artwork.price,
        format: artwork.format,
      });
      if (artError) throw new Error(artError.message);
      if (input.processLog) {
        const { error: logError } = await client.from("published_process_logs").upsert({
          id: input.processLog.id,
          artwork_id: artwork.id,
          paper_color: input.processLog.paperColor,
          width: input.processLog.width,
          height: input.processLog.height,
          ops: input.processLog.ops,
          recorded_at: input.processLog.recordedAt,
          challenge_id: input.processLog.challengeId ?? null,
        });
        if (logError) throw new Error(logError.message);
      }
      if (input.pair) {
        const { error: pairError } = await client.from("published_draw_backs").upsert({
          id: input.pair.id,
          source_artwork_id: input.pair.sourceArtworkId,
          reply_artwork_id: input.pair.replyArtworkId,
          published_at: input.pair.publishedAt,
        });
        if (pairError) throw new Error(pairError.message);
      }
      return { artwork, processLog: input.processLog, pair: input.pair, profile };
    },
  };
}
