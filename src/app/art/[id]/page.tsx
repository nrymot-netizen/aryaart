import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { artists, artworks, getArtistServices, getRelatedArtworks } from "@/data/mock-data";
import { getArtworkPage } from "@/lib/dal/catalog";
import { SaveArtworkButton } from "@/features/saves/save-button";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { ArtworkCard } from "@/components/artwork-card";
import { StatusPill } from "@/components/status-pill";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";
import { formatDate, subjectLabel } from "@/lib/utils";

export function generateStaticParams() {
  return artworks.map((artwork) => ({ id: artwork.id }));
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = getArtworkPage(id);
  if (!page) notFound();
  const { artwork, artist } = page;
  const related = getRelatedArtworks(artwork);
  const primaryService = getArtistServices(artist.id)[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm font-bold text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">← Discover</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-mist">
          <Image src={artwork.image} alt={artwork.title} width={900} height={1100} priority className="h-auto w-full" />
          <SaveArtworkButton artworkId={artwork.id} title={artwork.title} className="absolute right-4 top-4" />
        </div>
        <div>
          {artwork.isNew && <p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">New</p>}
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl leading-none sm:text-6xl">{artwork.title}</h1>
          <Link href={`/artists/${artist.id}`} className="mt-4 inline-flex items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">
            <Image src={artist.avatar} alt="" width={48} height={48} className="size-12 rounded-2xl" />
            <span><strong className="block">@{artist.username}</strong><span className="text-sm text-black/50">{artist.specialty}</span></span>
          </Link>
          <p className="mt-5 text-base leading-7 text-black/65">{artwork.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Style</dt><dd className="font-bold">{artwork.style}</dd></div>
            <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Subject</dt><dd className="font-bold">{subjectLabel(artwork.subject)}</dd></div>
            <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Starting at</dt><dd className="font-bold">${artwork.price}</dd></div>
            <div className="rounded-2xl bg-white p-3"><dt className="text-black/45">Published</dt><dd className="font-bold">{formatDate(artwork.publishedAt)}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">{artwork.tags.map((tag) => <span key={tag} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-plum">#{tag}</span>)}</div>
          <p className="mt-4 text-xs text-black/45">Made with {artwork.tools.join(", ")}{artwork.aiDisclosure ? ". AI-assisted." : ". No generative AI."} · {artwork.format}</p>
          <div className="mt-8 rounded-3xl border border-black/[0.07] bg-white p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Commission this artist</h2><StatusPill status={artist.availability} slots={artist.slots} /></div>
            {primaryService && <p className="mt-2 text-sm text-black/50">{primaryService.title} from ${primaryService.startingPrice}</p>}
            <div className="mt-4"><AvailabilityCta availability={artist.availability} artistId={artist.id} serviceId={primaryService?.id} slots={artist.slots} href={primaryService ? `/commissions/${primaryService.id}/request` : `/artists/${artist.id}?tab=commissions`} /></div>
          </div>
          {artist.accountType === "protected-teen" && <div className="mt-4"><ProtectedAccountNotice compact /></div>}
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Related work</h2>
          <div className="mt-6 columns-2 gap-4 sm:columns-3">{related.map((item) => {
            const relatedArtist = artists.find((entry) => entry.id === item.artistId);
            return relatedArtist ? <ArtworkCard key={item.id} artwork={item} artist={relatedArtist} /> : null;
          })}</div>
        </section>
      )}
    </div>
  );
}
