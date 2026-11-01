import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { challenges, getChallenge } from "@/data/seed-challenges";
import { ChallengeDetail } from "@/features/challenges/challenge-detail";

export function generateStaticParams() {
  return challenges.map((challenge) => ({ id: challenge.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const challenge = getChallenge(id);
  return { title: challenge?.title ?? "Challenge not found" };
}

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = getChallenge(id);
  if (!challenge) notFound();
  return <ChallengeDetail challenge={challenge} />;
}
