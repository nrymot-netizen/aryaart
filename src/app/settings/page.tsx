"use client";

import { LockSimple } from "@phosphor-icons/react";
import { PageIntro } from "@/components/page-intro";
import { Checkbox } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/features/demo/demo-provider";
import { PersonaContextBanner } from "@/features/demo/persona-context-banner";

const protections = [
  { id: "contact", label: "Block contact sharing on protected threads", hint: "Email, phone, and off-platform handles stay blocked." },
  { id: "dms", label: "Keep messages on the order", hint: "No open DMs. Talk lives on the commission." },
  { id: "parent", label: "Parent approval for paid steps", hint: "Simulated. Required before a teen request or checkout proceeds." },
  { id: "age", label: "Hide exact age in public UI", hint: "Parent supported, never a number." },
];

export default function SettingsPage() {
  const { persona, state, dispatch } = useDemo();
  const locked = persona.accountType === "protected-teen";
  const pending = state.parentApprovals.filter((item) => item.status === "pending");

  return (
    <>
      <PageIntro eyebrow="Account" title="Safety settings" description={locked ? "These protections stay on. A teen account cannot turn them off in this demo." : "Demo safety defaults. Production parent controls and age assurance are not in this build."} />
      <PersonaContextBanner />
      <div className="mx-auto max-w-xl space-y-4 px-4 pb-20 sm:px-6">
        <section className="rounded-4xl bg-white p-5">
          <div className="flex items-center gap-2 text-plum"><LockSimple size={18} weight="fill" /><p className="text-xs font-bold uppercase tracking-[0.16em]">Default protections</p></div>
          <ul className="mt-4 space-y-4">
            {protections.map((item) => (
              <li key={item.id}>
                <Checkbox label={item.label} checked disabled aria-disabled="true" />
                <p className="ml-7 mt-1 text-xs leading-5 text-black/45">{item.hint}</p>
              </li>
            ))}
          </ul>
          {locked && <p className="mt-4 rounded-2xl bg-mist px-4 py-3 text-sm text-black/60">Locked on this account. Switching to Parent preview is how a reviewer completes a simulated approval — it does not unlock these switches.</p>}
        </section>
        {persona.role === "parent-preview" && (
          <section className="rounded-4xl bg-white p-5">
            <h2 className="font-bold">Pending simulated approvals</h2>
            {pending.length === 0 ? (
              <>
                <p className="mt-2 text-sm text-black/50">Nothing is waiting. Load a teen request, or have Riley submit one.</p>
                <Button className="mt-4 w-full" onClick={() => dispatch({ type: "load-scenario", scenario: "parent-approval" })}>Load a pending teen request</Button>
              </>
            ) : (
              <ul className="mt-3 space-y-3">
                {pending.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3">
                    <p className="text-sm"><strong>{item.action.replace("-", " ")}</strong> · {item.orderId}</p>
                    <Button onClick={() => dispatch({ type: "parent-approve", approvalId: item.id })}>Approve</Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <p className="text-xs leading-5 text-black/40">13+ only. This is not age verification. Payments and parent approval are simulated. No moderator is on call.</p>
      </div>
    </>
  );
}
