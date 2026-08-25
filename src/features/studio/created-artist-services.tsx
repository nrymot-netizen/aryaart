"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-provider";
import { StatusPill } from "@/components/status-pill";

export function CreatedArtistServices({ artistId }: { artistId: string }) {
  const { state, hydrated } = useDemo();
  if (!hydrated) return null;
  const items = (state.createdServices ?? []).filter((service) => service.artistId === artistId);
  if (!items.length) return null;
  return (
    <div className="mb-4 space-y-4">
      {items.map((service) => (
        <article key={service.id} className="rounded-3xl border border-plum/15 bg-white p-5">
          <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-bold">{service.title}</h3><StatusPill status={service.availability} slots={service.remainingSlots} /></div>
          <p className="mt-2 text-sm leading-6 text-black/60">{service.description}</p>
          <p className="mt-3 text-sm"><strong>From ${service.startingPrice}</strong> · {service.turnaround} · {service.revisions} revisions</p>
          <Link href={`/commissions/${service.id}`} className="mt-4 inline-flex text-sm font-bold text-plum">View service →</Link>
        </article>
      ))}
    </div>
  );
}
