"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { artworks, getArtist, getArtistServices } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { ReplayPlayer } from "@/features/artwork/replay-player";
import { DrawBackButton } from "@/features/artwork/draw-back-button";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { findDemoArtwork, publicDrawBacks } from "@/lib/domain/draw-back";
import { processLogFor } from "@/lib/domain/process-log";
import { StatusPill } from "@/components/status-pill";

export function DrawBackPairBody() {
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

  if (!hydrated) return <div className="px-4 py-16 text-sm text-black/50">Loading draw-back…</div>;

  const catalog = [...state.createdArtworks, ...artworks];
  const pair = publicDrawBacks(state.drawBacks ?? [], catalog, state.processLogs).find((item) => item.id === params.id);
  const source = pair ? findDemoArtwork(state.createdArtworks, artworks, pair.sourceArtworkId) : undefined;
  const reply = pair ? findDemoArtwork(state.createdArtworks, artworks, pair.replyArtworkId) : undefined;
  const sourceArtist = source ? getArtist(source.artistId) : undefined;
  const replyArtist = reply ? getArtist(reply.artistId) : undefined;
  const sourceLog = source ? processLogFor(state.processLogs, source.id) : null;
  const replyLog = reply ? processLogFor(state.processLogs, reply.id) : null;

  if (!pair || !source || !reply || !sourceArtist || !replyArtist || !sourceLog || !replyLog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">No public draw-back</h1>
        <p className="mt-2 text-black/50">Pairs stay public only when both pieces were drawn on Arya.</p>
        <Link href="/" className="mt-4 inline-block font-bold text-plum">Return to Discover</Link>
      </div>
    );
  }

  const replyService = getArtistServices(replyArtist.id)[0];
  const sourceService = getArtistServices(sourceArtist.id)[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm font-bold text-plum">← Discover</Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-plum">Draw-back</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl leading-none">{reply.title}</h1>
      <p className="mt-3 max-w-2xl text-black/55">
        @{replyArtist.username} drew back @{sourceArtist.username}. Watch both pieces get drawn. Request the artist.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <figure>
          <ReplayPlayer
            stillSrc={source.image}
            alt={source.title}
            processLog={sourceLog}
            reducedMotion={reducedMotion}
            onPlayed={() => dispatch({ type: "track-event", name: "replay_played", payload: { artworkId: source.id } })}
            onCompleted={() => dispatch({ type: "track-event", name: "replay_completed", payload: { artworkId: source.id } })}
          />
          <figcaption className="mt-2 text-sm text-black/55">
            <strong className="text-ink">{source.title}</strong>
            {" · "}
            <Link href={`/artists/${sourceArtist.id}`} className="font-bold text-plum">@{sourceArtist.username}</Link>
          </figcaption>
        </figure>
        <figure>
          <ReplayPlayer
            stillSrc={reply.image}
            alt={reply.title}
            processLog={replyLog}
            reducedMotion={reducedMotion}
            onPlayed={() => dispatch({ type: "track-event", name: "replay_played", payload: { artworkId: reply.id } })}
            onCompleted={() => dispatch({ type: "track-event", name: "replay_completed", payload: { artworkId: reply.id } })}
          />
          <figcaption className="mt-2 text-sm text-black/55">
            <strong className="text-ink">{reply.title}</strong>
            {" · "}
            <Link href={`/artists/${replyArtist.id}`} className="font-bold text-plum">@{replyArtist.username}</Link>
          </figcaption>
        </figure>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <DrawBackButton artworkId={reply.id} />
        <Link href={`/art/${reply.id}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-mist px-5 py-3 text-sm font-bold text-plum">
          Open the reply
        </Link>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <RequestCard
          artistId={replyArtist.id}
          username={replyArtist.username}
          availability={replyArtist.availability}
          slots={replyArtist.slots}
          serviceId={replyService?.id}
          serviceTitle={replyService?.title}
          startingPrice={replyService?.startingPrice}
        />
        <RequestCard
          artistId={sourceArtist.id}
          username={sourceArtist.username}
          availability={sourceArtist.availability}
          slots={sourceArtist.slots}
          serviceId={sourceService?.id}
          serviceTitle={sourceService?.title}
          startingPrice={sourceService?.startingPrice}
        />
      </div>
    </div>
  );
}

function RequestCard({
  artistId,
  username,
  availability,
  slots,
  serviceId,
  serviceTitle,
  startingPrice,
}: {
  artistId: string;
  username: string;
  availability: "open" | "limited" | "waitlist" | "closed";
  slots?: number;
  serviceId?: string;
  serviceTitle?: string;
  startingPrice?: number;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.07] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Request @{username}</h2>
        <StatusPill status={availability} slots={slots} />
      </div>
      {serviceTitle && startingPrice != null && <p className="mt-2 text-sm text-black/50">{serviceTitle} from ${startingPrice}</p>}
      <div className="mt-4">
        <AvailabilityCta
          availability={availability}
          artistId={artistId}
          serviceId={serviceId}
          slots={slots}
          href={serviceId ? `/commissions/${serviceId}/request` : `/artists/${artistId}?tab=commissions`}
        />
      </div>
    </div>
  );
}
