"use client";

import Link from "next/link";
import { PencilSimple, Plus } from "@phosphor-icons/react";
import { PageIntro } from "@/components/page-intro";
import { useDemo } from "@/features/demo/demo-provider";

export default function CreatePage() {
  const { persona } = useDemo();
  const canOfferServices = persona.role === "artist" && persona.artistId && persona.artistId !== "you";
  return (
    <>
      <PageIntro eyebrow="Create" title="Draw something" description="Open the studio, make a piece, and publish it. No generative AI in the canvas." />
      <div className="mx-auto grid max-w-2xl gap-3 px-4 pb-8 sm:px-6">
        <Link href="/create/draw" className="flex items-center gap-4 rounded-3xl border border-black/[0.07] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-plum"><PencilSimple size={24} /></span>
          <span>
            <strong className="block">Draw on Arya</strong>
            <span className="mt-1 block text-sm text-black/50">Sketch, paint, and publish. Uploads can wait until after you have a still.</span>
          </span>
        </Link>
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
