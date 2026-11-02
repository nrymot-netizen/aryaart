import type { Metadata } from "next";
import { getArtwork } from "@/data/mock-data";
import { seedDrawBacks } from "@/data/seed-draw-back";
import { seedPaperLanternArtwork } from "@/data/seed-challenges";
import { seedLanternArtwork } from "@/data/seed-lantern";
import { publishedStoreConfigured } from "@/lib/published/config";
import { getPublishedStore } from "@/lib/published/store";
import { DrawBackPairBody } from "@/features/artwork/draw-back-pair";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (publishedStoreConfigured()) {
    const shared = await getPublishedStore().getPair(id).catch(() => null);
    if (shared) return { title: `${shared.reply.artwork.title} × ${shared.source.artwork.title}` };
  }
  const pair = seedDrawBacks.find((item) => item.id === id);
  if (!pair) return { title: "Draw-back pair" };
  const source = getArtwork(pair.sourceArtworkId) ?? (pair.sourceArtworkId === seedLanternArtwork.id ? seedLanternArtwork : undefined);
  const reply = getArtwork(pair.replyArtworkId) ?? (pair.replyArtworkId === seedPaperLanternArtwork.id ? seedPaperLanternArtwork : undefined);
  if (source && reply) return { title: `${reply.title} × ${source.title}` };
  return { title: "Draw-back pair" };
}

export default function DrawBackPairPage() {
  return <DrawBackPairBody />;
}
