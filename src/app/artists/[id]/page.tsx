import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageSquare, ShieldCheck, Star } from "@phosphor-icons/react/dist/ssr";
import { ArtworkCard } from "@/components/artwork-card";
import { StatusPill } from "@/components/status-pill";
import { TabNav } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";
import { SaveArtistButton } from "@/features/saves/save-button";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { WaitlistButton } from "@/features/waitlist/waitlist-button";
import { artists, getArtist, getArtistArt, getArtistPosts, getArtistReviews, getArtistServices, getArtwork } from "@/data/mock-data";
import type { ArtistProfileTab } from "@/types";
import { formatDate } from "@/lib/utils";

const tabs: { id: ArtistProfileTab; label: string }[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "posts", label: "Posts" },
  { id: "commissions", label: "Commissions" },
  { id: "reviews", label: "Reviews" },
  { id: "about", label: "About & rules" },
];

export function generateStaticParams() {
  return artists.map((artist) => ({ id: artist.id }));
}

export default async function ArtistProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const artist = getArtist(id);
  if (!artist) notFound();
  const requestedTab = (await searchParams).tab;
  const active = tabs.some((tab) => tab.id === requestedTab) ? requestedTab as ArtistProfileTab : "portfolio";
  const portfolio = getArtistArt(id);
  const artistServices = getArtistServices(id);
  const primaryService = artistServices[0];
  const lowestPrice = Math.min(...artistServices.map((service) => service.startingPrice), artist.startingPrice);

  return (
    <div>
      <section className="border-b border-black/5 bg-[#f3efe8]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
            <Image src={artist.avatar} alt={`${artist.displayName} avatar`} width={144} height={144} className="size-28 rounded-[2rem] object-cover ring-4 ring-white sm:size-36" />
            <div className="mt-5 flex-1 sm:ml-7 sm:mt-0">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-3xl font-bold tracking-tight">@{artist.username}</h1>
                {artist.accountType === "protected-teen" && <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-plum"><ShieldCheck size={15} weight="fill" />Parent supported</span>}
              </div>
              <p className="mt-1 text-lg text-black/60">{artist.displayName} · {artist.specialty}</p>
              <p className="mt-4 max-w-xl leading-7 text-black/65">{artist.bio}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm sm:justify-start">
                <span className="flex items-center gap-1 font-bold"><Star size={16} weight="fill" className="text-amber-400" />{artist.rating} rating</span>
                <span><strong>{artist.completedCommissions}</strong> completed</span>
                <span>From <strong>${lowestPrice}</strong></span>
                <span>{artist.responseTime}</span>
                <StatusPill status={artist.availability} slots={artist.slots} />
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">{artist.styles.map((style) => <span key={style} className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{style}</span>)}</div>
            </div>
            <div className="mt-6 flex w-full flex-col gap-2 sm:mt-0 sm:w-64">
              <SaveArtistButton artistId={artist.id} name={`@${artist.username}`} />
              {artist.availability === "waitlist" && primaryService ? <WaitlistButton artistId={artist.id} serviceId={primaryService.id} /> : null}
              {artist.availability !== "closed" && artist.availability !== "waitlist" && primaryService ? (
                <Link href={`/commissions/${primaryService.id}/request`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum">Request art</Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <TabNav items={tabs.map((tab) => ({ ...tab, href: `/artists/${artist.id}${tab.id === "portfolio" ? "" : `?tab=${tab.id}`}` }))} active={active} />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          {active === "portfolio" && (portfolio.length ? <div className="columns-2 gap-4">{portfolio.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} artist={artist} />)}</div> : <EmptyState icon={ImageSquare} title="No public portfolio yet" description="This artist has not published portfolio work." />)}
          {active === "posts" && <PostList artistId={id} />}
          {active === "commissions" && <ServiceList artistId={id} />}
          {active === "reviews" && <ReviewList artistId={id} />}
          {active === "about" && <AboutRules artistId={id} />}
        </div>
        <aside>
          <div className="rounded-3xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Commission services</h2><StatusPill status={artist.availability} /></div>
            {artistServices.length ? <div className="mt-3 divide-y divide-black/[0.07]">{artistServices.map((service) => <Link href={`/commissions/${service.id}`} key={service.id} className="block py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum"><h3 className="font-bold">{service.title}</h3><p className="mt-1 line-clamp-2 text-sm leading-5 text-black/50">{service.description}</p><div className="mt-3 flex items-center justify-between text-sm"><span className="text-black/45">{service.turnaround} · {service.revisions} revisions</span><strong>From ${service.startingPrice}</strong></div></Link>)}</div> : <p className="py-8 text-center text-sm text-black/45">No active services right now.</p>}
            <div className="mt-3"><AvailabilityCta availability={artist.availability} artistId={artist.id} serviceId={primaryService?.id} slots={artist.slots} href={primaryService ? `/commissions/${primaryService.id}/request` : undefined} /></div>
          </div>
          {artist.accountType === "protected-teen" && <div className="mt-4"><ProtectedAccountNotice /></div>}
        </aside>
      </section>
    </div>
  );
}

function PostList({ artistId }: { artistId: string }) {
  const items = getArtistPosts(artistId);
  if (!items.length) return <EmptyState icon={ImageSquare} title="No posts yet" description="Process notes and finished-work posts will appear here." />;
  return <div className="space-y-4">{items.map((post) => {
    const artwork = post.artworkId ? getArtwork(post.artworkId) : undefined;
    return (
      <article key={post.id} className="rounded-3xl border border-black/[0.07] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum">{post.postType.replace("-", " ")} · {formatDate(post.publishedAt)}</p>
        <p className="mt-3 leading-7 text-black/70">{post.body}</p>
        {artwork && <Link href={`/art/${artwork.id}`} className="mt-4 flex items-center gap-3 rounded-2xl bg-mist p-3 text-sm font-semibold hover:text-plum"><Image src={artwork.image} alt="" width={56} height={72} className="h-16 w-12 rounded-xl object-cover" />{artwork.title}</Link>}
      </article>
    );
  })}</div>;
}

function ServiceList({ artistId }: { artistId: string }) {
  const items = getArtistServices(artistId);
  if (!items.length) return <EmptyState icon={ImageSquare} title="No commission services" description="This artist has not published bookable services." />;
  return <div className="space-y-4">{items.map((service) => (
    <article key={service.id} className="rounded-3xl border border-black/[0.07] bg-white p-5">
      <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-bold">{service.title}</h3><StatusPill status={service.availability} slots={service.remainingSlots} /></div>
      <p className="mt-2 text-sm leading-6 text-black/60">{service.description}</p>
      <p className="mt-3 text-sm"><strong>From ${service.startingPrice}</strong> · {service.turnaround} · {service.revisions} revisions</p>
      <ul className="mt-3 list-disc pl-5 text-sm text-black/60">{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
      <Link href={`/commissions/${service.id}`} className="mt-4 inline-flex text-sm font-bold text-plum">View service →</Link>
    </article>
  ))}</div>;
}

function ReviewList({ artistId }: { artistId: string }) {
  const items = getArtistReviews(artistId);
  if (!items.length) return <EmptyState icon={Star} title="No reviews yet" description="Reviews appear after a completed commission." />;
  return <div className="space-y-4">{items.map((review) => (
    <article key={review.id} className="rounded-3xl border border-black/[0.07] bg-white p-5">
      <div className="flex items-center justify-between gap-3"><strong>{review.author}</strong><span className="flex items-center gap-1 text-sm font-bold"><Star size={14} weight="fill" className="text-amber-400" />{review.rating}</span></div>
      <p className="mt-1 text-xs text-black/45">{review.serviceTitle} · {formatDate(review.createdAt)}</p>
      <p className="mt-3 leading-7 text-black/70">{review.body}</p>
    </article>
  ))}</div>;
}

function AboutRules({ artistId }: { artistId: string }) {
  const artist = getArtist(artistId);
  if (!artist) return null;
  const rules = [
    ["Accepted subjects", artist.rules.acceptedSubjects.join(" · ")],
    ["Declined subjects", artist.rules.declinedSubjects.join(" · ")],
    ["Revision policy", artist.rules.revisionPolicy],
    ["Usage rights", artist.rules.usageRights],
    ["Communication", artist.rules.communicationBoundary],
    ["Response time", artist.rules.expectedResponseTime],
    ["Cancellation", artist.rules.cancellationPolicy],
  ];
  return <div className="space-y-4">{rules.map(([title, body]) => <section key={title} className="rounded-3xl bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-black/65">{body}</p></section>)}</div>;
}
