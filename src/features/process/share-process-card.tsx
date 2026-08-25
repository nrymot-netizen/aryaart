"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { getArtist } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { Checkbox, Textarea } from "@/components/ui/form-field";
import { emptyProcessConsent, PROCESS_CAPTION_MAX, processFiles, processStoryReady, teenPaidWorkStaysPrivateUntilOptIn } from "@/lib/domain/process-stories";
import { processLogFor } from "@/lib/domain/process-log";
import type { CommissionOrder } from "@/types";

export function ShareProcessCard({ order, isArtist, isBuyer }: { order: CommissionOrder; isArtist: boolean; isBuyer: boolean }) {
  const { state, dispatch } = useDemo();
  const artist = getArtist(order.artistId);
  const consent = (state.processStoryConsents ?? []).find((item) => item.orderId === order.id) ?? emptyProcessConsent(order.id);
  const { sketch, final } = processFiles(state.files, order.id);
  const finalLog = final ? processLogFor(state.processLogs, final.id) : null;
  const canReplay = Boolean(finalLog && finalLog.ops.length > 0);
  const published = (state.processStories ?? []).find((item) => item.orderId === order.id);
  const ready = processStoryReady({ status: order.status, sketch, final, artistOptIn: consent.artistOptIn, buyerOptIn: consent.buyerOptIn });
  const [caption, setCaption] = useState(consent.buyerCaption);
  const captionRef = useRef(consent.buyerCaption);
  const [replay, setReplay] = useState(consent.artistReplayOptIn);
  const replayRef = useRef(consent.artistReplayOptIn);
  const [error, setError] = useState<string | null>(null);
  const teen = teenPaidWorkStaysPrivateUntilOptIn(artist?.accountType ?? "adult");

  if (order.status !== "completed" || (!isArtist && !isBuyer)) return null;

  const save = (command: Parameters<typeof dispatch>[0]) => {
    const result = dispatch(command);
    setError(result.error ?? null);
  };

  return (
    <section className="mt-5 rounded-3xl border border-plum/15 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Share process</p>
      <h2 className="mt-2 text-lg font-bold">Sketch to final, if you both want it public</h2>
      <p className="mt-2 text-sm leading-6 text-black/60">
        Default is private. The brief, messages, and references never appear. {teen ? "Protected accounts stay private until you explicitly opt in. Arya will not auto-post paid work." : "Both people have to opt in."}
      </p>
      {!sketch?.preview || !final?.preview ? <p className="mt-3 text-sm font-semibold text-black/50">A public story needs both a sketch file and a final file.</p> : null}
      {isBuyer && (
        <div className="mt-4 space-y-3">
          <Checkbox label="I opt in to a public sketch-to-final story" checked={consent.buyerOptIn} onChange={(event) => save({ type: "process-story-opt-in", orderId: order.id, side: "buyer", optIn: event.target.checked, caption: captionRef.current })} />
          <Textarea value={caption} onChange={(event) => { captionRef.current = event.target.value; setCaption(event.target.value); }} maxLength={PROCESS_CAPTION_MAX} placeholder="Optional one-line public caption. Leave blank to keep the brief private." />
          <p className="text-xs text-black/40">{caption.length}/{PROCESS_CAPTION_MAX}</p>
          <Button variant="secondary" onClick={() => save({ type: "process-story-opt-in", orderId: order.id, side: "buyer", optIn: true, caption: captionRef.current })}>Save my opt-in</Button>
        </div>
      )}
      {isArtist && (
        <div className="mt-4 space-y-3">
          <Checkbox label="I opt in to a public sketch-to-final story" checked={consent.artistOptIn} onChange={(event) => save({ type: "process-story-opt-in", orderId: order.id, side: "artist", optIn: event.target.checked, replayOptIn: replayRef.current })} />
          {canReplay && (
            <Checkbox
              label="Include replay of the final only"
              checked={replay}
              onChange={(event) => {
                replayRef.current = event.target.checked;
                setReplay(event.target.checked);
                if (consent.artistOptIn) save({ type: "process-story-opt-in", orderId: order.id, side: "artist", optIn: true, replayOptIn: event.target.checked });
              }}
            />
          )}
          <Button variant="secondary" onClick={() => save({ type: "process-story-opt-in", orderId: order.id, side: "artist", optIn: true, replayOptIn: replayRef.current })}>Save my opt-in</Button>
        </div>
      )}
      {error && <p className="mt-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
      <p className="mt-4 text-sm text-black/50">
        Artist: {consent.artistOptIn ? "opted in" : "private"} · Buyer: {consent.buyerOptIn ? "opted in" : "private"}
        {ready.ok ? " · Ready to publish" : ""}
      </p>
      {published && <Link href={`/process/${order.id}`} className="mt-3 inline-flex text-sm font-bold text-plum">View public process story →</Link>}
    </section>
  );
}
