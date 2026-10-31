"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, PencilSimple } from "@phosphor-icons/react";
import { artists, getArtwork } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { StatusPill } from "@/components/status-pill";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";
import { Skeleton } from "@/components/ui/skeleton";
import { ArtworkMedia } from "@/components/artwork-media";
import { RequestWizard } from "@/features/commissions/request-wizard";
import { ViewTracker } from "@/features/demo/view-tracker";

export function CreatedServicePage({ id }: { id: string }) {
  const { state, hydrated } = useDemo();
  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4"><Skeleton className="h-16 w-2/3" /><Skeleton className="h-24 w-full" /></div>
        <Skeleton className="h-80 w-full rounded-4xl" />
      </div>
    );
  }
  const service = state.createdServices.find((item) => item.id === id);
  const artist = service ? artists.find((item) => item.id === service.artistId) : undefined;
  if (!service || !artist) notFound();
  const examples = service.exampleArtworkIds
    .map((artworkId) => state.createdArtworks.find((item) => item.id === artworkId) ?? getArtwork(artworkId))
    .filter(Boolean);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
      <ViewTracker name="service_selected" payload={{ serviceId: service.id }} />
      <div>
        <Link href={`/artists/${artist.id}`} className="text-sm font-bold text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">← @{artist.username}</Link>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl leading-[0.95] sm:text-7xl">{service.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-black/60">{service.description}</p>
        <div className="mt-10">
          <h2 className="text-xl font-bold">What’s included</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{service.includes.map((item) => <li key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4"><span className="grid size-7 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={15} weight="bold" /></span>{item}</li>)}</ul>
        </div>
        {examples.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold">Examples</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {examples.map((artwork) => artwork && (
                <Link key={artwork.id} href={`/art/${artwork.id}`} className="overflow-hidden rounded-3xl bg-mist">
                  <ArtworkMedia src={artwork.image} alt={artwork.title} width={400} height={500} className="h-auto w-full" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <aside className="h-fit rounded-4xl border border-black/[0.07] bg-white p-6 shadow-card">
        <StatusPill status={service.availability} slots={service.remainingSlots ?? artist.slots} />
        <p className="mt-5 text-sm text-black/45">Starting at</p>
        <p className="text-4xl font-bold">${service.startingPrice}</p>
        <div className="mt-6 space-y-3 border-y border-black/[0.07] py-5 text-sm">
          <p className="flex items-center justify-between"><span className="flex items-center gap-2 text-black/50"><Clock size={18} />Turnaround</span><strong>{service.turnaround}</strong></p>
          <p className="flex items-center justify-between"><span className="flex items-center gap-2 text-black/50"><PencilSimple size={18} />Revisions</span><strong>{service.revisions} included</strong></p>
          <p className="flex items-center justify-between"><span className="text-black/50">Usage</span><strong>{service.usageOptions.join(" / ")}</strong></p>
        </div>
        <div className="mt-6"><AvailabilityCta availability={service.availability} artistId={artist.id} serviceId={service.id} slots={service.remainingSlots ?? artist.slots} href={`/commissions/${service.id}/request`} /></div>
        <p className="mt-3 text-center text-xs text-black/40">No payment is taken until the artist accepts. This service exists in this browser demo.</p>
        {artist.accountType === "protected-teen" && <div className="mt-4"><ProtectedAccountNotice compact /></div>}
      </aside>
    </div>
  );
}

export function CreatedRequestPage({ id }: { id: string }) {
  const { state, hydrated } = useDemo();
  const service = state.createdServices.find((item) => item.id === id);
  const artist = service ? artists.find((item) => item.id === service.artistId) : undefined;
  if (!hydrated) return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-black/50">Loading service…</div>;
  if (!service || !artist) notFound();
  return <RequestWizard service={service} artist={artist} />;
}
