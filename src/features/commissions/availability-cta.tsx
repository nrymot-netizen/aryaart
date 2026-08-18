import Link from "next/link";
import type { Availability } from "@/types";
import { getAvailabilityCta } from "@/lib/domain/availability";
import { WaitlistButton } from "@/features/waitlist/waitlist-button";

export function AvailabilityCta({ availability, artistId, serviceId, slots, href }: { availability: Availability; artistId: string; serviceId?: string; slots?: number; href?: string }) {
  const cta = getAvailabilityCta(availability, slots);

  if (cta.kind === "closed") {
    return <div><p className="rounded-full bg-black/10 px-5 py-3 text-center text-sm font-bold text-black/40">{cta.label}</p><p className="mt-2 text-center text-xs text-black/45">{cta.helper}</p></div>;
  }

  if (cta.kind === "waitlist" && serviceId) {
    return <div><WaitlistButton artistId={artistId} serviceId={serviceId} /><p className="mt-2 text-center text-xs text-black/45">{cta.helper}</p></div>;
  }

  if (cta.kind === "request") {
    return <div><Link href={href ?? "#"} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-plum px-5 py-3 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum">{cta.label}</Link><p className="mt-2 text-center text-xs text-black/45">{cta.helper}</p></div>;
  }

  return <p className="text-sm text-black/50">{cta.helper}</p>;
}
