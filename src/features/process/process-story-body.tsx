"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getArtist, getService } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { ReplayPlayer } from "@/features/artwork/replay-player";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { processLogFor } from "@/lib/domain/process-log";
import { StatusPill } from "@/components/status-pill";

export function ProcessStoryBody() {
  const params = useParams<{ id: string }>();
  const { state, hydrated, dispatch } = useDemo();
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  if (!hydrated) return <div className="px-4 py-16 text-sm text-black/50">Loading process story…</div>;
  const story = (state.processStories ?? []).find((item) => item.orderId === params.id || item.id === params.id);
  if (!story) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">No public process story</h1>
        <p className="mt-2 text-black/50">This stays private unless both the buyer and artist opt in.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center font-bold text-plum">Return to Discover</Link>
          <Link href="/draw-back/dback-lantern-paper?watch=1" className="inline-flex min-h-11 items-center font-bold text-plum">Watch a draw-back</Link>
        </div>
      </div>
    );
  }
  const artist = getArtist(story.artistId);
  const sketch = state.files.find((item) => item.id === story.sketchFileId);
  const final = state.files.find((item) => item.id === story.finalFileId);
  const log = story.includeReplay && final ? processLogFor(state.processLogs, final.id) : null;
  const order = state.orders.find((item) => item.id === story.orderId);
  const service = order ? getService(order.serviceId) : undefined;
  if (!artist || !sketch?.preview || !final?.preview) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">This story is missing files</h1></div>;
  }
  const primaryService = service;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm font-bold text-plum">← Discover</Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-plum">Process story</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-[0.95] sm:text-5xl">{service?.title ?? "Sketch to final"}</h1>
      <p className="mt-3 text-black/55">@{artist.username} · Public stills only. The brief and messages are not shown.</p>
      {story.caption ? <p className="mt-5 max-w-2xl text-base leading-7 text-black/70">{story.caption}</p> : null}
      <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-4">
        <figure>
          <img src={sketch.preview} alt="Sketch still" className="w-full rounded-[1.6rem] bg-mist" />
          <figcaption className="mt-2 text-sm font-bold text-black/50">Sketch</figcaption>
        </figure>
        <figure>
          {log && log.ops.length > 0 ? (
            <ReplayPlayer
              stillSrc={final.preview}
              alt="Final still"
              processLog={log}
              reducedMotion={reducedMotion}
              onPlayed={() => dispatch({ type: "track-event", name: "replay_played", payload: { orderId: story.orderId } })}
              onCompleted={() => dispatch({ type: "track-event", name: "replay_completed", payload: { orderId: story.orderId } })}
            />
          ) : (
            <img src={final.preview} alt="Final still" className="w-full rounded-[1.6rem] bg-mist" />
          )}
          <figcaption className="mt-2 text-sm font-bold text-black/50">Final</figcaption>
        </figure>
      </div>
      <div className="mt-10 max-w-md rounded-3xl border border-black/[0.07] bg-white p-5">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Commission this artist</h2><StatusPill status={artist.availability} slots={artist.slots} /></div>
        {primaryService && <p className="mt-2 text-sm text-black/50">{primaryService.title} from ${primaryService.startingPrice}</p>}
        <div className="mt-4">
          <AvailabilityCta availability={artist.availability} artistId={artist.id} serviceId={primaryService?.id} slots={artist.slots} href={primaryService ? `/commissions/${primaryService.id}/request` : `/artists/${artist.id}?tab=commissions`} />
        </div>
      </div>
    </div>
  );
}
