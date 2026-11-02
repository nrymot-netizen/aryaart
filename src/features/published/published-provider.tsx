"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Artwork, DrawBackPair } from "@/types";
import type { ProcessLog } from "@/lib/domain/process-log";
import { createPublisherHandle, PUBLISHER_HANDLE_KEY } from "./handle";
import type { PublishedCatalog } from "@/lib/published/types";

interface PublishedContextValue {
  configured: boolean;
  artworks: Artwork[];
  processLogs: ProcessLog[];
  pairs: DrawBackPair[];
  handle: string;
  refresh: () => Promise<void>;
  share: (input: { artwork: Artwork; processLog: ProcessLog | null; pair: DrawBackPair | null }) => Promise<{ ok: boolean; error?: string; artistId?: string }>;
}

const PublishedContext = createContext<PublishedContextValue | null>(null);

export function PublishedProvider({ children }: { children: React.ReactNode }) {
  const [configured, setConfigured] = useState(false);
  const [catalog, setCatalog] = useState<PublishedCatalog>({ artworks: [], processLogs: [], pairs: [], profiles: [] });
  const [handle, setHandle] = useState("ink-waiting");

  useEffect(() => {
    const existing = window.localStorage.getItem(PUBLISHER_HANDLE_KEY);
    const next = existing && /^ink-[a-z0-9]{6,16}$/.test(existing) ? existing : createPublisherHandle();
    window.localStorage.setItem(PUBLISHER_HANDLE_KEY, next);
    setHandle(next);
    void load();
  }, []);

  const load = async () => {
    try {
      const response = await fetch("/api/published");
      const data = await response.json();
      setConfigured(Boolean(data.configured));
      setCatalog({
        artworks: Array.isArray(data.artworks) ? data.artworks : [],
        processLogs: Array.isArray(data.processLogs) ? data.processLogs : [],
        pairs: Array.isArray(data.pairs) ? data.pairs : [],
        profiles: Array.isArray(data.profiles) ? data.profiles : [],
      });
    } catch {
      setConfigured(false);
    }
  };

  const share: PublishedContextValue["share"] = async (input) => {
    try {
      const response = await fetch("/api/published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, artwork: input.artwork, processLog: input.processLog, pair: input.pair }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.configured === false ? undefined : data.error ?? "Could not share this drawing." };
      }
      await load();
      return { ok: true, artistId: data.artwork?.artistId ?? handle };
    } catch {
      return { ok: false, error: "Could not reach the shared gallery." };
    }
  };

  const value = useMemo<PublishedContextValue>(() => ({
    configured,
    artworks: catalog.artworks,
    processLogs: catalog.processLogs,
    pairs: catalog.pairs,
    handle,
    refresh: load,
    share,
  }), [catalog, configured, handle]);

  return <PublishedContext.Provider value={value}>{children}</PublishedContext.Provider>;
}

export function usePublished() {
  const value = useContext(PublishedContext);
  if (!value) throw new Error("usePublished must be used inside PublishedProvider");
  return value;
}
