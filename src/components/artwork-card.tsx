"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";
import type { Artwork, Artist } from "@/types";
import { formatNumber } from "@/lib/utils";

export function ArtworkCard({ artwork, artist, priority = false }: { artwork: Artwork; artist: Artist; priority?: boolean }) {
  return (
    <article className="group break-inside-avoid pb-5">
      <Link href={`/artists/${artist.id}`} className="relative block overflow-hidden rounded-[1.4rem] bg-mist shadow-sm">
        <Image src={artwork.image} alt={artwork.title} width={700} height={860} priority={priority} className="h-auto w-full transition duration-500 group-hover:scale-[1.025]" />
        {artwork.isNew && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold backdrop-blur">New</span>}
        <button onClick={(event) => event.preventDefault()} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/85 opacity-0 backdrop-blur transition group-hover:opacity-100 focus:opacity-100" aria-label={`Save ${artwork.title}`}><Heart size={19} weight="bold" /></button>
      </Link>
      <div className="flex items-start justify-between gap-3 px-1 pt-3">
        <div><h3 className="font-bold leading-tight">{artwork.title}</h3><Link href={`/artists/${artist.id}`} className="mt-1 block text-sm text-black/55 hover:text-plum">@{artist.username}</Link></div>
        <span className="flex items-center gap-1 pt-0.5 text-xs font-semibold text-black/50"><Heart size={14} weight="fill" />{formatNumber(artwork.likes)}</span>
      </div>
    </article>
  );
}
