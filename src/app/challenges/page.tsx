import { redirect } from "next/navigation";
import { getActiveChallenge } from "@/data/seed-challenges";

export default function ChallengesIndexPage() {
  redirect(`/challenges/${getActiveChallenge().id}`);
}
