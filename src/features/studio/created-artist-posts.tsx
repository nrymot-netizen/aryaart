"use client";

import Link from "next/link";
import { getArtwork } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { processStoryHrefFromPostId } from "@/lib/domain/process-stories";
import { formatDate } from "@/lib/utils";

export function CreatedArtistPosts({ artistId }: { artistId: string }) {
  const { state, hydrated } = useDemo();
  if (!hydrated) return null;
  const items = (state.createdPosts ?? []).filter((post) => post.artistId === artistId);
  if (!items.length) return null;
  return (
    <div className="mb-4 space-y-4">
      {items.map((post) => {
        const artwork = post.artworkId ? (state.createdArtworks.find((item) => item.id === post.artworkId) ?? getArtwork(post.artworkId)) : undefined;
        const processHref = processStoryHrefFromPostId(post.id);
        return (
          <article key={post.id} className="rounded-3xl border border-plum/15 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum">{post.postType.replace("-", " ")} · {formatDate(post.publishedAt)}</p>
            <p className="mt-3 leading-7 text-black/70">{post.body}</p>
            {artwork && <Link href={`/art/${artwork.id}`} className="mt-4 flex items-center gap-3 rounded-2xl bg-mist p-3 text-sm font-semibold hover:text-plum"><img src={artwork.image} alt="" className="h-16 w-12 rounded-xl object-cover" />{artwork.title}</Link>}
            {processHref && <Link href={processHref} className="mt-4 inline-flex text-sm font-bold text-plum">View process story →</Link>}
          </article>
        );
      })}
    </div>
  );
}
