import Link from "next/link";
import { seedPaperLanternArtwork } from "@/data/seed-challenges";
import { seedLanternDrawBack } from "@/data/seed-draw-back";
import { seedLanternArtwork } from "@/data/seed-lantern";
import { drawBackHref, drawBackPairHref } from "@/lib/domain/draw-back";

export function DiscoverOpenHero() {
  const watchHref = drawBackPairHref(seedLanternDrawBack.id, { watch: true });
  const backHref = drawBackHref(seedLanternArtwork.id);
  return (
    <section className="border-b border-black/5 bg-[#f4f0ea]">
      <div className="mx-auto max-w-3xl px-4 pb-8 pt-4 sm:px-6 sm:pb-14 sm:pt-10">
        <Link href={watchHref} className="relative grid grid-cols-2 gap-px overflow-hidden rounded-[1.6rem] bg-mist shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum" aria-label="Watch Paper lantern and Lantern study get drawn">
          <img src={seedLanternArtwork.image} alt="" className="aspect-[4/5] w-full object-cover" />
          <img src={seedPaperLanternArtwork.image} alt="" className="aspect-[4/5] w-full object-cover" />
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-bold text-white">Watch both</span>
        </Link>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[2rem] leading-[0.95] tracking-[-0.03em] sm:text-6xl">Watch it get drawn. Draw back.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-black/60 sm:text-base">A reply is another drawing, not a comment. Draw on Arya in this browser — no account yet.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={watchHref} className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-white">Watch both</Link>
          <Link href={backHref} className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-bold text-ink">Draw back</Link>
          <Link href="/create/draw" className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-bold text-ink">Start a drawing</Link>
        </div>
        <p className="mt-4 text-sm"><Link href="/search" className="font-bold text-plum">Search the catalog →</Link></p>
      </div>
    </section>
  );
}
