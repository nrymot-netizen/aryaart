# Current state

**As of:** 20 October 2026  
**Repo:** [nrymot-netizen/aryaart](https://github.com/nrymot-netizen/aryaart) `main`  
**Live:** https://aryaart.vercel.app (Hobby, Git-connected)  
**Persistence:** `localStorage` key `arya-demo-state-v2` (`DEMO_STATE_VERSION = 2`)

This is a product-validation demo, not a production marketplace. Treat it as the vertical slice to extend, not a greenfield app.

## Shipped (Phases 0–10, mock-backed)

| Area | What exists |
| --- | --- |
| Discover / search | Artwork-first feed, URL filters, saves, Drawn on Arya section, Night lantern challenge module, Sketch to final process stories |
| Artists | Profiles, tabs, rules, availability CTAs, waitlist |
| Commissions | Services, request wizard (including buyer reference sketch), accept/counter/decline, simulated checkout |
| Workspace | Order messages (no DMs), files, milestones, sketch/final, reviews |
| Canvas | Power studio: pencil/ink/marker/airbrush, eraser, fill, sample, layers (max 8), symmetry, zoom, stabilizer. Routes: `/create/draw`, `/orders/[id]/draw`. Browser drafts restore stills (and layer PNGs when they fit). Phone studio fits the paper to the viewport, uses a horizontal tool rail, and tabs Brush / Color / Layers / Publish. |
| License | `licenseSummary` on request, checkout, and order. Files + usage license; artist keeps copyright. Never “you own the art.” |
| Identity A | Process log (sampled, size-capped), replay, share card, human-made only with Arya Canvas + non-empty log. Uploads cannot fake it. |
| Challenges | One seeded brief (`/challenges/night-lantern`). Arya-canvas entries only. Ranked by saves. Try this brief opens Create with the brief pinned. |
| Draw-back | Replay reply. Public Arya-canvas work can open Create with that still as a ghost. The reply must be drawn on Arya. Pair page has **Watch both get drawn** plus a two-still share card. Discover cards stay 2-up on phone. No comments, no DMs, no upload pairs. Seeded: Maya’s paper lantern replies to Luna’s lantern study. |
| Process stories | After final acceptance, Share process is default off. Both people opt in → public sketch+final stills, optional final replay. Cards stay 2-up on phone. Brief/messages/references stay private. Buyer caption is scanned for contact. Protected-teen work is not auto-posted. |
| Studio | Availability, incoming work, waitlist demand, open slots, created art/services, simulated ledger, first paid piece moment, `/studio/services` |
| Safety | 13+ notice (not verification), protected-teen chrome, contact block on protected threads (messages + brief/notes), report / block / leave stubs, review report/hide. Still no production moderation. See [SAFETY.md](./SAFETY.md). |
| Demo | Persona switcher: Alex, Riley (teen buyer), LunaLines, SketchMaya, Parent preview. Reset demo. Last identity events on Notifications. Safety settings at `/settings`. |

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
| `src/lib/domain/challenges.ts` | Eligibility and save ranking |
| `src/lib/domain/process-stories.ts` | Dual opt-in, caption, publish readiness |
| `src/lib/domain/draw-back.ts` | Replay-reply eligibility; pairs stay canvas-only |
| `src/lib/domain/drawing-drafts.ts` | Draft ids, size cap, max 3 in this browser |
| `src/features/demo/` | Shared demo store |
| `tests/` | Vitest |

## Known gaps (build these; do not pretend they are done)

1. **Layers** — Drafts restore the composite JPEG in this browser, plus per-layer PNGs when they fit the size cap. Over-budget drafts keep the still only. Undo starts from the restored still. Not a PSD round-trip; pointer history is not stored in the draft.
2. **Backend** — No Supabase, no real auth, no real money. Two browsers do not share state.
3. **Playwright e2e** — Plan mentions them; repo uses Vitest only.
4. **Canvas/image contact** — Matcher does not read drawings. Production T&S still not started.
5. **Replay fidelity** — Replay is sampled ops over ~8–15s, not a lossless timelapse or downloadable video file.

## Seeded shortcuts

| Path / action | Why |
| --- | --- |
| `/orders/order-first-flight` as Alex | Leo sketch already in review |
| `/orders/order-luna-first-paid` as Alex then Luna | Completed history + first paid piece + Share process (dual opt-in) |
| `/process/order-luna-first-paid` after both opt in | Public sketch/final; no brief |
| Studio as LunaLines | First paid piece moment |
| Studio as SketchMaya, open a slot | Waitlist promotion |
| Parent preview → Load a pending teen request | Riley draft held until simulated parent approval |
| `/art/lantern-study` | Seeded Arya-canvas lantern with Play replay; also a Night lantern challenge entry |
| `/challenges/night-lantern` | Active brief + save-ranked grid |
| `/art/lantern-study` → Draw back | Ghost still in Create; publish as SketchMaya or Luna |
| `/draw-back/dback-lantern-paper` | Seeded pair: lantern study + paper lantern |

## What “done” means right now

A stakeholder can complete Discover → request Luna → accept → demo checkout → draw sketch/final → review, and an artist can draw and publish with replay + share, **on the live Vercel URL**, with demo personas. That loop is the regression baseline. Dual opt-in process stories must not leak briefs. Do not start real backend until product asks.
