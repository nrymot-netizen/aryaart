"use client";

import Link from "next/link";
import { ImageSquare, Palette, Plus, Sparkle, VideoCamera } from "@phosphor-icons/react";
import { PageIntro } from "@/components/page-intro";
import { useDemo } from "@/features/demo/demo-provider";

const options = [
  { href: "/create/artwork?type=finished", icon: ImageSquare, title: "Finished artwork", detail: "Share a polished piece with your community." },
  { href: "/create/artwork?type=sketch", icon: Palette, title: "Sketch / WIP", detail: "Bring people into your creative process." },
  { href: "/create/artwork?type=process", icon: VideoCamera, title: "Process or timelapse", detail: "Show how a piece came together." },
  { href: "/create/artwork?type=commission-example", icon: Sparkle, title: "Commission example", detail: "Help buyers understand what they can request." },
  { href: "/create/service", icon: Plus, title: "New commission service", detail: "Set your scope, pricing, and availability." },
];

export default function CreatePage() {
  const { persona } = useDemo();
  return (
    <>
      <PageIntro eyebrow="Artist tools" title="What are you creating?" description={persona.role === "artist" ? "Post new work or turn a piece into a bookable service." : "Switch to an artist persona to publish."} />
      <div className="mx-auto grid max-w-4xl gap-3 px-4 pb-20 sm:grid-cols-2 sm:px-6">
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
