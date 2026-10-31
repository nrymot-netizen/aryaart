"use client";

import Link from "next/link";
import { ImageSquare, Lamp, Palette, PencilSimple, Plus, Sparkle, VideoCamera } from "@phosphor-icons/react";
import { PageIntro } from "@/components/page-intro";
import { useDemo } from "@/features/demo/demo-provider";
import { challengeDrawHref, getActiveChallenge } from "@/data/seed-challenges";

const options = [
  { href: "/create/draw", icon: PencilSimple, title: "Draw on Arya", detail: "Sketch and paint in the studio, then publish to your portfolio." },
  { href: "/create/draw?type=finished", icon: ImageSquare, title: "Finished artwork", detail: "Draw a polished piece and share it with your community." },
  { href: "/create/draw?type=sketch", icon: Palette, title: "Sketch / WIP", detail: "Draw in progress and bring people into the process." },
  { href: "/create/draw?type=process", icon: VideoCamera, title: "Process or timelapse", detail: "Draw the still and describe how the piece came together." },
  { href: "/create/draw?type=commission-example", icon: Sparkle, title: "Commission example", detail: "Draw an example so buyers understand what they can request." },
  { href: "/create/service", icon: Plus, title: "New commission service", detail: "Set your scope, pricing, and availability." },
];

export default function CreatePage() {
  const { persona, dispatch } = useDemo();
  const challenge = getActiveChallenge();
  return (
    <>
      <PageIntro eyebrow="Artist tools" title="What are you creating?" description={persona.role === "artist" ? "Draw on Arya, publish work, or turn a piece into a bookable service." : "Switch to an artist persona to draw and publish."} />
      <div className="mx-auto grid max-w-4xl gap-3 px-4 pb-8 sm:grid-cols-2 sm:px-6">
        <Link
          href={challengeDrawHref(challenge.id)}
          onClick={() => dispatch({ type: "track-event", name: "try_brief_clicked", payload: { challengeId: challenge.id } })}
          className="flex items-center gap-4 rounded-3xl border border-plum/20 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card sm:col-span-2"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-plum"><Lamp size={24} /></span>
          <span>
            <strong className="block">Enter {challenge.title}</strong>
            <span className="mt-1 block text-sm text-black/50">{challenge.brief}</span>
          </span>
        </Link>
        {options.map(({ href, icon: Icon, title, detail }) => (
          <Link key={title} href={href} className="flex items-center gap-4 rounded-3xl border border-black/[0.07] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-plum"><Icon size={24} /></span>
            <span><strong className="block">{title}</strong><span className="mt-1 block text-sm text-black/50">{detail}</span></span>
          </Link>
        ))}
      </div>
    </>
  );
}
