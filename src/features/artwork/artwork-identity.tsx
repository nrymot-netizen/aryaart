"use client";

import { useEffect, useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import { usePublishedArtwork } from "@/features/published/use-published-artwork";
import { ArtworkShareActions } from "@/features/artwork/artwork-share";
import { DrawBackButton } from "@/features/artwork/draw-back-button";
import { ReplayPlayer } from "@/features/artwork/replay-player";
import { canDrawBack } from "@/lib/domain/draw-back";
import { drawnOnArya, publicHumanMade } from "@/lib/domain/identity";
import { processLogFor } from "@/lib/domain/process-log";
import { ArtworkMedia } from "@/components/artwork-media";
import { SaveArtworkButton } from "@/features/saves/save-button";
import type { Artwork } from "@/types";

export function ArtworkStage({ artwork, artistName }: { artwork: Artwork; artistName: string }) {
  const { state, dispatch } = useDemo();
  const shared = usePublishedArtwork(artwork.id);
  const processLog = processLogFor(state.processLogs, artwork.id) ?? shared.processLog;
  const canReplay = Boolean(processLog && processLog.ops.length > 0);
  const humanMade = publicHumanMade(artwork.tools, processLog);
  const onArya = drawnOnArya(artwork.tools);
  const drawBackOk = canDrawBack(artwork, processLog);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div>
      {canReplay && processLog ? (
        <ReplayPlayer
          stillSrc={artwork.image}
          alt={artwork.title}
          processLog={processLog}
          reducedMotion={reducedMotion}
          onPlayed={() => dispatch({ type: "track-event", name: "replay_played", payload: { artworkId: artwork.id } })}
          onCompleted={() => dispatch({ type: "track-event", name: "replay_completed", payload: { artworkId: artwork.id } })}
        />
      ) : (
        <div className="relative overflow-hidden rounded-[2rem] bg-mist">
          <ArtworkMedia src={artwork.image} alt={artwork.title} width={900} height={1100} priority className="h-auto w-full" />
          <SaveArtworkButton artworkId={artwork.id} title={artwork.title} className="absolute right-4 top-4" />
        </div>
      )}
      {canReplay && <SaveArtworkButton artworkId={artwork.id} title={artwork.title} className="mt-3" />}
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        {onArya && <span className="rounded-full bg-mist px-3 py-1 text-plum">Drawn on Arya</span>}
        {humanMade && <span className="rounded-full bg-mist px-3 py-1 text-ink">Human-made</span>}
      </div>
      <ArtworkShareActions
        title={artwork.title}
        artistName={artistName}
        imageSrc={artwork.image}
        drawnOnArya={onArya}
        humanMade={humanMade}
        processLogJson={canReplay && processLog ? JSON.stringify(processLog, null, 2) : undefined}
        onCopied={() => dispatch({ type: "track-event", name: "share_card_copied", payload: { artworkId: artwork.id } })}
        onDownloaded={() => dispatch({ type: "track-event", name: "share_card_downloaded", payload: { artworkId: artwork.id } })}
      />
      {drawBackOk && (
        <div className="mt-4">
          <DrawBackButton artworkId={artwork.id} />
          <p className="mt-2 text-xs leading-5 text-black/45">Open a blank canvas with this still as a ghost. Your marks are the reply. No comments. No DMs.</p>
        </div>
      )}
    </div>
  );
}
