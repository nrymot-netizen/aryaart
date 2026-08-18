"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";
import type { Artwork, Artist } from "@/types";
import { formatNumber } from "@/lib/utils";
import { SaveArtworkButton } from "@/features/saves/save-button";

export function ArtworkCard({ artwork, artist, priority = false }: { artwork: Artwork; artist: Artist; priority?: boolean }) {
  return (
    <article className="group break-inside-avoid pb-5">
      <div className="relative overflow-hidden rounded-[1.4rem] bg-mist shadow-sm">
        <Link href={`/art/${artwork.id}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum">
          <Image src={artwork.image} alt={artwork.title} width={700} height={860} priority={priority} className="h-auto w-full transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        </Link>
        {artwork.isNew && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold backdrop-blur">New</span>}
        <SaveArtworkButton artworkId={artwork.id} title={artwork.title} className="absolute right-3 top-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100" />
      </div>
      <div className="flex items-start justify-between gap-3 px-1 pt-3">
        <div>
          <h3 className="font-bold leading-tight"><Link href={`/art/${artwork.id}`} className="hover:text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">{artwork.title}</Link></h3>
          <Link href={`/artists/${artist.id}`} className="mt-1 block text-sm text-black/55 hover:text-plum">@{artist.username}</Link>
        </div>
        <span className="flex items-center gap-1 pt-0.5 text-xs font-semibold text-black/50"><Heart size={14} weight="fill" />{formatNumber(artwork.likes)}</span>
      </div>
    </article>
  );
}
