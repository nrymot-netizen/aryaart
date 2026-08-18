"use client";

import { FormEvent, useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";

export default function CreateServicePage() {
  const { persona, dispatch } = useDemo();
  const artistId = persona.artistId ?? "luna";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("A structured custom commission based on recent work.");
  const [price, setPrice] = useState(45);

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
        exampleArtworkIds: [],
        remainingSlots: 3,
        extraCharacterPrice: 20,
        commercialSurcharge: 15,
      },
    });
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-5 px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">New service</h1>
      <FormField label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} required /></FormField>
      <FormField label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
      <FormField label="Starting price"><Input type="number" min={1} value={price} onChange={(event) => setPrice(Number(event.target.value))} /></FormField>
      <Button type="submit" disabled={persona.role !== "artist"}>Publish service</Button>
    </form>
  );
}
