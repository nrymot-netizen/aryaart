"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-provider";
import { PageIntro } from "@/components/page-intro";
import { StatusPill } from "@/components/status-pill";
import { getArtistServices } from "@/data/mock-data";

export default function StudioServicesPage() {
  const { persona, state } = useDemo();
  if (persona.role !== "artist") {
    return <PageIntro eyebrow="Services" title="Switch into an artist" description="Studio services are the artist desk. Use the demo switcher to become LunaLines or SketchMaya." />;
  }
  const artistId = persona.artistId ?? "luna";
  const created = state.createdServices.filter((item) => item.artistId === artistId);
  const catalog = getArtistServices(artistId);
  return (
    <>
      <PageIntro eyebrow="Artist studio" title="Commission services" description="Catalog services stay on your profile. Anything you publish in this demo lives in this browser until you reset." />
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <Link href="/create/service" className="inline-flex min-h-11 items-center rounded-full bg-plum px-5 text-sm font-bold text-white">New service</Link>
        <h2 className="mt-8 text-lg font-bold">Published in this demo</h2>
        <div className="mt-3 divide-y divide-black/[0.07] rounded-3xl bg-white px-5">
          {created.length === 0 && <p className="py-6 text-sm text-black/45">No new services yet. Publish one from Create or after drawing a piece.</p>}
          {created.map((service) => (
            <Link key={service.id} href={`/commissions/${service.id}`} className="block py-4">
              <div className="flex items-start justify-between gap-3"><p className="font-bold">{service.title}</p><StatusPill status={service.availability} slots={service.remainingSlots} /></div>
              <p className="mt-1 text-sm text-black/50">From ${service.startingPrice} · {service.turnaround}</p>
            </Link>
          ))}
        </div>
        <h2 className="mt-8 text-lg font-bold">On your public profile</h2>
        <div className="mt-3 divide-y divide-black/[0.07] rounded-3xl bg-white px-5">
          {catalog.map((service) => (
            <Link key={service.id} href={`/commissions/${service.id}`} className="block py-4">
              <div className="flex items-start justify-between gap-3"><p className="font-bold">{service.title}</p><StatusPill status={service.availability} slots={service.remainingSlots} /></div>
              <p className="mt-1 text-sm text-black/50">From ${service.startingPrice} · {service.turnaround}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
