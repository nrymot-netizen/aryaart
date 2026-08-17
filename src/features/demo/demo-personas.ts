import type { DemoPersona } from "@/types";

export const demoPersonas: DemoPersona[] = [
  { id: "buyer-alex", label: "Alex · Buyer", role: "buyer", accountType: "adult", description: "Explore artists and request custom artwork." },
  { id: "luna", label: "LunaLines · Artist", role: "artist", accountType: "adult", artistId: "luna", description: "Manage requests, projects, and services." },
  { id: "maya", label: "SketchMaya · Artist", role: "artist", accountType: "protected-teen", artistId: "maya", description: "Experience a parent-supported teen artist account." },
  { id: "parent-preview", label: "Parent preview", role: "parent-preview", accountType: "adult", description: "Preview simulated approval checkpoints." },
];

export const defaultDemoPersona = demoPersonas[0];
