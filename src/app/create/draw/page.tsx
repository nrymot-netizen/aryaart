"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DrawingStudio, type DrawingStudioHandle } from "@/features/canvas/drawing-studio";
import { useDemo } from "@/features/demo/demo-provider";
import { usePublished } from "@/features/published/published-provider";
import { usePublishedArtwork } from "@/features/published/use-published-artwork";
import { artistLabel, isVisitorArtist, shouldSharePublish } from "@/lib/published/artist";
import { Button } from "@/components/ui/button";
import { Checkbox, FormField, Input, Select, Textarea } from "@/components/ui/form-field";
import { ARYA_CANVAS_TOOL, type ExportedDrawing } from "@/lib/domain/canvas";
import { STYLE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/domain/discovery";
import { canDrawBack, findDemoArtwork } from "@/lib/domain/draw-back";
import { createDraftId, drawingDraftFor } from "@/lib/domain/drawing-drafts";
import { processLogFor } from "@/lib/domain/process-log";
import { artworks, getArtist } from "@/data/mock-data";
import { getChallenge } from "@/data/seed-challenges";
import { isChallengeOpen } from "@/lib/domain/challenges";
import { ViewTracker } from "@/features/demo/view-tracker";
import type { ArtworkStyle, ArtworkSubject, PostType } from "@/types";

const postTypes: Record<string, PostType> = {
  finished: "finished",
  sketch: "sketch",
  process: "process",
  timelapse: "timelapse",
  "commission-example": "commission-example",
};

export default function CreateDrawPage() {
  return <Suspense fallback={<div className="px-4 py-16 text-sm text-black/50">Loading the studio…</div>}><CreateDrawForm /></Suspense>;
}

function CreateDrawForm() {
  const searchParams = useSearchParams();
  const { persona, dispatch, state, hydrated } = useDemo();
  const published = usePublished();
  const studioRef = useRef<DrawingStudioHandle>(null);
  const artistId = persona.artistId ?? "you";
  const sourceId = searchParams.get("back") ?? "";
  const sharedSource = usePublishedArtwork(sourceId);
  const source = sourceId ? findDemoArtwork([...published.artworks, ...state.createdArtworks], artworks, sourceId) ?? sharedSource.artwork : undefined;
  const sourceLog = source ? processLogFor([...published.processLogs, ...state.processLogs], source.id) ?? sharedSource.processLog : null;
  const sourceArtist = source ? getArtist(source.artistId) : undefined;
  const drawBackOk = Boolean(sourceId) && canDrawBack(source, sourceLog);
  const draftId = createDraftId("create", sourceId ? `${artistId}-back-${sourceId}` : artistId);
  const savedDraft = drawingDraftFor(state.drawingDrafts, draftId);
  const requestedType = searchParams.get("type") ?? "finished";
  const requestedChallenge = getChallenge(searchParams.get("challenge") ?? sourceLog?.challengeId ?? "");
  const challenge = requestedChallenge && isChallengeOpen(requestedChallenge) ? requestedChallenge : undefined;
  const postType = postTypes[requestedType] ?? "finished";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<ArtworkStyle>("Anime");
  const [subject, setSubject] = useState<ArtworkSubject>("character");
  const [offer, setOffer] = useState(false);
  const [aiDisclosure, setAiDisclosure] = useState(false);
  const [upload, setUpload] = useState<ExportedDrawing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (persona.role === "parent-preview") {
      setError("Switch out of parent preview to publish a drawing.");
      return;
    }
    const drawing = studioRef.current?.hasMarks() ? studioRef.current.exportDrawing() : upload;
    if (!drawing) {
      setError(drawBackOk || challenge ? "Draw the piece on Arya before you publish." : "Draw the piece, or upload a file, before you publish.");
      return;
    }
    const fromCanvas = Boolean(studioRef.current?.hasMarks());
    if (drawBackOk && !fromCanvas) {
      setError("Draw the reply on Arya. Uploads cannot enter.");
      return;
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "studio-piece";
    const id = `art-${slug}-${Date.now().toString(36)}`;
    const publishedAt = new Date().toISOString().slice(0, 10);
    const result = dispatch({
      type: "create-artwork",
      processOps: fromCanvas ? drawing.ops ?? studioRef.current?.exportOps() ?? [] : [],
      paperColor: drawing.paperColor,
      challengeId: challenge?.id,
      replyToArtworkId: drawBackOk ? source?.id : undefined,
      replySource: drawBackOk ? source : undefined,
      replySourceLog: drawBackOk ? sourceLog ?? undefined : undefined,
      artwork: {
        id,
        artistId,
        title: title || (drawBackOk && source ? `Draw back · ${source.title}` : challenge?.title) || "Untitled study",
        description: description || (drawBackOk && source ? `Draw-back to ${source.title}. Drawn on Arya.` : fromCanvas ? "Drawn on Arya." : "Published from a file."),
        image: drawing.dataUrl,
        style,
        subject,
        tags: [style.toLowerCase(), subject, fromCanvas ? "arya-canvas" : "upload", ...(drawBackOk ? ["draw-back"] : [])],
        tools: fromCanvas ? [ARYA_CANVAS_TOOL] : ["Uploaded file"],
        aiDisclosure: fromCanvas ? false : aiDisclosure,
        visibility: "public",
        publishedAt,
        price: 40,
        likes: 0,
        isNew: true,
        format: "digital",
      },
      post: {
        id: `post-${id}`,
        artistId,
        artworkId: id,
        postType,
        body: description || (drawBackOk && source ? `Draw-back to ${source.title}.` : `${title || "A new piece"} ${fromCanvas ? "drawn on Arya." : "published from a file."}`),
        publishedAt,
      },
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    dispatch({ type: "clear-drawing-draft", id: draftId });
    if (shouldSharePublish(artistId)) {
      const artwork = result.state.createdArtworks.find((item) => item.id === id);
      const processLog = processLogFor(result.state.processLogs, id);
      const pair = (result.state.drawBacks ?? []).find((item) => item.replyArtworkId === id) ?? null;
      if (artwork) void published.share({ artwork: { ...artwork, artistId: published.handle }, processLog, pair });
    }
    if (offer) window.location.href = `/create/service?from=${id}`;
  };

  const onUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload an image file.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setUpload({ dataUrl, byteLength: file.size, width: 0, height: 0, paperColor: "#fffdf8" });
    setError(null);
  };

  useEffect(() => {
    document.title = drawBackOk && source ? `Draw back · ${source.title} — Arya Art` : challenge ? `${challenge.title} — Arya Art` : "Draw — Arya Art";
  }, [challenge, drawBackOk, source]);

  if (!hydrated) {
    return <div className="px-4 py-16 text-sm text-black/50">Loading the studio…</div>;
  }

  return (
    <form onSubmit={publish} className="min-w-0 px-2 pb-2 pt-2 sm:px-5 sm:py-4">
      <ViewTracker name="canvas_opened" payload={{ route: "create" }} />
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2 sm:mb-4 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-plum sm:text-xs">{drawBackOk ? "Draw-back" : challenge ? "Challenge brief" : "Arya Canvas"}</p>
          <h1 className="font-[family-name:var(--font-display)] text-[1.7rem] leading-none sm:text-4xl">{drawBackOk && source ? `Draw back · ${source.title}` : challenge ? challenge.title : "Draw"}</h1>
          {drawBackOk && sourceArtist && (
            <p className="mt-1 hidden max-w-xl text-sm leading-6 text-black/55 sm:mt-2 sm:block">
              Ghost still from {artistLabel(sourceArtist)}. Your marks are the reply. Uploads cannot enter.
            </p>
          )}
          {sourceId && !drawBackOk && !sharedSource.loading && (
            <p className="mt-2 max-w-xl text-sm leading-6 text-red-600">This piece cannot be drawn back. It needs a public Arya replay.</p>
          )}
          {challenge && (
            <>
              <p className="mt-2 hidden max-w-xl text-sm leading-6 text-black/55 sm:block">{challenge.brief}</p>
              <details className="mt-1 sm:hidden">
                <summary className="text-sm font-bold text-plum">Brief</summary>
                <p className="mt-1 text-sm leading-6 text-black/55">{challenge.brief}</p>
              </details>
            </>
          )}
        </div>
        {persona.role === "parent-preview" && <p className="text-sm text-black/50">Switch out of parent preview to publish.</p>}
      </div>
      <DrawingStudio
        ref={studioRef}
        showAction={false}
        draftId={draftId}
        initialDraft={savedDraft}
        ghostImage={drawBackOk ? source?.image : undefined}
        onAutosave={(draft) => dispatch({ type: "save-drawing-draft", draft })}
        sidebarExtra={(
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Publish</h2>
            <FormField label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={drawBackOk && source ? `Draw back · ${source.title}` : challenge ? challenge.title : "Moon garden study"} /></FormField>
            <FormField label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
            <FormField label="Style"><Select value={style} onChange={(event) => setStyle(event.target.value as ArtworkStyle)}>{STYLE_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
            <FormField label="Subject"><Select value={subject} onChange={(event) => setSubject(event.target.value as ArtworkSubject)}>{SUBJECT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
            {drawBackOk || challenge ? (
              <p className="text-xs leading-5 text-black/45">{drawBackOk ? "Draw-backs are Arya Canvas only. File uploads cannot enter." : "This challenge is Arya Canvas only. File uploads cannot enter."}</p>
            ) : (
              <FormField label="Or upload a file" hint="If it was made in another app."><Input type="file" accept="image/*" onChange={(event) => onUpload(event.target.files)} /></FormField>
            )}
            {upload && <p className="text-xs font-semibold text-plum">File ready · {(upload.byteLength / 1024).toFixed(0)} KB</p>}
            {upload && !challenge && !drawBackOk ? (
              <Checkbox label="This uploaded file used generative AI" checked={aiDisclosure} onChange={(event) => setAiDisclosure(event.target.checked)} />
            ) : (
              <p className="text-xs leading-5 text-black/45">Arya Canvas does not include generative AI.</p>
            )}
            {!isVisitorArtist(artistId) && (
              <Checkbox label="Offer commissions like this" checked={offer} onChange={(event) => setOffer(event.target.checked)} />
            )}
            {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
            <Button type="submit" disabled={persona.role === "parent-preview" || Boolean(sourceId && !drawBackOk)} className="w-full">{drawBackOk ? "Publish draw-back" : challenge ? "Enter the challenge" : "Publish"}</Button>
          </section>
        )}
      />
    </form>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
