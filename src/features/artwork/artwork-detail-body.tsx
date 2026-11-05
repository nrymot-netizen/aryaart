"use client";

import { useEffect } from "react";
import Link from "next/link";
import { artworks, getArtist, getArtistServices, getRelatedArtworks } from "@/data/mock-data";
import { artistLabel, isVisitorArtist } from "@/lib/published/artist";
import { getChallenge } from "@/data/seed-challenges";
import { ArtworkStage } from "@/features/artwork/artwork-identity";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { TryBriefButton } from "@/features/challenges/try-brief-button";
import { drawBackPairHref, findDemoArtwork, pairForReply, pairsForSource } from "@/lib/domain/draw-back";
import { ArtworkCard } from "@/components/artwork-card";
import { ArtworkMedia } from "@/components/artwork-media";
import { StatusPill } from "@/components/status-pill";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";
import { formatDate, subjectLabel } from "@/lib/utils";
import { entryForArtwork } from "@/lib/domain/challenges";
import { useDemo } from "@/features/demo/demo-provider";
import { ViewTracker } from "@/features/demo/view-tracker";
import type { Artist, Artwork } from "@/types";

export function ArtworkDetailBody({ artwork, artist, related }: { artwork: Artwork; artist: Artist; related?: Artwork[] }) {
  const { state } = useDemo();
  const relatedWork = related ?? getRelatedArtworks(artwork);
  const primaryService = getArtistServices(artist.id)[0];
  const challengeEntry = entryForArtwork(state.challengeEntries ?? [], artwork.id);
  const challenge = challengeEntry ? getChallenge(challengeEntry.challengeId) : undefined;
  const replyPair = pairForReply(state.drawBacks ?? [], artwork.id);
  const replies = pairsForSource(state.drawBacks ?? [], artwork.id);
  useEffect(() => {
    document.title = `${artwork.title} — Arya Art`;
  }, [artwork.title]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <ViewTracker name="artwork_viewed" payload={{ artworkId: artwork.id }} />
      <Link href="/" className="text-sm font-bold text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">← Discover</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <ArtworkStage artwork={artwork} artistName={artist.displayName} />
        <div>
          {artwork.isNew && <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">New</p>}
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-[0.95] sm:text-6xl">{artwork.title}</h1>
          <Link href={`/artists/${artist.id}`} className="mt-4 inline-flex items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">
            <ArtworkMedia src={artist.avatar} alt="" width={48} height={48} className="size-12 rounded-2xl object-cover" />
            <span><strong className="block">{artistLabel(artist)}</strong><span className="text-sm text-black/50">{artist.specialty}</span></span>
          </Link>
          <p className="mt-5 text-base leading-7 text-black/65">{artwork.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Style</dt><dd className="font-bold">{artwork.style}</dd></div>
            <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Subject</dt><dd className="font-bold">{subjectLabel(artwork.subject)}</dd></div>
            {isVisitorArtist(artist.id) ? null : <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Starting at</dt><dd className="font-bold">${artwork.price}</dd></div>}
            <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Published</dt><dd className="font-bold">{formatDate(artwork.publishedAt)}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">{artwork.tags.map((tag) => <span key={tag} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-plum">#{tag}</span>)}</div>
          <p className="mt-4 text-xs text-black/45">Made with {artwork.tools.join(", ")}. {artwork.aiDisclosure ? "AI-assisted." : "No generative AI."} · {artwork.format}</p>
          {challenge && (
            <div className="mt-6 rounded-3xl border border-plum/15 bg-mist/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Entered {challenge.title}</p>
              <p className="mt-2 text-sm leading-6 text-black/60">{challenge.brief}</p>
              <div className="mt-4"><TryBriefButton challenge={challenge} /></div>
            </div>
          )}
          {replyPair && (
            <div className="mt-6 rounded-3xl border border-plum/15 bg-mist/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">This is a draw-back</p>
              <p className="mt-2 text-sm leading-6 text-black/60">Both replays play together on the pair page.</p>
              <Link href={drawBackPairHref(replyPair.id, { watch: true })} className="mt-4 inline-flex min-h-11 items-center font-bold text-plum">Watch the pair</Link>
            </div>
          )}
          {replies.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Drawn back</p>
              <ul className="mt-3 space-y-2">
                {replies.map((pair) => {
                  const reply = findDemoArtwork(state.createdArtworks, artworks, pair.replyArtworkId);
                  if (!reply) return null;
                  return (
                    <li key={pair.id}>
                      <Link href={drawBackPairHref(pair.id, { watch: true })} className="flex items-center gap-3 rounded-2xl bg-white p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">
                        <ArtworkMedia src={reply.image} alt="" width={56} height={70} className="h-14 w-11 rounded-xl object-cover" />
                        <span>
                          <strong className="block">{reply.title}</strong>
                          <span className="text-sm text-black/50">Watch both replays</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {isVisitorArtist(artist.id) ? (
            <div className="mt-8 rounded-3xl border border-black/[0.07] bg-white p-5">
              <h2 className="text-lg font-bold">Draw the next one</h2>
              <p className="mt-2 text-sm text-black/55">Open a blank canvas, or draw back this replay. The artist keeps the copyright.</p>
              <Link href="/create/draw" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-white">Start a drawing</Link>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-black/[0.07] bg-white p-5">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Commission this artist</h2><StatusPill status={artist.availability} slots={artist.slots} /></div>
              {primaryService && <p className="mt-2 text-sm text-black/50">{primaryService.title} from ${primaryService.startingPrice}</p>}
              <div className="mt-4"><AvailabilityCta availability={artist.availability} artistId={artist.id} serviceId={primaryService?.id} slots={artist.slots} href={primaryService ? `/commissions/${primaryService.id}/request` : `/artists/${artist.id}?tab=commissions`} /></div>
            </div>
          )}
          {artist.accountType === "protected-teen" && <div className="mt-4"><ProtectedAccountNotice compact /></div>}
        </div>
      </div>
      {relatedWork.length > 0 && (
        <section className="mt-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Related work</h2>
          <div className="mt-6 columns-2 gap-4 sm:columns-3">{relatedWork.map((item) => {
            const relatedArtist = getArtist(item.artistId);
            return relatedArtist ? <ArtworkCard key={item.id} artwork={item} artist={relatedArtist} /> : null;
          })}</div>
        </section>
      )}
    </div>
  );
}
