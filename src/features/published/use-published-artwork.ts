"use client";

import { useEffect, useState } from "react";
import { artworks } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { usePublished } from "@/features/published/published-provider";
import { findDemoArtwork } from "@/lib/domain/draw-back";
import { processLogFor, type ProcessLog } from "@/lib/domain/process-log";
import type { Artwork, DrawBackPair } from "@/types";

export function usePublishedArtwork(id: string) {
  const { state } = useDemo();
  const published = usePublished();
  const localArtwork = id ? findDemoArtwork(state.createdArtworks, artworks, id) : undefined;
  const sharedArtwork = id ? published.artworks.find((item) => item.id === id) : undefined;
  const [remote, setRemote] = useState<{ artwork: Artwork; processLog: ProcessLog | null; pair: DrawBackPair | null } | null>(null);
  const [loading, setLoading] = useState(Boolean(id) && !localArtwork && !sharedArtwork);

  useEffect(() => {
    if (!id || localArtwork || sharedArtwork) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/published/${id}`).then((response) => response.json()).then((data) => {
      if (cancelled || !data.artwork) return;
      setRemote({ artwork: data.artwork, processLog: data.processLog ?? null, pair: data.pair ?? null });
    }).catch(() => undefined).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, localArtwork, sharedArtwork]);

  const artwork = localArtwork ?? sharedArtwork ?? remote?.artwork;
  const processLog = processLogFor(state.processLogs, id) ?? processLogFor(published.processLogs, id) ?? remote?.processLog ?? null;
  return { artwork, processLog, configured: published.configured, loading };
}
