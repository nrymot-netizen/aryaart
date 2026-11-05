"use client";

import { useEffect } from "react";
import { PageIntro } from "@/components/page-intro";
import { useDemo } from "@/features/demo/demo-provider";
import { ChallengeEntryCard } from "@/features/challenges/challenge-entry-card";
import { TryBriefButton } from "@/features/challenges/try-brief-button";
import { eligibleChallengeEntries, isChallengeOpen, rankChallengeEntries } from "@/lib/domain/challenges";
import { formatDate } from "@/lib/utils";
import type { Challenge } from "@/types";

export function ChallengeDetail({ challenge }: { challenge: Challenge }) {
  const { state, hydrated, dispatch } = useDemo();
  useEffect(() => {
    if (!hydrated) return;
    dispatch({ type: "track-event", name: "challenge_opened", payload: { challengeId: challenge.id } });
  }, [challenge.id, dispatch, hydrated]);

  if (!hydrated) {
    return <div className="px-4 py-16 text-sm text-black/50">Loading the challenge…</div>;
  }

  const ranked = rankChallengeEntries(
    eligibleChallengeEntries(state.challengeEntries, challenge.id, state.createdArtworks, state.processLogs),
    state.savedArtworkIds,
  );
  const artworks = ranked.map((entry) => ({ entry, artwork: state.createdArtworks.find((item) => item.id === entry.artworkId) })).filter((item): item is { entry: typeof ranked[number]; artwork: NonNullable<(typeof state.createdArtworks)[number]> } => Boolean(item.artwork));

  return (
    <>
      <PageIntro
        eyebrow={isChallengeOpen(challenge) ? "Human-only challenge" : "Closed challenge"}
        title={challenge.title}
        description={challenge.brief}
      />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 pb-10 sm:px-6">
        <p className="text-sm text-black/45">
          {isChallengeOpen(challenge) ? "Open" : "Closed"} {formatDate(challenge.opensAt.slice(0, 10))} – {formatDate(challenge.closesAt.slice(0, 10))}. Arya Canvas only. Ranked by saves, not followers.
        </p>
        <TryBriefButton challenge={challenge} />
      </div>
      <section className="mx-auto max-w-[1480px] px-4 pb-20 sm:px-6 lg:px-10">
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-3xl">{artworks.length} {artworks.length === 1 ? "entry" : "entries"}</h2>
        {artworks.length ? (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {artworks.map(({ entry, artwork }) => <ChallengeEntryCard key={entry.id} artwork={artwork} entry={entry} />)}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-black/15 bg-white px-5 py-10 text-sm text-black/50">No public entries on this brief.</p>
        )}
      </section>
    </>
  );
}
