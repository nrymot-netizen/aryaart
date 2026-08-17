"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { DemoPersona } from "@/types";
import { defaultDemoPersona, demoPersonas } from "./demo-personas";

const storageKey = "arya-demo-persona-v1";
interface DemoContextValue { persona: DemoPersona; setPersonaId: (id: string) => void; resetDemo: () => void; }
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [personaId, setPersonaIdState] = useState(defaultDemoPersona.id);
  useEffect(() => { const stored = window.localStorage.getItem(storageKey); if (stored && demoPersonas.some((persona) => persona.id === stored)) setPersonaIdState(stored); }, []);
  const persona = demoPersonas.find((item) => item.id === personaId) ?? defaultDemoPersona;
  const value = useMemo<DemoContextValue>(() => ({
    persona,
    setPersonaId: (id) => { if (!demoPersonas.some((item) => item.id === id)) return; setPersonaIdState(id); window.localStorage.setItem(storageKey, id); },
    resetDemo: () => { window.localStorage.removeItem(storageKey); setPersonaIdState(defaultDemoPersona.id); window.dispatchEvent(new CustomEvent("arya:reset-demo")); },
  }), [persona]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() { const value = useContext(DemoContext); if (!value) throw new Error("useDemo must be used inside DemoProvider"); return value; }
