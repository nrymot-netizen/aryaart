"use client";

import Link from "next/link";
import { Lamp } from "@phosphor-icons/react";
import { getActiveChallenge } from "@/data/seed-challenges";
import { useDemo } from "@/features/demo/demo-provider";
import { ChallengeEntryCard } from "@/features/challenges/challenge-entry-card";
import { TryBriefButton } from "@/features/challenges/try-brief-button";
import { eligibleChallengeEntries, rankChallengeEntries } from "@/lib/domain/challenges";

export function DiscoverChallenge() {
  const { state, hydrated } = useDemo();
  if (!hydrated) return null;
  const challenge = getActiveChallenge();
  const ranked = rankChallengeEntries(
    eligibleChallengeEntries(state.challengeEntries, challenge.id, state.createdArtworks, state.processLogs),
    state.savedArtworkIds,
  ).slice(0, 4);
  const artworks = ranked.map((entry) => ({ entry, artwork: state.createdArtworks.find((item) => item.id === entry.artworkId) })).filter((item): item is { entry: typeof ranked[number]; artwork: NonNullable<(typeof state.createdArtworks)[number]> } => Boolean(item.artwork));
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">Human-only challenge</p>
          <h2 className="mt-1 flex items-center gap-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl"><Lamp size={28} className="text-plum" />{challenge.title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/60">{challenge.brief}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TryBriefButton challenge={challenge} />
          <Link href={`/challenges/${challenge.id}`} className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum">See all entries</Link>
        </div>
      </div>
      <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4">
        {artworks.map(({ entry, artwork }) => <ChallengeEntryCard key={entry.id} artwork={artwork} entry={entry} />)}
      </div>
    </section>
  );
}
