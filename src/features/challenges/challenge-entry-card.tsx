"use client";

import Link from "next/link";
import { BookmarkSimple } from "@phosphor-icons/react";
import { artists, getArtistServices } from "@/data/mock-data";
import { ArtworkMedia } from "@/components/artwork-media";
import { AvailabilityCta } from "@/features/commissions/availability-cta";
import { SaveArtworkButton } from "@/features/saves/save-button";
import { challengeSaveCount } from "@/lib/domain/challenges";
import { useDemo } from "@/features/demo/demo-provider";
import type { Artwork, ChallengeEntry } from "@/types";

export function ChallengeEntryCard({ artwork, entry }: { artwork: Artwork; entry: ChallengeEntry }) {
  const { state } = useDemo();
  const artist = artists.find((item) => item.id === artwork.artistId);
  if (!artist) return null;
  const service = getArtistServices(artist.id)[0];
  const saves = challengeSaveCount(entry, state.savedArtworkIds);
  const name = `${artwork.title} by @${artist.username}`;
  return (
    <article className="break-inside-avoid pb-5">
      <div className="relative overflow-hidden rounded-[1.4rem] bg-mist shadow-sm">
        <Link href={`/art/${artwork.id}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum" aria-label={name}>
          <ArtworkMedia src={artwork.image} alt="" width={700} height={860} className="h-auto w-full" />
        </Link>
        <SaveArtworkButton artworkId={artwork.id} title={artwork.title} className="absolute right-3 top-3" />
      </div>
      <div className="px-1 pt-3">
        <h3 className="font-bold leading-tight"><Link href={`/art/${artwork.id}`} className="hover:text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum">{artwork.title}</Link></h3>
        <Link href={`/artists/${artist.id}`} className="mt-1 block text-sm text-black/55 hover:text-plum">@{artist.username}</Link>
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-black/45"><BookmarkSimple size={14} weight="fill" />{saves} {saves === 1 ? "save" : "saves"}</p>
        <div className="mt-3">
          <AvailabilityCta
            compact
            requestLabel="Request this artist"
            availability={artist.availability}
            artistId={artist.id}
            serviceId={service?.id}
            slots={artist.slots}
            href={service ? `/commissions/${service.id}/request` : `/artists/${artist.id}?tab=commissions`}
          />
        </div>
      </div>
    </article>
  );
}
