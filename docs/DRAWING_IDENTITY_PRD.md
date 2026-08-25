# Arya Art Drawing Identity PRD

**Status:** Build-ready companion specification  
**Version:** 0.2  
**Updated:** August 25, 2026  
**Product type:** Share, proof, and identity layer on top of the marketplace demo  
**Companion:** [Docs index](./README.md) · [Product Requirements](./PRODUCT_REQUIREMENTS.md) · [Implementation Plan](./IMPLEMENTATION_PLAN.md)

This document specifies what Arya *becomes* after the transaction loop works: the default place a generation draws, gets found for the work, and gets paid. It does not replace the MVP PRD. When the two conflict, teen safety, art-first presentation, and “no generative AI / no open DMs” win.

## 0. Secrecy rule (non-negotiable)

Arya is built with a private motivational model. **That model is never shown.**

| Never appears in | Examples |
| --- | --- |
| UI copy, empty states, tooltips, onboarding | Any vice name, “hunger,” “sin,” “framework,” “engine” |
| Marketing, press, README hero, social captions | Culture-war slogans, “we designed for envy” |
| Notifications, emails, OG images, share cards | Internal code names |
| User-visible analytics labels | Event titles in a demo inspector |
| Community posts from the official voice | Explainer threads about the model |

User-facing language is only the work: *Drawn on Arya*, *human-made*, *replay*, *process*, *waitlist*, *first paid piece*. Implementers may use [Appendix A](#appendix-a-internal-build-os-never-ship) and code comments. Public analytics event *names* must be product verbs (`replay_played`, `share_card_copied`), never model names.

If a screen would only make sense after hearing the private model, the screen is wrong. Rebuild it in art language.

## 1. Product summary

Arya is not trying to win as a nicer gig listing site. The company shape is **tool + identity + pay**:

- The **canvas** is the factory. A drawing that happens on Arya can prove it was made by a person.
- **Discover** is the stage. Artwork leads. Demand (slots, waitlist, completed work) is status. Follower counts stay gone.
- The **order workspace** is the cash register. Desire becomes a job without a DM.

The artifact that travels is the drawing — especially a short replay of it being made — not a shop URL.

### One-sentence public product

She draws on Arya, people find her because of the work, she gets paid, and nobody DMs her.

### Honest money note

Take-rate on custom portraits will not, by itself, make a generation-defining company. The bet is that “I draw here” becomes identity (the way “I post here” did for other networks), and commerce scales around that. This PRD specifies the identity and share layer that makes that bet testable.

## 2. Goals and non-goals

### Goals

- Every Arya-canvas publish can produce a **share card** and a **short replay** without leaving the product.
- Viewers can go from a replay or share card to **trying the same prompt** on a blank canvas, or to **requesting a commission** from that artist.
- **Human-made** is a visible, true claim for Arya-canvas work, backed by a stroke record, not a sticker anyone can fake on an upload.
- **Demand** (availability, waitlist, completed count, rating) remains the public proof of status. Follower counts remain unpublished.
- **First paid piece** is a first-class studio moment, not a buried ledger row.
- Commission **sketch → final** can be told as a process story when both sides allow it.
- A weekly **human-only prompt** can exist as a grid of Arya-canvas drawings of the same brief.
- The studio stays **serious on a laptop/Chromebook-class browser**. Convenience is not an excuse for a toy canvas.
- Protected-teen and no-DM rules still apply to every new surface.

### Non-goals

- Explaining or branding the private motivational model.
- Open social graph, public comments-as-DMs, who-viewed-your-profile, or follower counts.
- Generative fill, prompt-to-image, or “AI complete this sketch” to chase shareability.
- Native TikTok/Reels posting APIs in the demo (export + copy is enough).
- Live multiplayer rooms, animation timelines, or Procreate parity.
- Culture-war marketing, sexualized marketing, or body-as-product.
- Fake waitlists, fake demand, or fake “paid” badges.
- School-official accounts (still out of scope). Chromebook *capability* is in scope.
- Cryptocurrency wallets, minting, or NFT marketplace UX in any current phase. Provenance *may* come much later; see [§11.1](#111-later-door-provenance-not-a-jpeg-casino).

## 3. Public language

### Preferred

Drawn on Arya · Human-made · Replay · Process · Share · Waitlist · Slots open · First paid piece · Offer commissions like this · Made in the browser · Certificate / Provenance / Edition of 1 (later only, never “NFT” in UI)

### Banned in product copy

Vice names and synonyms used as product framing · “Lust,” “thirst,” “sin,” “vice,” “deadly” · “Clout,” “followers,” “going viral” as UI chrome · “Prompt” as a generative-AI control (a *challenge brief* is allowed) · Sexualized captions · Exact ages · “NFT,” “mint,” “gas,” “floor,” “wagmi” as product chrome (even if a chain is used later)

“I want that” is a *feeling to design for*, not a headline to print.

## 4. Design hungers (product jobs)

Build for these jobs. Do not label screens with them.

### 4.1 I made this

**Job:** Be seen as a real artist, not a prompt operator.

**Surfaces:** Artwork detail, share card, portfolio, “Drawn on Arya” mark, waitlist/slots as demand.

**Must:**

- Arya-canvas pieces show **Drawn on Arya** and **Human-made** as quiet, keepable marks (Shot-on-iPhone energy, not a screaming watermark).
- Uploaded pieces may disclose tools and AI-use; they must **not** receive the Human-made-from-strokes mark.
- Share card includes: artwork crop, title, artist display name, Drawn on Arya, human-made if eligible. No follower counts. No vice language.
- Protected-teen profiles stay age-group only.

**Must not:** Follower counts, public like-to-clout leaderboards, watermark that covers the art.

### 4.2 First paid piece

**Job:** Get paid for a skill other apps treat as a hobby.

**Surfaces:** Studio home, order complete, simulated earnings.

**Must:**

- After the artist’s first completed paid order (demo included), Studio shows a durable **First paid piece** moment: the artwork/order title, buyer first name or “a buyer,” amount in demo currency, link to the order.
- Earnings remain a clean scoreboard (pending vs available). No tip jar, no surprise fees, no fake scarcity on slots.

**Must not:** Gamified streaks that shame inactivity, “hustle harder” copy, public dollar amounts on the artist’s public profile in the MVP (Studio only).

### 4.3 I want that

**Job:** Want the image badly enough to save, request, or try drawing it. Style crush, not people-crush.

**Surfaces:** Discover, artwork detail, related work, request CTA.

**Must:**

- Art stays visually dominant. Request is how want becomes a job.
- Primary paths from a published piece: Save · Request a commission like this · Try this prompt (if a challenge or artist-provided prompt exists).
- Subjects stay character, portrait, pet, landscape, environment, fan art, OC, emote/avatar — never a dating or body marketplace.

**Must not:** Sexualized crops, “hot artist” framing, thirst comments, marketing of bodies.

### 4.4 I could do that

**Job:** Seeing a peer’s work or a paid job makes the next action “open the canvas,” not “doomscroll.”

**Surfaces:** Challenge grid, related Arya-canvas work, public demand stats.

**Must:**

- Challenges show many human drawings of **one** brief, ranked by saves (and optional staff picks), never followers.
- Artist cards may show completed commissions and availability. They must not show follower counts.

**Must not:** Who viewed your profile · private stalking · ranking teens by revenue on a public board.

### 4.5 One more piece

**Job:** Keep looking because the work is good; keep drawing because the desk is serious.

**Surfaces:** Discover feed, saves, drawing studio, replay player.

**Must:**

- Replay is the edible object: ~8–15 seconds of the drawing appearing, then the still.
- `prefers-reduced-motion`: default to the still image; replay is opt-in, labeled, and not autoplay.
- Feed quality stays fit-over-followers. No junk autoplay carousels aimed at kids.

**Must not:** Infinite low-quality autoplay, streak guilt, dark-pattern “one more” interstitials.

### 4.6 Human-made

**Job:** Channel anger at AI floods and unsafe DMs into the product, not into a brand rant.

**Surfaces:** Canvas (no generate), Human-made mark, workspace-only messages, protected-teen state.

**Must:**

- No generative fill, prompt box, or inpainting in the studio.
- Arya-canvas publish requires a non-empty stroke record (or equivalent recorded ops: strokes + fills). An empty canvas still cannot publish.
- Official voice stays calm: we draw, we don’t generate, talk stays on the order. Not a culture-war account.

**Must not:** “AI is the enemy” banners, dunking on other artists, weakening DMs “for growth.”

### 4.7 Already on this computer

**Job:** Do serious work without an iPad stack and without hunting Instagram DMs.

**Surfaces:** `/create/draw`, order draw desk, request wizard.

**Must:**

- Drawing remains first-class with mouse, touch, and pen.
- Performance budget: a Chromebook-class laptop can draw, undo, and export without the tab locking. If replay encoding is heavy, do it async and keep the desk usable.
- Upload stays the fallback for work made elsewhere — labeled as such.

**Must not:** Ship a toy canvas to chase share clips. If it is not a serious desk, convenience fails.

## 5. Share loops

Ship in this order. Each loop must work without the private model appearing on screen.

### Loop 1 — Replay and share card (first)

**Why first:** The drawing already happens on Arya. Other tools screen-record. Arya can mint the movie from the record.

**Behavior:**

1. While drawing on Arya, the studio records a compact **process log** (strokes, fills, layer visibility used for composite, paper color).
2. On publish (Create) or on artist-chosen export, Arya builds:
   - still composite (existing JPEG),
   - **replay** (~12s, sampled, not real-time wall clock),
   - **share card** image (still + marks).
3. Artwork detail plays replay on explicit play (or hover-to-play on desktop if motion is allowed). Mobile: tap play.
4. Share actions in the demo: copy link, download share card, download replay file if feasible in-browser. No requirement to post to TikTok from the app.
5. End card / last frames: artwork, artist name, Drawn on Arya, Human-made if eligible.

**Privacy:** Commission sketches, finals, and buyer refs stay participant-only. Replay of those files is **order-only** unless Loop 3 consent is given.

**Acceptance:**

- Publish an Arya-canvas piece → artwork page has Play replay and Share.
- Reduced-motion users see still first; play is a button.
- Upload-only artworks have Share of the still, no Human-made-from-strokes mark, no fake replay.
- Demo reset clears process logs with the rest of created art.
- Domain tests cover: empty log cannot claim human-made-from-strokes; sampling produces a bounded replay length.

### Loop 2 — Human-only challenge (second)

**Behavior:**

- One active **brief** at a time (demo can seed a weekly prompt).
- Entry condition: drawn on Arya for that brief (process log bound to the challenge id). Uploads cannot enter.
- Grid of entries, ranked by saves. Optional “Request this artist” on each tile.
- “Try this brief” opens Create with the brief pinned, not a generative prompt box.

**Acceptance:**

- Artist persona can enter, appear on the grid, and be requested from a tile.
- Buyer persona can save entries and open Try this brief.
- No follower ranking. No AI entry path.

### Loop 3 — Process story (third)

**Behavior:**

- After final acceptance, artist and buyer each get a **Share process** opt-in (default off).
- If both opt in, Arya may publish a public process post: sketch still, final still, optional replay of the *final* only if the artist also opts in replay. Brief text stays private unless the buyer opts to include a one-line public caption they type.
- Protected-teen orders: default remains private; parent-supported rules from the MVP PRD still apply. Do not auto-post teens’ paid work.

**Acceptance:**

- Neither side opted in → nothing public.
- Both opted in → Discover can show a process story with the same safety as other public art.
- Messages and references never appear on the process story.

### Loop 4 — Computer you already have (ongoing quality)

Not a campaign. A bar: 360px drawing still works; laptop drawing still feels like a desk; share/replay never blocks the next stroke.

## 6. Information architecture

| Route | Purpose |
| --- | --- |
| `/art/[id]` | Still, replay, share, request, try-this-brief when present |
| `/create/draw` | Studio; publish produces still + replay + share card |
| `/challenges` or Discover module | Active brief + grid (Loop 2) |
| `/challenges/[id]` | Brief detail and entries |
| `/studio` | First paid piece moment; demand stats |
| `/orders/[id]` | Private replay; Share process after complete (Loop 3) |

Artwork-first Discover gains a **Process** / **Drawn on Arya** rhythm already in the MVP; replay should appear there as a playable still, not a separate social product.

## 7. Domain additions

Keep these behind the same command-based demo store until Supabase. Do not put vice names in types or event names.

| Concept | Fields (minimum) | Notes |
| --- | --- | --- |
| `ProcessLog` | artwork or file id, ops (sampled strokes/fills), paper, canvas size, `challengeId?` | Bound size. Sample pointer points. Cap ops so localStorage cannot blow the quota (reuse existing quota handling). |
| `Replay` | durationMs target 8000–15000, frame policy, reduced-motion still | Derived from `ProcessLog`; may be generated on demand in the demo. |
| `ShareCard` | image, title, artist display name, marks | Marks: Drawn on Arya; Human-made only if process log exists and work is Arya-canvas. |
| `HumanMadeProof` | `arya-canvas` + non-empty process log | Uploads can set `aiDisclosure` only. |
| `Challenge` | id, brief, opensAt, closesAt, status | One active in demo. |
| `ChallengeEntry` | challengeId, artworkId, artistId | Artwork must be Arya-canvas for that challenge. |
| `ProcessStoryConsent` | orderId, artistOptIn, buyerOptIn | Both required to publish. |
| `FirstPaidPiece` | orderId, artistId, completedAt | Derived from first completed order for that artist. |

Events (instrumentation, not UI): `replay_played`, `replay_completed`, `share_card_copied`, `share_card_downloaded`, `process_log_recorded`, `challenge_opened`, `challenge_entered`, `try_brief_clicked`, `process_story_opt_in`, `process_story_published`, `first_paid_piece_viewed`.

## 8. Teen safety and privacy

All of [PRD §9](./PRODUCT_REQUIREMENTS.md) still applies. Additions:

- Replays of private order files are not public by default.
- Share cards must not include brief text, references, messages, or contact information.
- Challenges are public art. Protected-teen entries follow the same public-portfolio rules as other published work. Exact age never appears.
- No “who viewed,” no public comment threads that recreate DMs. Saves and structured requests only.
- Desire is visual (style, character, pet, place). Never sexualize minors. Never market bodies.
- Official share captions suggested in-product stay art-literal: title, artist, Drawn on Arya.

## 9. Accessibility

- Replay is media: label the control, do not autoplay against `prefers-reduced-motion`.
- Share card text meets contrast on the card chrome; the artwork itself is exempt as image content.
- Challenge grid is keyboard-reachable; each tile has a name (title + artist).
- Motion on share/replay chrome respects reduced motion; user strokes are input, not decoration.

## 10. Success metrics (demo / early live)

For a moderated test (same scale as the MVP PRD, plus share):

| Metric | Target |
| --- | --- |
| Artist who publishes from canvas can play replay on the artwork page | ≥ 90% |
| Tester can copy/download a share card without coaching | ≥ 80% |
| Reduced-motion: still is default, play is obvious | ≥ 85% favorable |
| Buyer from a challenge tile can start a request or try the brief | ≥ 70% |
| No tester can find vice/framework language in the UI | 100% |
| Human-made mark absent on a file upload with no process log | 100% |
| Protected-teen process story cannot publish without explicit opt-in (default off) | 100% |

This is not a forecast of a billion-dollar outcome. It is proof the identity layer is real.

## 11. Phased delivery

### Phase A — Replay and proof (build next)

Maps to [Implementation Plan Phase 8](./IMPLEMENTATION_PLAN.md). Process log in the studio, sampled replay, share card, Human-made + Drawn on Arya rules, first paid piece in Studio, tests for proof and empty-canvas rules. Demo store only. Ship license copy (PRD §8.3.1) in the same phase.

### Phase B — Challenge grid

Seeded brief, enter from Create, Discover module, try-this-brief, save ranking.

### Phase C — Process stories

Dual opt-in after completion; public process post; teen default private.

### Phase D — After UX validation

Persist process logs in storage (not only localStorage), production encoding, optional native share sheets. Still no generative AI. Still no open DMs. Still no wallets.

### 11.1 Later door: provenance, not a JPEG casino

Much later — after the identity loop is real, after real payments, after counsel — Arya may attest **human-made proof** and **commission ownership** in a way a third party can verify. That is the only NFT-shaped idea that fits this company.

The valuable object is not a flipable image. It is the **process log** (this was drawn, not generated) plus, for paid work, a **certificate** that this buyer received this unique piece under these terms. A chain, if used, hashes that record. The JPEG is the picture. The record is the receipt. **It does not move copyright.** What the buyer may do with the files is still the license on the order ([PRD §8.3.1](./PRODUCT_REQUIREMENTS.md#831-what-the-buyer-owns-default-license)).

**If that door opens, it must look like gallery paperwork, not 2021 Twitter:**

| Do | Do not |
| --- | --- |
| Optional certificate after a completed order | Required mint to publish or get discovered |
| Adult-only (18+) wallet or custodial certificate; teens keep Arya receipts only | Seed phrases, gas, or speculation for 13–17 |
| Copy: Certificate, Provenance, Edition of 1, Human-made proof | Copy: NFT, mint, floor price, collection drop |
| Artist keeps copyright unless the license says otherwise | “You bought the JPEG, you own the IP” confusion |
| One certificate per delivered commission, boring and true | PFP collections, generative mints, mint-to-earn |
| Proof serves I made this + Human-made + First paid piece | Proof as a casino for I want that |

Internal note (never UI): this is pride and proof, not a new vice surface. Greed here is a clean title to a paid unique, not a pump.

Until Phase D is done, implementers must not add chain SDKs, wallet buttons, or token-gated Discover.

## 12. Open decisions

1. Replay format in production (canvas frame capture vs vector replay of ops).
2. Whether share cards include a QR or only a short URL.
3. Whether challenge ranking later adds recency or staff picks beside saves.
4. Whether buyers can attach a public one-line caption on process stories.
5. Maximum process-log size and what happens when the artist exceeds it (still publish still; drop replay).
6. Chromebook performance floor (target device list).
7. Much later: whether provenance is a custodial Arya certificate, a public chain attestation of the process-log hash, or both — and which age gate counsel requires.

## 13. Refuse even if it would spike

Open DMs · generative fill for clips · follower counts · sexualized marketing · who-viewed-your-profile · fake waitlists · NFT-as-the-product (PFPs, drops, mint-to-earn, wallets for teens, mint-to-post) · childish UI teens will not show friends · culture-war brand · printing the private model anywhere users can see it.

---

## Appendix A — Internal build OS (never ship)

For implementers and the founder only. **Do not copy this appendix into UI, marketing, or user-facing events.**

The private model is the seven hungers mapped from a classical vice list. Product work is: satisfy the hunger, hide the name.

| Internal name | Public job (use this) | Build | Never |
| --- | --- | --- | --- |
| Pride | I made this | Share card, Drawn on Arya, demand not followers | Follower counts, clout chrome |
| Greed | First paid piece | Clean pay moment, unboxing later | Fake scarcity, tip-begging |
| Lust | I want that | Full-bleed art, request as the act | Bodies, teens, thirst copy |
| Envy | I could do that | Challenges, peer demand | Who-viewed, revenue shame boards |
| Gluttony | One more piece | Replay, serious studio time | Junk autoplay, guilt streaks |
| Wrath | Human-made | No generate, no DMs, stroke proof | Culture-war account |
| Sloth | Already on this computer | Browser desk, wizard not DMs | Toy canvas |

**Review gate:** Before shipping a surface, a reviewer answers: which public job is this for? Would the screen still make sense if Appendix A were deleted? If no, rewrite the copy.

> This document describes product behavior. It is not legal advice, a growth forecast, or a license to weaken safety.
