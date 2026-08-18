import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Clock, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { artists, getArtwork, services } from "@/data/mock-data";
import { StatusPill } from "@/components/status-pill";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = services.find((item) => item.id === id);
  if (!service) notFound();
  const artist = artists.find((item) => item.id === service.artistId);
  if (!artist) notFound();
  const examples = service.exampleArtworkIds.map((artworkId) => getArtwork(artworkId)).filter(Boolean);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
      <div>
        <Link href={`/artists/${artist.id}`} className="text-sm font-bold text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">← @{artist.username}</Link>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-none sm:text-7xl">{service.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-black/60">{service.description}</p>
        <div className="mt-10">
          <h2 className="text-xl font-bold">What’s included</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{service.includes.map((item) => <li key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4"><span className="grid size-7 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={15} weight="bold" /></span>{item}</li>)}</ul>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div><h2 className="text-lg font-bold">Not included</h2><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-black/60">{service.exclusions.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><h2 className="text-lg font-bold">Deliverables</h2><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-black/60">{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
        {service.addOns.length > 0 && <div className="mt-10"><h2 className="text-lg font-bold">Add-ons</h2><ul className="mt-3 divide-y divide-black/[0.07] rounded-3xl bg-white">{service.addOns.map((addOn) => <li key={addOn.id} className="flex items-center justify-between px-4 py-3 text-sm"><span>{addOn.name}</span><strong>+${addOn.price}</strong></li>)}</ul></div>}
        {examples.length > 0 && <div className="mt-10"><h2 className="text-lg font-bold">Examples</h2><div className="mt-4 grid grid-cols-2 gap-3">{examples.map((artwork) => artwork && <Link key={artwork.id} href={`/art/${artwork.id}`} className="overflow-hidden rounded-3xl bg-mist"><Image src={artwork.image} alt={artwork.title} width={400} height={500} className="h-auto w-full" /></Link>)}</div></div>}
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
        <p className="mt-3 text-center text-xs text-black/40">No payment is taken until the artist accepts.</p>
        {artist.accountType === "protected-teen" && <div className="mt-4"><ProtectedAccountNotice compact /></div>}
      </aside>
    </div>
  );
}
