"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, SlidersHorizontal, X } from "@phosphor-icons/react";
import type { DiscoveryFilters } from "@/types";
import { AVAILABILITY_OPTIONS, BUDGET_BANDS, FORMAT_OPTIONS, STYLE_OPTIONS, SUBJECT_OPTIONS, TURNAROUND_BANDS, USAGE_OPTIONS, hasActiveFilters, serializeDiscoverySearchParams } from "@/lib/domain/discovery";
import { Checkbox, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { availabilityLabel } from "@/lib/utils";

const chips = ["For you", "Anime", "Fantasy", "Cute", "Pixel art", "Comic", "Realism", "Under $50"];

export function SearchFilters({ filters, action = "/", showAdvanced = false }: { filters: DiscoveryFilters; action?: string; showAdvanced?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.q);
  const activeChip = useMemo(() => {
    if (filters.maxBudget === 50 && !filters.styles.length) return "Under $50";
    if (filters.styles.length === 1 && !filters.maxBudget) return filters.styles[0];
    if (!hasActiveFilters(filters) || (filters.q && !filters.styles.length && !filters.maxBudget)) return "For you";
    return filters.styles[0] ?? "";
  }, [filters]);

  const commit = (next: DiscoveryFilters, path = action) => {
    const qs = serializeDiscoverySearchParams(next);
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  };

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    commit({ ...filters, q: query.trim() });
  };

  const selectChip = (chip: string) => {
    if (chip === "For you") commit({ ...filters, styles: [], maxBudget: undefined, q: query.trim() });
    else if (chip === "Under $50") commit({ ...filters, styles: [], maxBudget: 50, q: query.trim() });
    else commit({ ...filters, styles: [chip as DiscoveryFilters["styles"][number]], maxBudget: undefined, q: query.trim() });
  };

  const toggleValue = <T extends string>(list: T[], value: T) => list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div>
      <form onSubmit={onSearch} className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2 pl-4 shadow-card ring-1 ring-black/5" role="search">
        <MagnifyingGlass size={22} className="shrink-0 text-black/40" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none sm:text-base" placeholder="Search styles, subjects, or artists" aria-label="Search artwork" />
        <Button type="submit" className="hidden sm:inline-flex px-4">Search</Button>
        <a href={`/search${serializeDiscoverySearchParams({ ...filters, q: query.trim() }) ? `?${serializeDiscoverySearchParams({ ...filters, q: query.trim() })}` : ""}`} className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum" aria-label="Open full filters"><SlidersHorizontal size={20} /></a>
      </form>
      <div className="no-scrollbar mx-auto mt-5 flex max-w-4xl gap-2 overflow-x-auto pb-1 sm:justify-center">
        {chips.map((chip) => <button key={chip} type="button" onClick={() => selectChip(chip)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum ${activeChip === chip ? "bg-ink text-white" : "bg-white/70 text-black/60 hover:bg-white"}`}>{chip}</button>)}
      </div>
      {showAdvanced && (
        <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-black/[0.07] bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Filters</h2>
            {hasActiveFilters(filters) && <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => { setQuery(""); commit({ q: "", styles: [], subjects: [], availability: [] }); }}><X size={14} />Clear all</Button>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset><legend className="mb-2 text-sm font-bold">Style</legend><div className="flex flex-wrap gap-2">{STYLE_OPTIONS.map((style) => <button key={style} type="button" onClick={() => commit({ ...filters, styles: toggleValue(filters.styles, style) })} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${filters.styles.includes(style) ? "bg-ink text-white ring-ink" : "bg-mist text-black/60 ring-transparent"}`}>{style}</button>)}</div></fieldset>
            <fieldset><legend className="mb-2 text-sm font-bold">Subject</legend><div className="flex flex-wrap gap-2">{SUBJECT_OPTIONS.map((subject) => <button key={subject} type="button" onClick={() => commit({ ...filters, subjects: toggleValue(filters.subjects, subject) })} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${filters.subjects.includes(subject) ? "bg-ink text-white ring-ink" : "bg-mist text-black/60 ring-transparent"}`}>{subject}</button>)}</div></fieldset>
            <label className="text-sm font-bold">Budget
              <Select className="mt-2" value={filters.maxBudget ? String(filters.maxBudget) : ""} onChange={(event) => commit({ ...filters, maxBudget: event.target.value ? Number(event.target.value) : undefined })}>
                <option value="">Any budget</option>
                {BUDGET_BANDS.map((band) => <option key={band} value={band}>Under ${band}</option>)}
              </Select>
            </label>
            <label className="text-sm font-bold">Turnaround
              <Select className="mt-2" value={filters.maxTurnaroundDays ? String(filters.maxTurnaroundDays) : ""} onChange={(event) => commit({ ...filters, maxTurnaroundDays: event.target.value ? Number(event.target.value) : undefined })}>
                <option value="">Any timing</option>
                {TURNAROUND_BANDS.map((band) => <option key={band} value={band}>Within {band} days</option>)}
              </Select>
            </label>
            <fieldset><legend className="mb-2 text-sm font-bold">Availability</legend><div className="flex flex-wrap gap-2">{AVAILABILITY_OPTIONS.map((item) => <button key={item} type="button" onClick={() => commit({ ...filters, availability: toggleValue(filters.availability, item) })} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${filters.availability.includes(item) ? "bg-ink text-white ring-ink" : "bg-mist text-black/60 ring-transparent"}`}>{availabilityLabel[item]}</button>)}</div></fieldset>
            <div className="space-y-3">
              <label className="text-sm font-bold">Usage
                <Select className="mt-2" value={filters.usage ?? ""} onChange={(event) => commit({ ...filters, usage: event.target.value ? event.target.value as DiscoveryFilters["usage"] : undefined })}>
                  <option value="">Any usage</option>
                  {USAGE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </label>
              <label className="text-sm font-bold">Format
                <Select className="mt-2" value={filters.format ?? ""} onChange={(event) => commit({ ...filters, format: event.target.value ? event.target.value as DiscoveryFilters["format"] : undefined })}>
                  <option value="">Any format</option>
                  {FORMAT_OPTIONS.map((item) => <option key={item} value={item}>{item}{item === "physical" ? " (not supported in MVP checkout)" : ""}</option>)}
                </Select>
              </label>
              <Checkbox label="Emerging artists only" checked={Boolean(filters.emerging)} onChange={(event) => commit({ ...filters, emerging: event.target.checked || undefined })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
