"use client";

import Link from "next/link";
import { artworks, getArtist } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { usePublished } from "@/features/published/published-provider";
import { drawBackPairHref, findDemoArtwork, publicDrawBacks } from "@/lib/domain/draw-back";
import { artistLabel } from "@/lib/published/artist";

export function DiscoverDrawBacks({ excludePairId }: { excludePairId?: string } = {}) {
  const { state, hydrated } = useDemo();
  const published = usePublished();
  if (!hydrated) return null;
  const catalog = [...published.artworks, ...state.createdArtworks, ...artworks];
  const pairs = publicDrawBacks([...published.pairs, ...state.drawBacks ?? []], catalog, [...published.processLogs, ...state.processLogs]).filter((pair) => pair.id !== excludePairId);
  if (!pairs.length) return null;
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-10 sm:px-6 sm:pb-16 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">Draw-back</p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.7rem] leading-none sm:text-4xl">Watch it get drawn. Draw back.</h2>
      <p className="mt-2 max-w-2xl text-sm text-black/50">A reply is another drawing, not a comment thread. Uploads cannot enter.</p>
      <div className="mt-5 grid gap-5 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map((pair) => {
          const source = findDemoArtwork(catalog, [], pair.sourceArtworkId);
          const reply = findDemoArtwork(catalog, [], pair.replyArtworkId);
          const sourceArtist = source ? getArtist(source.artistId) : undefined;
          const replyArtist = reply ? getArtist(reply.artistId) : undefined;
          if (!source || !reply || !sourceArtist || !replyArtist) return null;
          return (
            <article key={pair.id} className="overflow-hidden rounded-[1.6rem] border border-black/[0.07] bg-white">
              <Link href={drawBackPairHref(pair.id, { watch: true })} className="relative grid grid-cols-2 gap-px bg-mist" aria-label={`${reply.title} by ${artistLabel(replyArtist)}, drawn back from ${source.title}`}>
                <img src={source.image} alt="" className="aspect-[4/5] w-full object-cover" />
                <img src={reply.image} alt="" className="aspect-[4/5] w-full object-cover" />
                <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold text-white">Watch both</span>
              </Link>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum">Draw-back</p>
                <h3 className="mt-1 font-bold">{reply.title}</h3>
                <p className="mt-1 text-sm text-black/55">
                  <Link href={`/artists/${replyArtist.id}`} className="font-bold text-plum">{artistLabel(replyArtist)}</Link>
                  {" drew back "}
                  <Link href={`/artists/${sourceArtist.id}`} className="font-bold text-plum">{artistLabel(sourceArtist)}</Link>
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
