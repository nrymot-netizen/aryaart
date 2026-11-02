import type { DemoPersona } from "@/types";

export const YOU_PERSONA_ID = "you";

export const demoPersonas: DemoPersona[] = [
  { id: YOU_PERSONA_ID, label: "You", role: "artist", accountType: "adult", artistId: "you", description: "Draw, publish, and draw back." },
  { id: "buyer-alex", label: "Alex · Buyer", role: "buyer", accountType: "adult", description: "Explore artists and request custom artwork." },
  { id: "buyer-riley", label: "Riley · Buyer", role: "buyer", accountType: "protected-teen", description: "Request art with parent-supported paid steps." },
  { id: "luna", label: "LunaLines · Artist", role: "artist", accountType: "adult", artistId: "luna", description: "Manage requests, projects, and services." },
  { id: "maya", label: "SketchMaya · Artist", role: "artist", accountType: "protected-teen", artistId: "maya", description: "Experience a parent-supported teen artist account." },
  { id: "parent-preview", label: "Parent preview", role: "parent-preview", accountType: "adult", description: "Preview simulated approval checkpoints." },
];

export const defaultDemoPersona = demoPersonas[0];

export function resolvePersonaId(id: string | null | undefined) {
  if (!id || id === "buyer-alex") return YOU_PERSONA_ID;
  return demoPersonas.some((item) => item.id === id) ? id : YOU_PERSONA_ID;
}
