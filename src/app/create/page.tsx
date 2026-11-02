"use client";

import Link from "next/link";
import { ImageSquare, Palette, PencilSimple, Plus, Sparkle, VideoCamera } from "@phosphor-icons/react";
import { PageIntro } from "@/components/page-intro";
import { useDemo } from "@/features/demo/demo-provider";

const drawOptions = [
  { href: "/create/draw", icon: PencilSimple, title: "Draw on Arya", detail: "Sketch and paint in the studio, then publish to your portfolio." },
  { href: "/create/draw?type=finished", icon: ImageSquare, title: "Finished artwork", detail: "Draw a polished piece and share it." },
  { href: "/create/draw?type=sketch", icon: Palette, title: "Sketch / WIP", detail: "Draw in progress and bring people into the process." },
  { href: "/create/draw?type=process", icon: VideoCamera, title: "Process or timelapse", detail: "Draw the still and describe how the piece came together." },
  { href: "/create/draw?type=commission-example", icon: Sparkle, title: "Commission example", detail: "Draw an example so buyers understand what they can request." },
];

export default function CreatePage() {
  const { persona } = useDemo();
  const canOfferServices = persona.role === "artist" && persona.artistId && persona.artistId !== "you";
  return (
    <>
      <PageIntro eyebrow="Create" title="Draw something" description="Anyone can draw on Arya in this browser. Work stays on this device. Commission services stay with the seeded artists." />
      <div className="mx-auto grid max-w-4xl gap-3 px-4 pb-8 sm:grid-cols-2 sm:px-6">
        {drawOptions.map(({ href, icon: Icon, title, detail }) => (
          <Link key={title} href={href} className="flex items-center gap-4 rounded-3xl border border-black/[0.07] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-plum"><Icon size={24} /></span>
            <span><strong className="block">{title}</strong><span className="mt-1 block text-sm text-black/50">{detail}</span></span>
          </Link>
        ))}
        {canOfferServices && (
          <Link href="/create/service" className="flex items-center gap-4 rounded-3xl border border-black/[0.07] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-plum"><Plus size={24} /></span>
            <span><strong className="block">New commission service</strong><span className="mt-1 block text-sm text-black/50">Set your scope, pricing, and availability.</span></span>
          </Link>
        )}
      </div>
    </>
  );
}
