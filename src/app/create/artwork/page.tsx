"use client";

import { FormEvent, useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { Checkbox, FormField, Input, Select, Textarea } from "@/components/ui/form-field";
import type { ArtworkStyle, ArtworkSubject } from "@/types";
import { STYLE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/domain/discovery";

export default function CreateArtworkPage() {
  const { persona, dispatch } = useDemo();
  const artistId = persona.artistId ?? "luna";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<ArtworkStyle>("Anime");
  const [subject, setSubject] = useState<ArtworkSubject>("character");
  const [offer, setOffer] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const id = `art-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "new"}`;
    const artwork = {
      id,
      artistId,
      title: title || "Untitled study",
      description: description || "A new piece from the studio.",
      image: "/art/moon-garden.svg",
      style,
      subject,
      tags: [style.toLowerCase(), subject],
      tools: ["Procreate"],
      aiDisclosure: false,
      visibility: "public" as const,
      publishedAt: new Date().toISOString().slice(0, 10),
      price: 40,
      likes: 0,
      isNew: true,
      format: "digital" as const,
    };
    dispatch({
      type: "create-artwork",
      artwork,
      post: { id: `post-${id}`, artistId, artworkId: id, postType: "finished", body: description || `${title} is up.`, publishedAt: artwork.publishedAt },
    });
    if (offer) window.location.href = `/create/service?from=${id}`;
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-5 px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">Publish work</h1>
      <FormField label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} required /></FormField>
      <FormField label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
      <FormField label="Style"><Select value={style} onChange={(event) => setStyle(event.target.value as ArtworkStyle)}>{STYLE_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
      <FormField label="Subject"><Select value={subject} onChange={(event) => setSubject(event.target.value as ArtworkSubject)}>{SUBJECT_OPTIONS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
      <Checkbox label="Offer commissions like this" checked={offer} onChange={(event) => setOffer(event.target.checked)} />
      <Button type="submit" disabled={persona.role !== "artist"}>Publish</Button>
      {persona.role !== "artist" && <p className="text-sm text-black/50">Switch to LunaLines or SketchMaya to publish.</p>}
    </form>
  );
}
