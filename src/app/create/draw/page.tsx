"use client";

import { FormEvent, Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DrawingStudio, type DrawingStudioHandle } from "@/features/canvas/drawing-studio";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { Checkbox, FormField, Input, Select, Textarea } from "@/components/ui/form-field";
import { ARYA_CANVAS_TOOL, type ExportedDrawing } from "@/lib/domain/canvas";
import { STYLE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/domain/discovery";
import { createDraftId, drawingDraftFor } from "@/lib/domain/drawing-drafts";
import { getChallenge } from "@/data/seed-challenges";
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
  const studioRef = useRef<DrawingStudioHandle>(null);
  const artistId = persona.artistId ?? "luna";
  const draftId = createDraftId("create", artistId);
  const savedDraft = drawingDraftFor(state.drawingDrafts, draftId);
  const requestedType = searchParams.get("type") ?? "finished";
  const challenge = getChallenge(searchParams.get("challenge") ?? "");
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
    if (persona.role !== "artist") return;
    const drawing = studioRef.current?.hasMarks() ? studioRef.current.exportDrawing() : upload;
    if (!drawing) {
      setError(challenge ? "Draw the piece on Arya before you enter." : "Draw the piece, or upload a file, before you publish.");
      return;
    }
    const fromCanvas = Boolean(studioRef.current?.hasMarks());
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "studio-piece";
    const id = `art-${slug}-${Date.now().toString(36)}`;
    const publishedAt = new Date().toISOString().slice(0, 10);
    dispatch({
      type: "create-artwork",
      processOps: fromCanvas ? drawing.ops ?? studioRef.current?.exportOps() ?? [] : [],
      paperColor: drawing.paperColor,
      challengeId: challenge?.id,
      artwork: {
        id,
        artistId,
        title: title || challenge?.title || "Untitled study",
        description: description || (fromCanvas ? "Drawn on Arya." : "Published from a file."),
        image: drawing.dataUrl,
        style,
        subject,
        tags: [style.toLowerCase(), subject, fromCanvas ? "arya-canvas" : "upload"],
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
        body: description || `${title || "A new piece"} ${fromCanvas ? "drawn on Arya." : "published from a file."}`,
        publishedAt,
      },
    });
    dispatch({ type: "clear-drawing-draft", id: draftId });
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

  if (!hydrated) {
    return <div className="px-4 py-16 text-sm text-black/50">Loading the studio…</div>;
  }

  return (
    <form onSubmit={publish} className="px-3 py-4 sm:px-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">{challenge ? "Challenge brief" : "Arya Canvas"}</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none">{challenge ? challenge.title : "Power studio"}</h1>
          {challenge && <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">{challenge.brief}</p>}
        </div>
        {persona.role !== "artist" && <p className="text-sm text-black/50">Switch to LunaLines or SketchMaya to publish.</p>}
      </div>
      <DrawingStudio
        ref={studioRef}
        showAction={false}
        draftId={draftId}
        initialDraft={savedDraft}
        onAutosave={(draft) => dispatch({ type: "save-drawing-draft", draft })}
        sidebarExtra={(
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Publish</h2>
            <FormField label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={challenge ? challenge.title : "Moon garden study"} /></FormField>
            <FormField label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
            <FormField label="Style"><Select value={style} onChange={(event) => setStyle(event.target.value as ArtworkStyle)}>{STYLE_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
            <FormField label="Subject"><Select value={subject} onChange={(event) => setSubject(event.target.value as ArtworkSubject)}>{SUBJECT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
            {challenge ? (
              <p className="text-xs leading-5 text-black/45">This challenge is Arya Canvas only. File uploads cannot enter.</p>
            ) : (
              <FormField label="Or upload a file" hint="If it was made in another app."><Input type="file" accept="image/*" onChange={(event) => onUpload(event.target.files)} /></FormField>
            )}
            {upload && <p className="text-xs font-semibold text-plum">File ready · {(upload.byteLength / 1024).toFixed(0)} KB</p>}
            {upload && !challenge ? (
              <Checkbox label="This uploaded file used generative AI" checked={aiDisclosure} onChange={(event) => setAiDisclosure(event.target.checked)} />
            ) : (
              <p className="text-xs leading-5 text-black/45">Arya Canvas does not include generative AI.</p>
            )}
            <Checkbox label="Offer commissions like this" checked={offer} onChange={(event) => setOffer(event.target.checked)} />
            {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
            <Button type="submit" disabled={persona.role !== "artist"} className="w-full">{challenge ? "Enter the challenge" : "Publish to portfolio"}</Button>
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
