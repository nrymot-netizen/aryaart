import { ArtistCard } from "@/components/artist-card";
import { PageIntro } from "@/components/page-intro";
import { artists } from "@/data/mock-data";

export default function CommissionsPage() {
  return <><PageIntro eyebrow="Made for you" title="Commission an artist" description="Browse clear services, pricing, timelines, and availability—then send a structured request without the awkward back-and-forth." /><section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div></section></>;
}
