# Arya Art Technical Architecture and Implementation Plan

**Audience:** Cursor/Codex implementers and product reviewers  
**Companion:** [Docs index](./README.md) · [Current state](./CURRENT_STATE.md) · [Product Requirements](./PRODUCT_REQUIREMENTS.md) · [Drawing Identity PRD](./DRAWING_IDENTITY_PRD.md) · [Demo and QA](./DEMO_AND_QA.md) · [Safety](./SAFETY.md) · [Deploy](./DEPLOY.md)

**Next phase to implement:** Phase 7 slice 1 (public drawings) is in progress. Do not start auth, cards, or order sync unless product asks. Do not rebuild shipped phases.

## 1. Delivery strategy

Build a convincing vertical slice before broadening the marketplace. Keep mock-backed repository interfaces until the complete buyer/artist transaction works, then replace those adapters with Supabase. This preserves demo speed without embedding business logic in components.

The vertical slice is already demonstrable locally and at https://aryaart.vercel.app. Remaining work is a real backend after UX validation, not more mock marketplace loops.

### Definition of done for every phase

- Requirements and acceptance criteria for the phase are implemented.
- Desktop and 360px mobile layouts are manually verified.
- Keyboard and focus behavior are checked for new interactions.
- `npm run build` passes with no TypeScript errors.
- Relevant unit and flow tests pass.
- Previously completed core flows still work.
- Seed/demo reset produces a deterministic state.

## 2. Proposed application architecture

**As-built:** routes live directly under `src/app/` (no route groups). Keep public URLs stable. Do not introduce `(marketplace)` groups unless there is a concrete routing need. Canvas UI is `src/features/canvas/`, not `components/canvas/`. There is no `src/repositories/` yet; the demo reducer is the store.

Target layout (for Supabase-era work; do not reshuffle everything up front):

```text
src/
  app/
    (marketplace)/           public discovery and artist routes
    (account)/               saved, notifications, settings
    (buyer)/                 requests, checkout, orders
    (artist)/                create and studio
    api/                     uploads or integrations only when required
  components/
    ui/                      buttons, inputs, dialog, tabs, badges
    artwork/                 artwork presentation
    artists/                 artist presentation
    commissions/             services and request forms
    workspace/               messages, files, milestones, approvals
    canvas/                  drawing studio chrome
    safety/                  protected-account and blocked-message UI
  features/
    auth/
    discovery/
    commissions/
    orders/
    canvas/                  in-app drawing engine
    studio/
    notifications/
    safety/
  lib/
    dal/                     server-only data access functions
    domain/                  state transitions and price calculations
    validation/              Zod schemas shared by forms/actions
    supabase/                browser/server/admin clients
    demo/                    persona and scenario controls
  repositories/              typed interfaces + mock/Supabase adapters
  data/                      seed data; removed from runtime after migration
  types/                     domain types and generated database types
supabase/
  migrations/
  seed.sql
tests/
  unit/
  integration/
  e2e/
```

Route groups organize code but must not change the public URLs.

## 3. Rendering and data rules

- Default to Server Components for pages and data presentation.
- Use Client Components only for interactive filters, forms, uploads, optimistic state, and demo controls.
- Put all database reads behind a server-only data access layer.
- Put mutations in validated Server Actions unless a Route Handler is materially better for uploads or external callbacks.
- Authenticate and authorize inside every mutation; UI visibility is not authorization.
- Use Zod for incoming form, URL parameter, and action payload validation.
- Return explicit domain results such as `{ ok, data, fieldErrors, formError }` rather than throwing expected user errors.
- Centralize order transitions and price calculation as pure domain functions.
- Do not import Supabase clients directly into presentational components.

## 4. Core domain model

### Identity and profiles

| Table/model | Important fields |
| --- | --- |
| `profiles` | id, username, display_name, avatar_path, bio, account_type, public_age_group, onboarding_state |
| `parent_links` | id, teen_profile_id, parent_profile_id, status, permissions; simulated initially |
| `artist_profiles` | profile_id, specialty, commission_status, slot_limit, response_time, rules, completed_count, rating_summary |
| `artist_styles` | artist_id, style_id |

### Content and discovery

| Table/model | Important fields |
| --- | --- |
| `artworks` | id, artist_id, title, description, image_path, style, subject, tags, tools, ai_disclosure, visibility, published_at; tools include `Arya Canvas` when drawn in-app |
| `process_logs` | artwork_or_file_id, sampled ops, paper, canvas size, challenge_id?; demo: store with created artwork; cap size for localStorage |
| `share_exports` | derived replay + share card; not a vice-named table |
| `posts` | id, artist_id, artwork_id, post_type, body, published_at |
| `saves` | profile_id, saveable_type, saveable_id, created_at |
| `reviews` | id, order_id, artist_id, buyer_id, rating, body, status, created_at |

### Commission commerce

| Table/model | Important fields |
| --- | --- |
| `services` | id, artist_id, title, description, base_price_cents, currency, turnaround_days, included_revisions, usage_options, status |
| `service_addons` | id, service_id, name, price_cents, rules |
| `commission_requests` | id, buyer_id, artist_id, service_id, brief, options_json, deadline, budget_cents, intended_use, status |
| `request_references` | id, request_id, storage_path, mime_type, size_bytes, caption |
| `offers` | id, request_id, created_by, price_cents, deadline, revisions, terms_snapshot, status |
| `orders` | id, accepted_offer_id, buyer_id, artist_id, status, price_cents, currency, terms_snapshot (includes intended_use and license summary), revision_limit, revision_used |
| `simulated_payments` | id, order_id, amount_cents, status, approved_by_parent, created_at |
| `simulated_ledger` | id, artist_id, order_id, entry_type, amount_cents, available_at |

### Workspace and operations

| Table/model | Important fields |
| --- | --- |
| `messages` | id, order_id, sender_id, body, moderation_state, created_at |
| `files` | id, order_id, uploader_id, kind, storage_path, mime_type, size_bytes, version, source (`arya-canvas` \| `upload`), created_at |
| `milestones` | id, order_id, type, status, due_at, completed_at |
| `timeline_events` | id, order_id, actor_id, event_type, payload_json, created_at |
| `waitlist_entries` | id, artist_id, service_id, buyer_id, position_key, status, promoted_at, expires_at |
| `notifications` | id, profile_id, type, entity_type, entity_id, title, body, read_at, created_at |

Use integer cents for money and immutable JSON snapshots for accepted terms. Store files in Supabase Storage; database rows hold metadata and authorization context.

## 5. Authorization model

### Publicly readable

- Published artist profile fields.
- Published artworks and posts.
- Active service summaries and public rules.
- Published reviews.

### Participant-only

- Request briefs and reference files: buyer plus requested artist.
- Orders, messages, files, milestones, and timeline: order buyer and artist.
- Parent approval state: linked teen, authorized parent, and limited system functions.
- Notifications, saves, waitlists, balances: owning profile only.

### Mutation examples

- Only a buyer can submit a request as themselves.
- Only the requested artist can accept, counter, or decline.
- Only the buyer can accept a counter or complete simulated checkout.
- Only the artist can submit sketch/final file kinds, whether drawn in Arya or uploaded.
- Only the buyer can approve/revise/accept delivery.
- Only a completed-order buyer can review that order.
- License copy on checkout is not a rights transfer.

Apply these checks in both server domain logic and Supabase RLS. Storage policies must mirror database access; a private database row does not secure a public bucket.

## 6. State and domain services

Create pure services before wiring UI:

- `calculateCommissionEstimate(service, selections)`
- `canTransitionOrder(current, action, actorRole)`
- `transitionOrder(order, action)`
- `remainingRevisions(limit, used)`
- `evaluateContactSharing(message)`
- `rankDiscoveryCandidates(profileSignals, candidates)`
- `promoteWaitlistEntry(entries, slot)`
- `calculateSimulatedBalance(ledger)`
- `exportedDrawingToFile(drawing, kind)`
- `isInlineArtworkSrc(src)`
- `licenseSummary(intendedUse)` — teen-readable files vs license vs copyright; never “you own the art”
- `humanMadeFromStrokes(artwork)` — true only for Arya Canvas + non-empty process log
- `sampleProcessLog(ops)` — bound-size log for replay

Every state mutation should execute transactionally with its timeline event and notification. For mock mode, emulate this with a single reducer/store command.

## 7. Demo state strategy

Use a `DemoRepository` implementing the same repository interfaces planned for Supabase. Persist mutations to local storage with a schema version and provide “Reset demo.”

Recommended store slices:

- session/persona
- saved content
- requests and offers
- orders/workspace
- waitlists
- notifications
- simulated ledger
- created artworks/posts/services (already in the demo store)
- process logs keyed by artwork or file id (Phase 8)

Do not use scattered `useState` as the authoritative order state. Use a single command-based store so Buyer and Artist personas see the same transition.

## 8. Phased build plan

### Status

| Phase | Outcome | Status |
| --- | --- | --- |
| 0 Foundation | Primitives, demo switcher, tests | Shipped |
| 1 Discovery | Search, art detail, profile tabs | Shipped |
| 2 Request | Wizard, price, parent checkpoint | Shipped |
| 3 Response + checkout | Accept/counter/decline, demo pay | Shipped |
| 4 Workspace | Messages, sketch/final, review | Shipped |
| 5 Create + Studio | Power canvas, publish, services | Shipped (layers in-session only) |
| 6 Waitlists, notifications, polish | Connected supporting systems | Shipped enough to demo; polish is ongoing |
| 7 Supabase | Shared backend | **Slice 1 in progress** — public drawings + pairs only |
| 8 License + identity A | Copy + replay/share/proof | **Shipped** |
| 9 Challenges | Human-only brief grid | **Shipped** |
| 10 Process stories | Dual opt-in unboxing | **Shipped** |

### Phase 0 — Foundation hardening

**Outcome:** Current Phase 1 UI becomes a stable base.

Tasks:

1. Add package lockfile and align lint script with the installed Next.js version.
2. Add `docs/`, formatting, ESLint, and test scripts.
3. Introduce UI primitives: Button, Input, Textarea, Select, Checkbox, Tabs, Dialog, Toast, EmptyState, Skeleton.
4. Refactor large artist/service pages into feature components.
5. Expand domain types and add Zod schemas.
6. Add accessible demo persona switcher and reset control.
7. Add Vitest + Testing Library for domain/components and Playwright for smoke flows.

Exit criteria: current routes render consistently, build passes, and a smoke test navigates all primary destinations.

### Phase 1 — Complete discovery and artist evaluation

**Outcome:** Buyer can confidently find and evaluate an artist.

Tasks:

1. Expand seeds to required per-artist content volume.
2. Add artwork detail route.
3. Implement combined search/filter URL state.
4. Add full artist tabs, commission rules, reviews, and About.
5. Implement saves with persistent demo state.
6. Add fair-discovery sections and deterministic ranking explanation.
7. Implement Open/Limited/Waitlist/Closed CTA behavior.

Exit criteria: buyer can search, filter, save, open art, inspect every profile tab, and select an eligible service.

### Phase 2 — Commission request vertical slice

**Outcome:** Buyer submits a complete, priced request.

Tasks:

1. Implement service configuration and add-ons.
2. Build request wizard with validation and local draft persistence.
3. Add reference upload simulation with preview and constraints.
4. Implement deterministic price calculator.
5. Add rules acknowledgment and submission review.
6. Add protected-teen parent-approval checkpoint.
7. Create request confirmation and order dashboard entry.

Exit criteria: LunaLines service can be requested end-to-end and appears to both personas as `Awaiting artist`.

### Phase 3 — Artist response and simulated checkout

**Outcome:** Terms become an accepted, paid simulated order.

Tasks:

1. Build artist incoming-request queue and detail view.
2. Implement accept, counter, and decline dialogs.
3. Implement buyer counteroffer accept/reject.
4. Snapshot accepted terms.
5. Build simulated checkout and confirmation.
6. Generate workspace, milestones, ledger entry, and notifications.
7. Add scenario shortcuts for each response branch.

Exit criteria: accept and counter paths reach `In progress`; decline ends correctly; no invalid transition is possible from the UI or domain service.

### Phase 4 — Commission workspace

**Outcome:** Buyer and artist complete a project through approvals.

Tasks:

1. Build responsive workspace shell and next-action banner.
2. Implement project-scoped messages and system events.
3. Add message contact-sharing guard and blocked-message state.
4. Implement reference/deliverable file views.
5. Build milestone timeline.
6. Add sketch drawing (primary) and upload (alternative), approval, and revision feedback.
7. Add final drawing/upload and delivery acceptance.
8. Complete order and move simulated earnings from pending to available.
9. Add review flow.

Exit criteria: role-switching completes the primary 16-step buyer journey without manual state editing.

### Phase 5 — Artist creation and Studio

**Outcome:** Artist can create supply and manage capacity.

Tasks:

1. Build the drawing studio (pencil/ink/marker/airbrush, layers, fill, eyedropper, symmetry, zoom, stabilizer, export).
2. Build artwork/post creation around the canvas, with file upload as fallback.
3. Implement “Offer commissions like this.”
4. Build service editor with examples, add-ons, rules, and preview.
5. Build availability and slot controls.
6. Complete Studio request/project dashboards.
7. Add simulated balance and ledger views.
8. Support unpublished draft and published states.
9. Surface published canvas work in Discover and artist portfolio.

Exit criteria: artist draws and publishes artwork, derives a service, opens slots, receives the seeded buyer request, draws sketch/final in the workspace, and sees earnings after completion.

### Phase 6 — Waitlists, notifications, and polish

**Outcome:** All supporting MVP systems feel connected.

Tasks:

1. Implement waitlist join/leave/position/promotion.
2. Complete notification center, badges, links, and mark-read actions.
3. Add saved-artists/artwork page.
4. Add loading, empty, error, and optimistic states.
5. Run keyboard, reduced-motion, contrast, and mobile audits.
6. Add analytics event adapter and demo event inspector. **Shipped on the mock:** last events list on Notifications.
7. Run complete regression test and stakeholder demo script.

Exit criteria: all PRD requirements are demonstrable, polished, and regression-tested.

### Phase 7 — Supabase migration (after UX validation)

**Outcome:** Shared multi-session backend replaces local demo persistence.

**Slice 1 (in progress):** public visitor drawings, process logs, and draw-back pairs. Service-role writes, public reads. No auth emails, no cards, no shared orders.

Tasks:

1. Create project and migrations; generate database types. **Slice 1 SQL lives in `supabase/migrations/20261102_published_art.sql`.**
2. Add cookie-based Supabase Auth with demo-friendly login.
3. Implement RLS and private Storage policies before importing user data.
4. Implement Supabase repositories behind existing interfaces.
5. Seed the five canonical artists and milestone scenarios.
6. Add Realtime only for messages/notifications if testing proves it valuable.
7. Add rate limits, audit logging, error monitoring, backups, and security review.

Exit criteria: two authenticated browser sessions complete the same flow with participant isolation tests passing.

### Phase 8 — License copy and identity A (shipped)

**Outcome:** A teen can state what they bought. A published Arya-canvas piece can replay and share without leaving the product.

Tasks:

1. Add `licenseSummary(intendedUse)` and show it on request review, checkout, and order snapshot (PRD §8.3.1). Never “you own the art.”
2. Record a compact process log while drawing (sampled strokes/fills, paper, size). Cap size; reuse localStorage quota handling.
3. Derive ~8–15s replay and a share card (still + Drawn on Arya; Human-made only with a non-empty log).
4. Artwork detail: Play replay (opt-in; no autoplay when `prefers-reduced-motion`); copy/download share card.
5. Uploads: no fake replay, no stroke-backed human-made mark.
6. Studio: first paid piece moment after the artist’s first completed order.
7. Events: `replay_played`, `share_card_copied`, `process_log_recorded`, `first_paid_piece_viewed` — product verbs only.
8. Tests: empty log cannot claim proof; license copy helpers; existing marketplace tests still pass.

Exit criteria: [Demo and QA](./DEMO_AND_QA.md) primary loop still works; license and identity A gates pass; no Appendix A language in UI.

### Phase 9 — Human-only challenges (shipped)

**Outcome:** One seeded brief; Arya-canvas entries only; ranked by saves; Try this brief opens Create.

See Drawing Identity PRD Loop 2. No follower ranking. No upload entries.

### Phase 10 — Process stories (shipped)

**Outcome:** After final acceptance, public sketch→final only if both parties opt in. Protected teen default private.

See Identity PRD Loop 3. Share process on completed orders. Discover + `/process/[id]`. No auto-post. Briefs stay off the public story.

## 9. Testing plan

### Unit

- Price and add-on calculations.
- Order state transition matrix.
- Revision limits.
- Waitlist ordering/promotion.
- Contact-sharing matcher and false-positive cases.
- Discovery ranking excludes follower count.
- Canvas export helpers produce JPEG data URLs and reject empty drawings.
- Drawn files map to `DemoFile` with `source: "arya-canvas"`.
- `licenseSummary` distinguishes personal vs commercial and never claims copyright transfer.
- Empty process log cannot yield human-made-from-strokes.
- Process log sampling stays under a documented size cap.

### Component

- Request validation and estimated price updates.
- Availability CTA variants.
- Protected-teen labels and approval modal.
- Workspace next-action banners by role/status.
- File and message error states.

### End-to-end

1. Discover → Luna profile → request → accept → checkout → sketch approval → final acceptance → review.
2. Request → counteroffer → buyer acceptance → checkout.
3. Request → decline.
4. Sketch revision consumes one revision and preserves timeline.
5. Protected teen attempts to share email/phone and receives blocked-message UI.
6. Join SketchMaya waitlist → open slot → promotion notification.
7. Artist draws artwork on Arya → publishes → piece appears in Discover and `/art/[id]`.
8. Artist creates a service from art → opens slot.
9. In-progress order: artist draws sketch → buyer approves → artist draws final.
10. Unauthorized persona cannot access another order workspace.
11. Checkout license sentence is visible for personal and commercial.
12. Canvas publish exposes replay and share; upload-only does not fake a replay.

Manual coverage for 1–10 lives in [Demo and QA](./DEMO_AND_QA.md). Automate 11–12 with Vitest plus the artwork page when Phase 8 lands. Playwright e2e is still a gap.

### Visual and accessibility

- Screenshots at 360×800, 768×1024, and 1440×900.
- Automated Axe scan on primary routes, supplemented by keyboard testing.
- No layout shift from artwork cards with known dimensions.

## 10. Cursor execution protocol

Give Cursor **one phase at a time**. Phases 0–10 are shipped. Phase 7 slice 1 is public drawings only. For each phase:

1. Read [docs/README.md](./README.md), [CURRENT_STATE.md](./CURRENT_STATE.md), this plan, and the relevant PRD section.
2. Inspect the repository and state current behavior before editing.
3. Produce a file-level plan and identify risks.
4. Implement the smallest coherent vertical slice.
5. Add or update tests with the behavior.
6. Run build, targeted tests, and the [Demo and QA](./DEMO_AND_QA.md) loops that the change can break.
7. Report changed files, acceptance criteria met, and known gaps.
8. Commit with a phase-scoped message only after the user asks.

Never print the private motivational model in UI. Never add generative fill, open DMs, follower counts, or wallet/NFT chrome.

Suggested next Cursor instruction:

```text
Phase 7 slice 1 is public drawings only. Do not start auth, cards, or order sync unless explicitly asked. Phases 0–10 stay on the mock demo. Preserve process stories (dual opt-in, no brief leak, no teen auto-post), challenges, replay/license, and the marketplace loop. If fixing a gap, keep mutations in the demo reducer. Run npm test, typecheck, and build. Verify in the browser.
```

## 11. Immediate backlog

| Priority | Item | Size | Dependency |
| --- | --- | --- | --- |
| P2 | Playwright smoke | M | Stable routes |
| P2 | Supabase migration | XL | UX validation |
| P3 | Provenance certificate (not NFT UX) | XL | Counsel + 18+ |

## 12. Architecture decision log

| Decision | Choice | Reason |
| --- | --- | --- |
| Backend timing | Mock repository first, Supabase after vertical slice | Fast iteration without throwaway UI logic |
| Data access | Server-only DAL and repository interfaces | Consistent security boundary and adapter migration |
| Mutations | Validated Server Actions | Fits Next.js App Router; every action still authorizes |
| Files | Private Supabase Storage later | Project references and deliveries are participant-only |
| Money | Integer cents, simulated ledger | Avoids floating-point errors and supports later payment adapter |
| Terms | Immutable accepted-offer snapshot | Preserves what buyer and artist agreed to |
| Messaging | Order-scoped only | Supports project context and teen safety; avoids open DM scope |
| Discovery | Relevance + availability + freshness + exposure boost | Matches product promise and avoids follower-count dominance |
| Realtime | Deferred, limited to messages/notifications | Not required to validate the core UX |
| Drawing | In-browser canvas, JPEG export into demo store | Artists must be able to make work on Arya; localStorage cannot hold raw PSD/PNG layers |
| Canvas vs upload | Canvas is primary; upload remains | Supports teens drawing here without blocking artists who already work in Procreate |
| Hosting | Vercel Hobby from GitHub `main` | Public demo URL without Cursor hosting |
| License | Files + usage license; artist keeps copyright | Industry default; see PRD §8.3.1 |
| Identity UI | Replay, share card, human-made proof | Drawing is the ad; private hungers never named |
| Provenance | Later certificate possible; no NFT chrome now | Wallets and mint-to-post fight teen safety |

## 13. Implementation risks

- **Scope expansion:** keep physical delivery, real money, full moderation, and parent verification out of the MVP.
- **State inconsistency:** use a transition service and timeline event for every order mutation.
- **Privacy leakage:** never use public storage for references, sketches, finals, or message attachments.
- **Demo brittleness:** seed every critical state and provide reset/scenario controls.
- **Client-side authorization:** UI conditions improve UX but cannot replace server and RLS checks.
- **Teen-safety false confidence:** label protections as simulated and require specialist legal/safety review before launch.
- **Artwork performance:** require dimensions, responsive image sizes, thumbnails, and upload limits.
- **Canvas storage:** compress exported drawings; catch localStorage quota errors; do not persist full unsampled pointer history.
- **Canvas overreach:** no generative fill, animation, CMYK, or PSD round-trip. Layers (max 8) are in-session only until a later persistence design.
- **Identity leak:** never ship vice names, “hunger,” or NFT/mint language in UI.
- **License confusion:** never imply the buyer owns copyright because they paid or received a file.
