"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import type { Artist, CommissionService, DemoFile, IntendedUse } from "@/types";
import { calculateCommissionEstimate } from "@/lib/domain/orders";
import { commissionRequestSchema } from "@/lib/validation/commission";
import { canRequestCommission } from "@/lib/domain/availability";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { Checkbox, FormField, Input, Textarea } from "@/components/ui/form-field";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";
import { StatusPill } from "@/components/status-pill";

const steps = ["Brief", "Options", "Timing", "References", "Review"];

export function RequestWizard({ service, artist }: { service: CommissionService; artist: Artist }) {
  const { state, persona, dispatch } = useDemo();
  const existingDraft = state.drafts.find((draft) => draft.serviceId === service.id && draft.buyerId === persona.id);
  const [step, setStep] = useState(existingDraft?.step ?? 0);
  const [brief, setBrief] = useState(existingDraft?.brief ?? "");
  const [characterCount, setCharacterCount] = useState(existingDraft?.characterCount ?? 1);
  const [intendedUse, setIntendedUse] = useState<IntendedUse>(existingDraft?.intendedUse ?? "personal");
  const [addOnIds, setAddOnIds] = useState<string[]>(existingDraft?.addOnIds ?? []);
  const [deadline, setDeadline] = useState(existingDraft?.deadline ?? "2026-09-30");
  const [budget, setBudget] = useState(existingDraft?.budget ?? service.startingPrice + 20);
  const [notes, setNotes] = useState(existingDraft?.notes ?? "");
  const [rulesAccepted, setRulesAccepted] = useState(existingDraft?.rulesAccepted ?? false);
  const [references, setReferences] = useState<DemoFile[]>(existingDraft?.references ?? []);
  const [error, setError] = useState<string | null>(null);

  const selectedAddOns = service.addOns.filter((addOn) => addOnIds.includes(addOn.id));
  const estimate = useMemo(
    () => calculateCommissionEstimate(service.startingPrice, {
      characterCount,
      extraCharacterPrice: service.extraCharacterPrice ?? 0,
      selectedAddOns,
      intendedUse,
      commercialSurcharge: service.commercialSurcharge ?? 0,
    }),
    [service, characterCount, selectedAddOns, intendedUse],
  );

  const persist = (nextStep = step) => {
    dispatch({ type: "save-draft", draft: { serviceId: service.id, buyerId: persona.id, brief, characterCount, intendedUse, addOnIds, deadline, budget, notes, rulesAccepted, references, step: nextStep } });
  };

  if (!canRequestCommission(service.availability)) {
    return <p className="rounded-3xl bg-white p-8 text-center">This service is not open for requests right now.</p>;
  }

  const onFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const next: DemoFile[] = [];
    for (const file of Array.from(fileList).slice(0, 6)) {
      if (file.size > 8_000_000) {
        setError("Each reference must be under 8MB.");
        continue;
      }
      const preview = file.type.startsWith("image/") ? await fileToDataUrl(file) : undefined;
      next.push({ id: `ref-${file.name}-${file.size}`, name: file.name, type: file.type || "file", size: file.size, kind: "reference", preview, createdAt: new Date().toISOString() });
    }
    setReferences((current) => [...current, ...next]);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = commissionRequestSchema.safeParse({ brief, serviceId: service.id, characterCount, intendedUse, budget, deadline, notes, rulesAccepted });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete the required fields.");
      return;
    }
    persist();
    const result = dispatch({
      type: "submit-request",
      order: {
        buyerId: persona.id,
        artistId: artist.id,
        serviceId: service.id,
        brief,
        characterCount,
        intendedUse,
        addOnIds,
        deadline,
        budget,
        notes,
        references,
        estimatedPrice: estimate,
        price: estimate,
        revisionLimit: service.revisions,
        revisionsUsed: 0,
        parentApprovalRequired: persona.accountType === "protected-teen",
        parentApproved: persona.accountType !== "protected-teen",
      },
    });
    if (result.error) setError(result.error);
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
      <div>
        <Link href={`/commissions/${service.id}`} className="text-sm font-bold text-plum">← {service.title}</Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-6xl">Request this commission</h1>
        <ol className="mt-6 flex flex-wrap gap-2">{steps.map((label, index) => <li key={label}><button type="button" onClick={() => setStep(index)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${step === index ? "bg-ink text-white" : "bg-white text-black/50"}`}>{index + 1}. {label}</button></li>)}</ol>

        {step === 0 && <div className="mt-8 space-y-5"><FormField label="Brief" hint="Be specific about character, mood, and must-haves."><Textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="A full-color fantasy portrait of my original character..." /></FormField><p className="text-sm text-black/50">You’re requesting <strong>{service.title}</strong> from @{artist.username}.</p></div>}
        {step === 1 && <div className="mt-8 space-y-5">
          <FormField label="Characters" hint={service.extraCharacterPrice ? `+$${service.extraCharacterPrice} each extra` : undefined}><Input type="number" min={1} max={5} value={characterCount} onChange={(event) => setCharacterCount(Number(event.target.value))} /></FormField>
          <fieldset><legend className="text-sm font-bold">Intended use</legend><div className="mt-2 flex gap-2">{(["personal", "commercial"] as const).filter((item) => service.usageOptions.includes(item)).map((item) => <button key={item} type="button" onClick={() => setIntendedUse(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${intendedUse === item ? "bg-ink text-white" : "bg-white"}`}>{item}{item === "commercial" && service.commercialSurcharge ? ` (+$${service.commercialSurcharge})` : ""}</button>)}</div></fieldset>
          {service.addOns.length > 0 && <fieldset><legend className="text-sm font-bold">Add-ons</legend><div className="mt-2 space-y-2">{service.addOns.map((addOn) => <Checkbox key={addOn.id} label={`${addOn.name} · +$${addOn.price}`} checked={addOnIds.includes(addOn.id)} onChange={(event) => setAddOnIds(event.target.checked ? [...addOnIds, addOn.id] : addOnIds.filter((id) => id !== addOn.id))} />)}</div></fieldset>}
        </div>}
        {step === 2 && <div className="mt-8 grid gap-5 sm:grid-cols-2"><FormField label="Preferred deadline"><Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></FormField><FormField label="Budget ceiling" hint={`Estimate is $${estimate}, not a charge.`}><Input type="number" min={1} value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></FormField></div>}
        {step === 3 && <div className="mt-8 space-y-4">
          <FormField label="References" hint="Images stay private to this project."><Input type="file" multiple accept="image/*,.pdf" onChange={(event) => onFiles(event.target.files)} /></FormField>
          <ul className="space-y-2">{references.map((file) => <li key={file.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"><span>{file.name} · {(file.size / 1024).toFixed(0)} KB</span><button type="button" className="font-bold text-plum" onClick={() => setReferences((current) => current.filter((item) => item.id !== file.id))}>Remove</button></li>)}</ul>
        </div>}
        {step === 4 && <div className="mt-8 space-y-4">
          <FormField label="Notes for the artist"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField>
          <Checkbox label="I accept this artist’s commission rules, revision policy, and in-app communication boundary." checked={rulesAccepted} onChange={(event) => setRulesAccepted(event.target.checked)} />
          <div className="rounded-3xl bg-white p-5 text-sm leading-6"><strong>Review:</strong> {brief || "No brief yet"} · {characterCount} character{characterCount > 1 ? "s" : ""} · {intendedUse} · due {deadline} · estimate ${estimate}</div>
          {artist.accountType === "protected-teen" && <ProtectedAccountNotice />}
        </div>}

        {error && <p className="mt-4 text-sm font-semibold text-red-600" role="alert">{error}</p>}
        <div className="mt-8 flex gap-3">
          {step > 0 && <Button variant="ghost" onClick={() => { persist(step - 1); setStep(step - 1); }}>Back</Button>}
          {step < steps.length - 1 && <Button onClick={() => { persist(step + 1); setStep(step + 1); }}>Continue</Button>}
          {step === steps.length - 1 && <Button type="submit">Submit request</Button>}
        </div>
      </div>
      <aside className="h-fit rounded-4xl border border-black/[0.07] bg-white p-5">
        <StatusPill status={service.availability} slots={service.remainingSlots} />
        <p className="mt-4 text-sm text-black/45">Live estimate</p>
        <p className="text-4xl font-bold">${estimate}</p>
        <p className="mt-2 text-xs text-black/45">Not a charge. The artist can counter this number.</p>
        <ul className="mt-4 space-y-1 text-sm text-black/60">
          <li>Base ${service.startingPrice}</li>
          {characterCount > 1 && <li>Extra characters +${(characterCount - 1) * (service.extraCharacterPrice ?? 0)}</li>}
          {intendedUse === "commercial" && <li>Commercial +${service.commercialSurcharge ?? 0}</li>}
          {selectedAddOns.map((addOn) => <li key={addOn.id}>{addOn.name} +${addOn.price}</li>)}
        </ul>
      </aside>
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
