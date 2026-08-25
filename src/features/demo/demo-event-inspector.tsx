"use client";

import { useDemo } from "@/features/demo/demo-provider";

export function DemoEventInspector() {
  const { state, hydrated } = useDemo();
  if (!hydrated) return null;
  const events = [...state.events].slice(-12).reverse();
  return (
    <section className="mx-auto mt-10 max-w-3xl px-4 pb-8 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">Demo events</p>
      <h2 className="mt-1 text-lg font-bold">This browser only</h2>
      <p className="mt-1 text-sm text-black/50">Instrumentation for replay, challenges, and process stories. Not a live analytics product.</p>
      {events.length === 0 ? <p className="mt-4 text-sm text-black/45">No identity events recorded yet.</p> : (
        <ol className="mt-4 space-y-2">
          {events.map((event) => (
            <li key={event.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
              <p className="font-bold">{event.name.replaceAll("_", " ")}</p>
              <p className="text-xs text-black/45">{event.createdAt.replace("T", " ").slice(0, 19)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
