"use client";

import { Heart } from "@phosphor-icons/react";
import { useDemo } from "@/features/demo/demo-provider";

export function SaveArtworkButton({ artworkId, title, className = "" }: { artworkId: string; title: string; className?: string }) {
  const { state, dispatch } = useDemo();
  const saved = state.savedArtworkIds.includes(artworkId);
  return (
    <button type="button" onClick={() => dispatch({ type: "toggle-save-artwork", id: artworkId })} aria-pressed={saved} className={`grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum ${className}`} aria-label={saved ? `Unsave ${title}` : `Save ${title}`}>
      <Heart size={18} weight={saved ? "fill" : "bold"} className={saved ? "text-coral" : ""} />
    </button>
  );
}

export function SaveArtistButton({ artistId, name, compact = false }: { artistId: string; name: string; compact?: boolean }) {
  const { state, dispatch } = useDemo();
  const saved = state.savedArtistIds.includes(artistId);
  return (
    <button type="button" onClick={() => dispatch({ type: "toggle-save-artist", id: artistId })} aria-pressed={saved} className={compact ? "grid size-10 place-items-center rounded-full border border-black/10 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum" : "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold sm:flex-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum"} aria-label={saved ? `Unsave ${name}` : `Save ${name}`}>
      <Heart size={18} weight={saved ? "fill" : "bold"} className={saved ? "text-coral" : ""} />
      {!compact && (saved ? "Saved" : "Save")}
    </button>
  );
}
