"use client";

import Link from "next/link";
import { CurrencyDollar, Eye, PaintBrush, TrendUp } from "@phosphor-icons/react";
import { artists, getService } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { calculateSimulatedBalance } from "@/lib/domain/ledger";
import { orderStatusLabel } from "@/lib/domain/orders";
import { PageIntro } from "@/components/page-intro";
import { PersonaContextBanner } from "@/features/demo/persona-context-banner";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";

export default function StudioPage() {
  const { state, persona, dispatch } = useDemo();
  if (persona.role !== "artist") {
    return (
      <>
        <PageIntro eyebrow="Artist studio" title="Switch into an artist" description="Studio is the artist desk. Use the demo switcher to become LunaLines or SketchMaya." />
        <PersonaContextBanner />
      </>
    );
  }
  const artistId = persona.artistId ?? "luna";
  const artist = artists.find((item) => item.id === artistId);
  const availability = state.artistAvailability[artistId]?.availability ?? artist?.availability ?? "open";
  const slots = state.artistAvailability[artistId]?.slots ?? artist?.slots;
  const balance = calculateSimulatedBalance(state.ledger, artistId);
  const incoming = state.orders.filter((order) => order.artistId === artistId && order.status === "awaiting-artist");
  const active = state.orders.filter((order) => order.artistId === artistId && ["payment-required", "in-progress", "sketch-review", "final-review"].includes(order.status));
  const created = state.createdArtworks.filter((item) => item.artistId === artistId);

  return (
    <>
      <PageIntro eyebrow="Artist studio" title="Your creative business" description="Requests, availability, simulated earnings, and new work — all on one desk." />
      <PersonaContextBanner />
      <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {[{ icon: CurrencyDollar, label: "Available balance", value: `$${balance.available.toFixed(2)}` }, { icon: TrendUp, label: "Pending", value: `$${balance.pending.toFixed(2)}` }, { icon: PaintBrush, label: "Active projects", value: String(active.length) }, { icon: Eye, label: "New works in demo", value: String(created.length) }].map(({ icon: Icon, label, value }) => <div key={label} className="rounded-3xl border border-black/[0.07] bg-white p-5"><Icon size={22} className="text-plum" /><p className="mt-6 text-sm text-black/50">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight">{value}</p></div>)}
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <section className="rounded-4xl bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Availability</h2><StatusPill status={availability} slots={slots} /></div>
          <div className="mt-4 flex flex-wrap gap-2">{(["open", "limited", "waitlist", "closed"] as const).map((item) => <Button key={item} variant={availability === item ? "primary" : "ghost"} onClick={() => dispatch({ type: "update-availability", artistId, availability: item, slots: item === "limited" ? slots ?? 1 : undefined })}>{item}</Button>)}</div>
          {artistId === "maya" && <Button className="mt-4 w-full" variant="secondary" onClick={() => dispatch({ type: "load-scenario", scenario: "maya-open-slot" })}>Open a slot and promote waitlist</Button>}
        </section>
        <section className="rounded-4xl bg-white p-5">
          <h2 className="font-bold">Demo shortcuts</h2>
          <p className="mt-2 text-sm text-black/50">Jump reviewers into a live Luna request without editing state by hand.</p>
          <Button className="mt-4 w-full" onClick={() => dispatch({ type: "load-scenario", scenario: "luna-incoming" })}>Load Luna incoming request</Button>
          <Link href="/create" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-mist text-sm font-bold text-plum">Create artwork or a service</Link>
        </section>
        <section className="rounded-4xl bg-white p-5 lg:col-span-2">
          <h2 className="font-bold">Incoming requests</h2>
          <div className="mt-3 divide-y divide-black/[0.07]">
            {incoming.length === 0 && <p className="py-6 text-sm text-black/45">No incoming requests. Load the Luna scenario or wait for a buyer.</p>}
            {incoming.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="block py-4"><p className="font-bold">{getService(order.serviceId)?.title}</p><p className="text-sm text-black/50">{orderStatusLabel[order.status]} · ${order.estimatedPrice}</p></Link>)}
          </div>
          <h2 className="mt-6 font-bold">Active projects</h2>
          <div className="mt-3 divide-y divide-black/[0.07]">
            {active.length === 0 && <p className="py-6 text-sm text-black/45">No active projects yet.</p>}
            {active.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="block py-4"><p className="font-bold">{getService(order.serviceId)?.title}</p><p className="text-sm text-black/50">{orderStatusLabel[order.status]} · ${order.price}</p></Link>)}
          </div>
        </section>
      </div>
    </>
  );
}
