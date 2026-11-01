"use client";

import Link from "next/link";
import { getArtist, getService } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { ReplayPlayer } from "@/features/artwork/replay-player";
import { processLogFor } from "@/lib/domain/process-log";
import type { ProcessStory } from "@/types";

export function ProcessStoryCard({ story }: { story: ProcessStory }) {
  const { state, dispatch } = useDemo();
  const artist = getArtist(story.artistId);
  const sketch = state.files.find((item) => item.id === story.sketchFileId);
  const final = state.files.find((item) => item.id === story.finalFileId);
  const log = story.includeReplay && final ? processLogFor(state.processLogs, final.id) : null;
  const service = getService(state.orders.find((item) => item.id === story.orderId)?.serviceId ?? "");
  if (!artist || !sketch?.preview || !final?.preview) return null;
  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-black/[0.07] bg-white">
      <Link href={`/process/${story.orderId}`} className="grid grid-cols-2 gap-px bg-mist" aria-label={`${service?.title ?? "Process story"} by @${artist.username}`}>
        <img src={sketch.preview} alt="" className="aspect-[4/5] w-full object-cover" />
        <img src={final.preview} alt="" className="aspect-[4/5] w-full object-cover" />
      </Link>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum">Process story</p>
        <h3 className="mt-1 font-bold">{service?.title ?? "Commission process"}</h3>
        <Link href={`/artists/${artist.id}`} className="mt-1 block text-sm text-black/55 hover:text-plum">@{artist.username}</Link>
        {story.caption ? <p className="mt-2 text-sm leading-6 text-black/65">{story.caption}</p> : null}
        {log && log.ops.length > 0 && final.preview ? (
          <div className="mt-3">
            <ReplayPlayer
              stillSrc={final.preview}
              alt=""
              processLog={log}
              reducedMotion
              onPlayed={() => dispatch({ type: "track-event", name: "replay_played", payload: { orderId: story.orderId } })}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DiscoverProcessStories() {
  const { state, hydrated } = useDemo();
  if (!hydrated) return null;
  const stories = state.processStories ?? [];
  if (!stories.length) return null;
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">Process</p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Sketch to final</h2>
      <p className="mt-2 max-w-2xl text-sm text-black/50">Public only when both people opted in. Briefs and messages stay off this page.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => <ProcessStoryCard key={story.id} story={story} />)}
      </div>
    </section>
  );
}
