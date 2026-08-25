import { redirect } from "next/navigation";

export default async function CreateArtworkRedirect({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  redirect(type ? `/create/draw?type=${encodeURIComponent(type)}` : "/create/draw");
}
