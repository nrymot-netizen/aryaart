"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-provider";
import { challengeDrawHref } from "@/data/seed-challenges";
import { isChallengeOpen } from "@/lib/domain/challenges";
import type { Challenge } from "@/types";

export function TryBriefButton({ challenge, className = "" }: { challenge: Challenge; className?: string }) {
  const { dispatch } = useDemo();
  if (!isChallengeOpen(challenge)) return null;
  return (
    <Link
      href={challengeDrawHref(challenge.id)}
      onClick={() => dispatch({ type: "track-event", name: "try_brief_clicked", payload: { challengeId: challenge.id } })}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum ${className}`}
    >
      Try this brief
    </Link>
  );
}
