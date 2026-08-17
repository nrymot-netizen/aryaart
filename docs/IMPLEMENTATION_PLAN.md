# Arya Art Technical Architecture and Implementation Plan

**Audience:** Cursor/Codex implementers and product reviewers  
**Companion:** [Product Requirements](./PRODUCT_REQUIREMENTS.md)

## 1. Delivery strategy

Build a convincing vertical slice before broadening the marketplace. Keep mock-backed repository interfaces until the complete buyer/artist transaction works, then replace those adapters with Supabase. This preserves demo speed without embedding business logic in components.

### Definition of done for every phase

- Requirements and acceptance criteria for the phase are implemented.
- Desktop and 360px mobile layouts are manually verified.
- Keyboard and focus behavior are checked for new interactions.
- `npm run build` passes with no TypeScript errors.
- Relevant unit and flow tests pass.
- Previously completed core flows still work.
- Seed/demo reset produces a deterministic state.

## 2. Proposed application architecture

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
    safety/                  protected-account and blocked-message UI
  features/
    auth/
    discovery/
    commissions/
    orders/
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
| `artworks` | id, artist_id, title, description, image_path, style, subject, tags, tools, ai_disclosure, visibility, published_at |
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
| `orders` | id, accepted_offer_id, buyer_id, artist_id, status, price_cents, currency, terms_snapshot, revision_limit, revision_used |
| `simulated_payments` | id, order_id, amount_cents, status, approved_by_parent, created_at |
| `simulated_ledger` | id, artist_id, order_id, entry_type, amount_cents, available_at |

### Workspace and operations

| Table/model | Important fields |
| --- | --- |
| `messages` | id, order_id, sender_id, body, moderation_state, created_at |
| `files` | id, order_id, uploader_id, kind, storage_path, mime_type, size_bytes, version, created_at |
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
- Only the artist can submit sketch/final file kinds.
- Only the buyer can approve/revise/accept delivery.
- Only a completed-order buyer can review that order.

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

Do not use scattered `useState` as the authoritative order state. Use a single command-based store so Buyer and Artist personas see the same transition.

## 8. Phased build plan

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
6. Add sketch upload, approval, and revision feedback.
7. Add final upload and delivery acceptance.
8. Complete order and move simulated earnings from pending to available.
9. Add review flow.

Exit criteria: role-switching completes the primary 16-step buyer journey without manual state editing.

### Phase 5 — Artist creation and Studio

**Outcome:** Artist can create supply and manage capacity.

Tasks:

1. Build artwork/post creation forms.
2. Implement “Offer commissions like this.”
3. Build service editor with examples, add-ons, rules, and preview.
4. Build availability and slot controls.
5. Complete Studio request/project dashboards.
6. Add simulated balance and ledger views.
7. Support unpublished draft and published states.

Exit criteria: artist creates artwork, derives a service, opens slots, receives the seeded buyer request, and sees earnings after completion.

### Phase 6 — Waitlists, notifications, and polish

**Outcome:** All supporting MVP systems feel connected.

Tasks:

1. Implement waitlist join/leave/position/promotion.
2. Complete notification center, badges, links, and mark-read actions.
3. Add saved-artists/artwork page.
4. Add loading, empty, error, and optimistic states.
5. Run keyboard, reduced-motion, contrast, and mobile audits.
6. Add analytics event adapter and demo event inspector.
7. Run complete regression test and stakeholder demo script.

Exit criteria: all PRD requirements are demonstrable, polished, and regression-tested.

### Phase 7 — Supabase migration (after UX validation)

**Outcome:** Shared multi-session backend replaces local demo persistence.

Tasks:

1. Create project and migrations; generate database types.
2. Add cookie-based Supabase Auth with demo-friendly login.
3. Implement RLS and private Storage policies before importing user data.
4. Implement Supabase repositories behind existing interfaces.
5. Seed the five canonical artists and milestone scenarios.
6. Add Realtime only for messages/notifications if testing proves it valuable.
7. Add rate limits, audit logging, error monitoring, backups, and security review.

Exit criteria: two authenticated browser sessions complete the same flow with participant isolation tests passing.

## 9. Testing plan

### Unit

- Price and add-on calculations.
- Order state transition matrix.
- Revision limits.
- Waitlist ordering/promotion.
- Contact-sharing matcher and false-positive cases.
- Discovery ranking excludes follower count.

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
7. Artist creates artwork → creates service from art → opens slot.
8. Unauthorized persona cannot access another order workspace.

### Visual and accessibility

- Screenshots at 360×800, 768×1024, and 1440×900.
- Automated Axe scan on primary routes, supplemented by keyboard testing.
- No layout shift from artwork cards with known dimensions.

## 10. Cursor execution protocol

Give Cursor one phase at a time. For each phase:

1. Read this plan and the relevant PRD section.
2. Inspect the repository and state current behavior before editing.
3. Produce a file-level plan and identify risks.
4. Implement the smallest coherent vertical slice.
5. Add or update tests with the behavior.
6. Run build, targeted tests, and route smoke checks.
7. Report changed files, acceptance criteria met, and known gaps.
8. Commit with a phase-scoped message only after review.

Suggested first Cursor instruction:

```text
Implement Phase 0 from docs/IMPLEMENTATION_PLAN.md. Read docs/PRODUCT_REQUIREMENTS.md first. Preserve the existing visual direction and working routes. Introduce primitives, validation, demo persona state, and tests without starting Supabase or implementing later commission flows. Run the production build and tests, then report acceptance criteria and remaining gaps.
```

## 11. Immediate backlog

| Priority | Item | Size | Dependency |
| --- | --- | --- | --- |
| P0 | Demo persona switcher and shared state | M | None |
| P0 | Expanded domain types and state transitions | M | None |
| P0 | UI primitives and form validation | M | None |
| P0 | Complete Luna service request wizard | L | Above foundations |
| P0 | Artist request response flow | L | Request wizard |
| P0 | Simulated checkout | M | Accepted offer |
| P0 | Workspace shell and milestones | L | Order creation |
| P1 | Sketch/revision/final workflow | L | Workspace |
| P1 | Expanded artist content and tabs | M | Domain types |
| P1 | Search/filter URL state | M | Expanded seed data |
| P1 | Waitlist promotion | M | Notifications |
| P1 | Studio creation tools | L | Shared forms |
| P2 | Supabase migration | XL | UX validation |

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

## 13. Implementation risks

- **Scope expansion:** keep physical delivery, real money, full moderation, and parent verification out of the MVP.
- **State inconsistency:** use a transition service and timeline event for every order mutation.
- **Privacy leakage:** never use public storage for references, sketches, finals, or message attachments.
- **Demo brittleness:** seed every critical state and provide reset/scenario controls.
- **Client-side authorization:** UI conditions improve UX but cannot replace server and RLS checks.
- **Teen-safety false confidence:** label protections as simulated and require specialist legal/safety review before launch.
- **Artwork performance:** require dimensions, responsive image sizes, thumbnails, and upload limits.
