"use client";

import { ShieldCheck, UserSwitch } from "@phosphor-icons/react";
import { useDemo } from "./demo-provider";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";

export function PersonaContextBanner() {
  const { persona } = useDemo();
  return <div className="mx-auto max-w-5xl px-4 pb-6 sm:px-6"><div className="flex flex-col gap-4 rounded-3xl border border-black/[0.07] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-2xl ${persona.accountType === "protected-teen" ? "bg-violet-50 text-plum" : "bg-mist text-plum"}`}>{persona.accountType === "protected-teen" ? <ShieldCheck size={21} weight="fill" /> : <UserSwitch size={21} />}</span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Viewing demo as</p><p className="font-bold">{persona.label}</p></div></div><p className="max-w-lg text-sm text-black/50">{persona.description}</p></div>{persona.accountType === "protected-teen" && <div className="mt-3"><ProtectedAccountNotice /></div>}</div>;
}
