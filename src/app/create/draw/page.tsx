"use client";

import { FormEvent, Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DrawingStudio, type DrawingStudioHandle } from "@/features/canvas/drawing-studio";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { Checkbox, FormField, Input, Select, Textarea } from "@/components/ui/form-field";
import { ARYA_CANVAS_TOOL, type ExportedDrawing } from "@/lib/domain/canvas";
import { STYLE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/domain/discovery";
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
  const { persona, dispatch } = useDemo();
  const studioRef = useRef<DrawingStudioHandle>(null);
  const artistId = persona.artistId ?? "luna";
  const requestedType = searchParams.get("type") ?? "finished";
  const postType = postTypes[requestedType] ?? "finished";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<ArtworkStyle>("Anime");
  const [subject, setSubject] = useState<ArtworkSubject>("character");
  const [offer, setOffer] = useState(false);
  const [upload, setUpload] = useState<ExportedDrawing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (persona.role !== "artist") return;
    const drawing = studioRef.current?.hasMarks() ? studioRef.current.exportDrawing() : upload;
    if (!drawing) {
      setError("Draw the piece, or upload a file, before you publish.");
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
      artwork: {
        id,
        artistId,
        title: title || "Untitled study",
        description: description || (fromCanvas ? "Drawn on Arya." : "Published from a file."),
        image: drawing.dataUrl,
        style,
        subject,
        tags: [style.toLowerCase(), subject, fromCanvas ? "arya-canvas" : "upload"],
        tools: fromCanvas ? [ARYA_CANVAS_TOOL] : ["Uploaded file"],
        aiDisclosure: false,
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

  return (
    <form onSubmit={publish} className="px-3 py-4 sm:px-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">Arya Canvas</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none">Power studio</h1>
        </div>
        {persona.role !== "artist" && <p className="text-sm text-black/50">Switch to LunaLines or SketchMaya to publish.</p>}
      </div>
      <DrawingStudio
        ref={studioRef}
        showAction={false}
        sidebarExtra={(
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Publish</h2>
            <FormField label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Moon garden study" /></FormField>
            <FormField label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
            <FormField label="Style"><Select value={style} onChange={(event) => setStyle(event.target.value as ArtworkStyle)}>{STYLE_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
            <FormField label="Subject"><Select value={subject} onChange={(event) => setSubject(event.target.value as ArtworkSubject)}>{SUBJECT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
            <FormField label="Or upload a file" hint="If it was made in another app."><Input type="file" accept="image/*" onChange={(event) => onUpload(event.target.files)} /></FormField>
            {upload && <p className="text-xs font-semibold text-plum">File ready · {(upload.byteLength / 1024).toFixed(0)} KB</p>}
            <Checkbox label="Offer commissions like this" checked={offer} onChange={(event) => setOffer(event.target.checked)} />
            {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
            <Button type="submit" disabled={persona.role !== "artist"} className="w-full">Publish to portfolio</Button>
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
