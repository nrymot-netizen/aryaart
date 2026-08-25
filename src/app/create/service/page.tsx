"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getArtwork } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { ArtworkMedia } from "@/components/artwork-media";

export default function CreateServicePage() {
  return <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-16 text-sm text-black/50">Loading service form…</div>}><CreateServiceForm /></Suspense>;
}

function CreateServiceForm() {
  const searchParams = useSearchParams();
  const { persona, dispatch, state } = useDemo();
  const artistId = persona.artistId ?? "luna";
  const fromId = searchParams.get("from");
  const sourceArtwork = useMemo(
    () => state.createdArtworks.find((item) => item.id === fromId) ?? (fromId ? getArtwork(fromId) : undefined),
    [fromId, state.createdArtworks],
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("A structured custom commission based on recent work.");
  const [price, setPrice] = useState(45);

  useEffect(() => {
    if (!sourceArtwork) return;
    setTitle(`Commissions like ${sourceArtwork.title}`);
    setDescription(`Custom work in the spirit of ${sourceArtwork.title}. ${sourceArtwork.description}`);
    setPrice(sourceArtwork.price);
  }, [sourceArtwork]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const id = `svc-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20) || "custom"}`;
    dispatch({
      type: "create-service",
      service: {
        id,
        artistId,
        title: title || "New commission",
        description,
        startingPrice: price,
        turnaround: "10–14 days",
        turnaroundDays: 14,
        revisions: 2,
        availability: "open",
        includes: ["One character", "Full color", "High-resolution PNG"],
        exclusions: ["Unscoped series"],
        deliverables: ["PNG"],
        usageOptions: ["personal"],
        addOns: [{ id: `${id}-rush`, name: "Rush", price: 20 }],
        exampleArtworkIds: sourceArtwork ? [sourceArtwork.id] : [],
        remainingSlots: 3,
        extraCharacterPrice: 20,
        commercialSurcharge: 15,
      },
    });
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-5 px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">New service</h1>
      {sourceArtwork && (
        <div className="flex items-center gap-3 rounded-3xl bg-white p-3">
          <ArtworkMedia src={sourceArtwork.image} alt="" width={56} height={72} className="h-16 w-12 rounded-xl object-cover" />
          <p className="text-sm"><strong>Based on {sourceArtwork.title}</strong><span className="mt-1 block text-black/50">This service will use that piece as the example.</span></p>
        </div>
      )}
      <FormField label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} required /></FormField>
      <FormField label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
      <FormField label="Starting price"><Input type="number" min={1} value={price} onChange={(event) => setPrice(Number(event.target.value))} /></FormField>
      <Button type="submit" disabled={persona.role !== "artist"}>Publish service</Button>
    </form>
  );
}
