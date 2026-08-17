"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown, Check, ShieldCheck, UserSwitch } from "@phosphor-icons/react";
import { demoPersonas } from "./demo-personas";
import { useDemo } from "./demo-provider";

export function PersonaSwitcher() {
  const { persona, setPersonaId, resetDemo } = useDemo();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  return <div className="relative" ref={container}><button onClick={() => setOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-full bg-mist px-3 text-sm font-bold text-plum focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum" aria-expanded={open} aria-haspopup="menu"><UserSwitch size={19} /><span className="hidden max-w-28 truncate sm:block">{persona.label}</span><CaretDown size={14} /></button>{open && <div className="absolute right-0 top-12 z-50 w-80 rounded-3xl border border-black/10 bg-white p-2 shadow-card" role="menu"><div className="px-3 pb-2 pt-2"><p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Demo as</p><p className="mt-1 text-xs text-black/45">Switch perspectives without separate logins.</p></div>{demoPersonas.map((item) => <button key={item.id} role="menuitem" onClick={() => { setPersonaId(item.id); setOpen(false); }} className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left hover:bg-black/[0.035]"><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${item.accountType === "protected-teen" ? "bg-violet-50 text-plum" : "bg-black/[0.04] text-black/60"}`}>{item.accountType === "protected-teen" ? <ShieldCheck size={17} weight="fill" /> : <UserSwitch size={17} />}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{item.label}</strong><span className="mt-0.5 block text-xs leading-4 text-black/45">{item.description}</span></span>{item.id === persona.id && <Check size={17} weight="bold" className="mt-1 text-plum" />}</button>)}<button onClick={() => { resetDemo(); setOpen(false); }} className="mt-1 w-full border-t border-black/[0.06] px-3 py-3 text-left text-xs font-bold text-black/45 hover:text-ink">Reset demo state</button></div>}</div>;
}
