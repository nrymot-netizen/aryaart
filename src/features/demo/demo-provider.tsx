"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DemoPersona } from "@/types";
import { defaultDemoPersona, demoPersonas } from "./demo-personas";
import { createDemoState, demoStateKey, legacyPersonaKey, parseDemoState, type DemoPersistedState } from "./demo-state";
import { makeId, reduceDemoState, type DemoCommand } from "./demo-reducer";
import { Toast } from "@/components/ui/toast";

interface DemoContextValue {
  state: DemoPersistedState;
  persona: DemoPersona;
  hydrated: boolean;
  setPersonaId: (id: string) => void;
  resetDemo: () => void;
  dispatch: (command: DemoCommand) => ReturnType<typeof reduceDemoState>;
  unreadCount: number;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<DemoPersistedState>(createDemoState);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    setState(parseDemoState(window.localStorage.getItem(demoStateKey), window.localStorage.getItem(legacyPersonaKey)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(demoStateKey, JSON.stringify(state));
    window.localStorage.setItem(legacyPersonaKey, state.personaId);
  }, [hydrated, state]);

  const showToast = (message?: string) => {
    if (!message) return;
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const persona = demoPersonas.find((item) => item.id === state.personaId) ?? defaultDemoPersona;

  const dispatch = (command: DemoCommand) => {
    const ctx = {
      now: new Date().toISOString(),
      id: makeId,
      actorId: persona.id,
      role: persona.role,
      accountType: persona.accountType,
      artistId: persona.artistId,
    };
    let result: ReturnType<typeof reduceDemoState> = { state };
    setState((current) => {
      result = reduceDemoState(current, command, ctx);
      return result.state;
    });
    showToast(result.toast);
    if (result.href) router.push(result.href);
    return result;
  };

  const unreadCount = state.notifications.filter((item) => !item.read && (item.profileId === persona.id || item.profileId === persona.artistId)).length;

  const value = useMemo<DemoContextValue>(() => ({
    state,
    persona,
    hydrated,
    setPersonaId: (id) => dispatch({ type: "set-persona", personaId: id }),
    resetDemo: () => dispatch({ type: "reset" }),
    dispatch,
    unreadCount,
  }), [state, persona, hydrated, unreadCount]);

  return <DemoContext.Provider value={value}>{children}<Toast message={toast} /></DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside DemoProvider");
  return value;
}
