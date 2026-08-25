# Current state

**As of:** 25 August 2026  
**Repo:** [nrymot-netizen/aryaart](https://github.com/nrymot-netizen/aryaart) `main`  
**Live:** https://aryaart.vercel.app (Hobby, Git-connected)  
**Persistence:** `localStorage` key `arya-demo-state-v2` (`DEMO_STATE_VERSION = 2`)

This is a product-validation demo, not a production marketplace. Treat it as the vertical slice to extend, not a greenfield app.

## Shipped (Phases 0–8, mock-backed)

| Area | What exists |
| --- | --- |
| Discover / search | Artwork-first feed, URL filters, saves, Drawn on Arya section for created work |
| Artists | Profiles, tabs, rules, availability CTAs, waitlist |
| Commissions | Services, request wizard (including buyer reference sketch), accept/counter/decline, simulated checkout |
| Workspace | Order messages (no DMs), files, milestones, sketch/final, reviews |
| Canvas | Power studio: pencil/ink/marker/airbrush, eraser, fill, sample, layers (max 8), symmetry, zoom, stabilizer. Routes: `/create/draw`, `/orders/[id]/draw` |
| License | `licenseSummary` on request, checkout, and order. Files + usage license; artist keeps copyright. Never “you own the art.” |
| Identity A | Process log (sampled, size-capped), replay, share card, human-made only with Arya Canvas + non-empty log. Uploads cannot fake it. |
| Studio | Availability, incoming work, created art/services, simulated ledger, first paid piece moment |
| Safety | 13+ notice (not verification), protected-teen chrome, contact block on protected threads (messages + brief/notes), report / block / leave stubs, review report/hide. Still no production moderation. See [SAFETY.md](./SAFETY.md). |
| Demo | Persona switcher: Alex, LunaLines, SketchMaya, Parent preview. Reset demo. |

## As-built layout (do not reshuffle unless a phase requires it)

Public URLs are flat App Router routes (no `(marketplace)` groups yet). Domain logic lives in `src/lib/domain/`. Mutations go through `src/features/demo/demo-reducer.ts` commands. Catalog seeds: `src/data/mock-data.ts`, `src/data/seed-orders.ts`.

| Path | Role |
| --- | --- |
| `src/app/` | Routes |
| `src/features/canvas/drawing-studio.tsx` | Studio UI |
| `src/lib/domain/canvas.ts` | Canvas helpers, JPEG export |
| `src/lib/domain/orders.ts` | Transitions, price, next actions |
| `src/lib/domain/license.ts` | Files vs license vs copyright copy |
| `src/lib/domain/process-log.ts` | Sampled stroke log, replay duration, human-made rule |
| `src/features/demo/` | Shared demo store |
| `tests/` | Vitest (72 tests as of this date) |

## Known gaps (build these; do not pretend they are done)

1. **Challenges / process stories** — Identity Phases B–C. Not started.
2. **Layers** — In-session only. Refresh loses the layer stack (JPEG remains). Process log + JPEG persist; the live layer stack does not. Do not promise PSD round-trip.
3. **Backend** — No Supabase, no real auth, no real money. Two browsers do not share state.
4. **Playwright e2e** — Plan mentions them; repo uses Vitest only.
5. **Canvas/image contact** — Matcher does not read drawings. Production T&S still not started.
6. **Replay fidelity** — Replay is sampled ops over ~8–15s, not a lossless timelapse or downloadable video file.

## Seeded shortcuts

| Path / action | Why |
| --- | --- |
| `/orders/order-first-flight` as Alex | Leo sketch already in review |
| `/orders/order-luna-first-paid` as Luna | Completed history + first paid piece |
| Studio as LunaLines | First paid piece moment |
| Studio as SketchMaya, open a slot | Waitlist promotion |
| `/art/lantern-study` | Seeded Arya-canvas lantern with Play replay |

## What “done” means right now

A stakeholder can complete Discover → request Luna → accept → demo checkout → draw sketch/final → review, and an artist can draw and publish with replay + share, **on the live Vercel URL**, with demo personas. That loop is the regression baseline. Phase 9 must not break it.
