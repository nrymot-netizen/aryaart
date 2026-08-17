"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, SlidersHorizontal, Sparkle } from "@phosphor-icons/react";
import { artists, artworks } from "@/data/mock-data";
import { ArtworkCard } from "./artwork-card";
import { ArtistCard } from "./artist-card";

const filters = ["For you", "Anime", "Fantasy", "Cute", "Pixel art", "Comic", "Realism", "Under $50"];

export function DiscoverView() {
  const [activeFilter, setActiveFilter] = useState("For you");
  const [query, setQuery] = useState("");
  const visibleArt = useMemo(() => artworks.filter((art) => {
    const artist = artists.find((item) => item.id === art.artistId)!;
    const matchesFilter = activeFilter === "For you" || (activeFilter === "Under $50" ? art.price < 50 : art.style === activeFilter);
    const haystack = `${art.title} ${art.style} ${artist.username} ${artist.specialty}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [activeFilter, query]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/5 bg-[#f4f0ea]">
        <div className="absolute -left-24 -top-36 size-72 rounded-full bg-[#f1b6ad]/55 blur-3xl" /><div className="absolute -right-20 bottom-0 size-80 rounded-full bg-[#cfc0ef]/55 blur-3xl" />
        <div className="relative mx-auto max-w-[1480px] px-4 py-12 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-4xl text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-plum ring-1 ring-black/5"><Sparkle size={14} weight="fill" />Independent art, thoughtfully discovered</div><h1 className="text-balance font-[family-name:var(--font-display)] text-5xl leading-[0.94] tracking-[-0.03em] sm:text-7xl lg:text-[5.8rem]">Find art that feels<br className="hidden sm:block" /> like <em className="text-plum">you.</em></h1><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">Discover artists by what they create—not by how many followers they have. Commission something completely personal.</p></div>
          <div className="mx-auto mt-9 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2 pl-4 shadow-card ring-1 ring-black/5"><MagnifyingGlass size={22} className="shrink-0 text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none sm:text-base" placeholder="Search styles, subjects, or artists" aria-label="Search artwork" /><button className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white" aria-label="Open filters"><SlidersHorizontal size={20} /></button></div>
          <div className="no-scrollbar mx-auto mt-5 flex max-w-4xl gap-2 overflow-x-auto pb-1 sm:justify-center">{filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === filter ? "bg-ink text-white" : "bg-white/70 text-black/60 hover:bg-white"}`}>{filter}</button>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-coral">Ready when you are</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Artists accepting commissions</h2></div><button className="hidden text-sm font-bold text-plum sm:block">See all artists →</button></div>
        <div className="no-scrollbar -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">{artists.filter((artist) => artist.availability !== "closed").map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Made with intention</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">{activeFilter === "For you" ? "Recommended for you" : activeFilter}</h2></div><span className="text-sm text-black/45">{visibleArt.length} pieces</span></div>
        {visibleArt.length ? <div className="columns-2 gap-3 sm:columns-3 sm:gap-5 lg:columns-4">{visibleArt.map((artwork, index) => <ArtworkCard key={artwork.id} artwork={artwork} artist={artists.find((item) => item.id === artwork.artistId)!} priority={index < 2} />)}</div> : <div className="rounded-3xl bg-white px-6 py-20 text-center"><p className="text-lg font-bold">No artwork found</p><p className="mt-1 text-sm text-black/50">Try a different search or style.</p></div>}
      </section>

      <section className="mx-auto mb-10 max-w-[1400px] px-4 sm:px-6"><div className="overflow-hidden rounded-4xl bg-ink px-6 py-12 text-white sm:px-12 sm:py-16"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c7b4ff]">Discover someone new</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-6xl">Great art can come from anywhere.</h2><p className="mt-4 max-w-lg text-white/60">We rotate emerging artists into your feed so every creator has a real chance to be found.</p><button className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink">Surprise me</button></div></div></section>
    </div>
  );
}
