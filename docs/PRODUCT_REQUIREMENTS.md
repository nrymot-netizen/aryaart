# Arya Art Product Requirements Document

**Status:** Build-ready MVP specification  
**Version:** 1.1  
**Updated:** August 17, 2026  
**Product type:** Responsive web art discovery, in-app drawing, and commission marketplace demo  
**Companion:** [Docs index](./README.md) · [Implementation Plan](./IMPLEMENTATION_PLAN.md) · [Drawing Identity PRD](./DRAWING_IDENTITY_PRD.md)

## 1. Product summary

Arya Art helps people discover independent artists by the work they create, draw and publish on the platform, understand exactly what those artists offer, and complete a custom-art commission inside a structured, safer workspace.

The MVP must prove one complete transaction loop:

> Discover artwork → evaluate an artist → request a service → artist responds → simulated checkout → draw and approve through milestones → approve delivery → review.

It must also prove the matching artist loop:

> Draw and publish work → configure a service and availability → evaluate a request → manage the project → draw the sketch and final in-app → receive simulated earnings.

Artists (and buyers adding a visual brief) create on Arya with a touch-friendly canvas. File upload remains available for work made in other tools. Arya is not an unrestricted social network, a production payments platform, or a generative-AI studio. Discovery, in-app making, structured commerce, and project collaboration are the core.

## 2. Problem

Commission buyers currently face four recurring problems:

1. Artist discovery is often driven by audience size or social reach rather than fit.
2. Pricing, scope, availability, revision rules, and usage rights are inconsistent or hidden.
3. Requests and approvals happen across forms, email, and direct messages with little shared structure.
4. Teens who create or buy art need participation models that do not expose unnecessary personal information or rely on unrestricted messaging.

Artists face the inverse problems: low discoverability, repetitive qualification messages, unclear briefs, scope creep, fragmented files, and weak project-state visibility.

## 3. Product principles

1. **Art leads.** Artwork is visually dominant; marketplace mechanics support rather than overwhelm it.
2. **Fit over followers.** Follower counts are not displayed or used as a primary ranking signal.
3. **Clarity before commitment.** Scope, price estimate, revisions, turnaround, availability, and usage are visible before submitting.
4. **A workspace, not open DMs.** Project communication is attached to a commission and its milestones.
5. **Safety by default.** Teen protection is a product state, not a warning added later.
6. **Serious but approachable.** The interface is youthful and creative without feeling childish or gig-marketplace generic.
7. **Demo truthfulness.** Payments, payouts, parent approval, notifications, and moderation are clearly simulated in the MVP.

## 4. Target users

### 4.1 Explorer / buyer

- Teen or adult looking for original art, character art, portraits, gifts, or creator assets.
- May know a visual style but not a specific artist.
- Needs confidence in scope, quality, timing, and price.

### 4.2 Independent artist

- Teen or adult artist who accepts custom work.
- Needs a place to actually draw, plus discovery, clear request intake, workload control, and a professional delivery workflow.
- May offer multiple services with different prices and rules.
- May create finished pieces or commission deliverables in Arya, or import files from another app.

### 4.3 Supporting parent (simulated in MVP)

- Supports financial or commission actions for a protected teen account.
- Does not need a full parent portal in the MVP.
- Appears through approval states, status indicators, and confirmation screens.

### 4.4 Demo operator

- Product stakeholder or tester who needs to move both sides of the transaction forward without separate real accounts.
- Uses a visible role/account switcher and deterministic seeded scenarios.

## 5. Goals and non-goals

### MVP goals

- Demonstrate compelling artwork-first discovery.
- Let an artist draw a piece on Arya and publish it without leaving the product.
- Let an artist draw a commission sketch and final in the order workspace.
- Make an artist's commission readiness understandable in under 30 seconds.
- Complete the primary buyer and artist journeys without dead ends.
- Demonstrate structured communication and milestone approvals.
- Show credible protected-teen states without exposing exact age publicly.
- Create enough state and seeded content for usability testing and stakeholder demos.

### Non-goals

- Real payment processing or payouts.
- Identity or age verification.
- Legally complete parental consent.
- Production moderation or trust-and-safety operations.
- Open DMs, group chat, voice, or video.
- Physical shipping and tax handling.
- Native apps, school accounts, cryptocurrency, or NFTs. (A later provenance certificate is an open door in the [Drawing Identity PRD](./DRAWING_IDENTITY_PRD.md); it is not in this MVP.)
- AI image generation, AI inpainting, or text-to-image inside the canvas.
- Unlimited Procreate/Photoshop parity (animation, CMYK, PSD round-trip, 50+ layers). The studio is a serious drawing desk with layers and real brushes, not a desktop illustration suite.

## 6. Success metrics

For moderated MVP testing with at least 5 buyers and 5 artists:

| Metric | Target |
| --- | --- |
| Buyer reaches an artist profile from Discover | ≥ 80% without assistance |
| Buyer correctly identifies price, turnaround, revisions, and availability | ≥ 80% |
| Buyer submits a valid commission request | ≥ 70% |
| Tester completes the full simulated order | ≥ 70% |
| Artist correctly accepts or counters a request | ≥ 80% |
| Artist can draw and submit a sketch without uploading a file | ≥ 80% |
| Buyer understands current milestone and next action | ≥ 85% |
| Teen protection state is noticed without being perceived as childish | ≥ 70% favorable |
| Median critical task completion time | ≤ 6 minutes for request; ≤ 10 minutes end-to-end demo |

Instrumentation events should include `artwork_viewed`, `artist_profile_viewed`, `service_selected`, `request_started`, `request_submitted`, `artist_response_submitted`, `checkout_completed`, `milestone_action`, `canvas_opened`, `artwork_published`, `sketch_submitted`, `final_delivered`, `delivery_accepted`, `review_submitted`, `waitlist_joined`, and `safety_message_blocked`. Canvas events should record whether the source was `canvas` or `upload`.

## 7. Information architecture

### Primary navigation

1. **Discover** — artwork, artists, search, filters, saved content.
2. **Commissions** — services and active commission opportunities.
3. **Create** — in-app drawing studio, posts, portfolio work, and commission-service creation.
4. **Orders** — buyer requests, active orders, and history.
5. **Studio / Profile** — artist dashboard, availability, services, earnings, and public profile.

### Route map

| Route | Purpose | MVP state |
| --- | --- | --- |
| `/` | Discover feed and search | Existing foundation; expand |
| `/search` | Full search and filters | Build |
| `/artists/[id]` | Artist profile | Existing foundation; expand tabs |
| `/art/[id]` | Artwork detail and related work | Build |
| `/commissions` | Service discovery | Existing foundation; expand |
| `/commissions/[id]` | Service details and pricing | Existing foundation; expand |
| `/commissions/[id]/request` | Structured request wizard | Build |
| `/requests/[id]/respond` | Artist accept/counter/decline | Build |
| `/checkout/[orderId]` | Simulated checkout | Build |
| `/orders` | Buyer request/order dashboard | Existing shell; build |
| `/orders/[id]` | Commission workspace | Build |
| `/create` | Create menu | Existing shell; build |
| `/create/draw` | In-app drawing studio and publish | Build |
| `/create/artwork` | Redirects to drawing studio | Build |
| `/create/service` | Service creation form | Build |
| `/orders/[id]/draw` | Draw a sketch or final for an order | Build |
| `/studio` | Artist dashboard | Existing shell; build |
| `/studio/services` | Service and availability management | Build |
| `/saved` | Saved artwork and artists | Build |
| `/notifications` | Notification center | Build |

## 8. Core experience requirements

### 8.1 Discover and search

The default experience opens directly into artwork, not marketing copy or seller categories.

Required sections:

- Recommended for you
- Artists accepting commissions
- Emerging artists
- New artwork
- Art under $50
- Trending styles
- Discover Someone New

Required filters:

- Style: Anime, Cartoon, Realism, Semi-realism, Pixel art, Watercolor, Manga, Comic, Fantasy, Minimalist, Cute, Gothic.
- Subject: character, portrait, pet, landscape, environment, fan art, original character, emote/avatar.
- Budget: preset bands and custom maximum.
- Turnaround.
- Availability: Open, Limited, Waitlist, Closed.
- Usage: personal or commercial.
- Format: digital or physical; physical remains visibly unsupported in MVP checkout.
- New/emerging artist.

Ranking for the demo should mix style relevance, availability, price fit, freshness, and an emerging-artist boost. Raw follower count must not exist in the model. “Discover Someone New” should intentionally rotate creators with lower exposure.

**Acceptance criteria**

- Search matches artwork title, artist name, style, subject, and tags.
- Filters can combine and can be cleared.
- Empty states explain which constraints produced no matches.
- Saving artwork or an artist updates UI immediately and creates a notification/toast.
- Every artwork card links to a usable detail or artist profile.

### 8.2 Artist profile

Profile header includes avatar, username, display name, bio, main styles, status, rating, completed commissions, available slots, and save/follow actions. Protected teen accounts show “Parent Supported” or “Protected Teen Account,” never exact age.

Tabs:

- Portfolio
- Posts
- Commissions
- Reviews
- About & rules

Commission rules must cover accepted subjects, declined subjects, revision policy, usage rights, communication boundary, expected response time, and cancellation policy.

**Acceptance criteria**

- A buyer can identify the lowest price, current availability, typical turnaround, included revisions, and rules without leaving the profile.
- Closed artists have no active request CTA.
- Waitlist artists show join/leave state and position.
- Every seeded artist has at least 6 portfolio items, 3 posts, 2 services, and reviews.

### 8.3 Commission service and request

A service contains base price, inclusions, exclusions, turnaround, revisions, deliverables, allowed usage, add-ons, examples, status, and remaining slots.

The request is a resumable wizard:

1. Brief and service confirmation.
2. Options: character count, background, intended use, add-ons.
3. Deadline and budget.
4. References: file uploads and an optional in-app reference sketch.
5. Notes, rules acknowledgment, and review.

The price estimate updates from base price plus add-ons. The estimate is not a charge and may be countered by the artist.

**Acceptance criteria**

- Required fields prevent incomplete submission.
- Commercial use affects price when configured.
- References display file name, type, size, progress, and remove action.
- Buyer can draw a reference sketch in-app instead of, or in addition to, uploading a file.
- Draft request persists locally during the demo.
- Protected teen financial actions trigger a simulated parent-approval checkpoint.
- Submission creates an `Awaiting artist` request and notification.

### 8.3.1 What the buyer owns (default license)

Buying or commissioning on Arya is **not** buying the copyright. It is buying **files plus a license** to use those files in the ways the order names. This is the industry default for custom illustration. Counsel must still write production terms; the product must already tell this story in plain language at request, checkout, and delivery.

Three separate things:

| Thing | Who has it after a completed order | What it means |
| --- | --- | --- |
| The **files** | Buyer receives the agreed deliverables (PNG, TIFF, etc.). Artist may keep working files. | They have a copy. Having a file is not the same as owning the art as IP. |
| The **license** (usage) | Buyer, for the uses they paid for, snapshot on the order. | What they may *do* with those files. |
| The **copyright** | Stays with the **artist**, unless the order explicitly sells a rights transfer (not in MVP). | Who may copy, license to others, sell merch, make sequels of *this drawing*. |

**Personal use (default on most services)** includes:

- Keep and display the files privately.
- Set as avatar, wallpaper, or lock screen.
- Print copies for home, gifts, or a personal album.
- Share the finished image with credit (“art by [artist]”) as a person, not as a shop.

Personal use does **not** include: selling prints or merch, using the art in a paid product/game/ad, minting it, sublicensing it, or claiming they created it.

**Commercial use** (when the service offers it, usually as an add-on) is a **wider license**, still not a copyright sale unless the terms say so. It lets the buyer use the art in the commercial context they selected (for example a book, game asset, or shop). The artist still owns the drawing. The buyer does not automatically get exclusive rights, trademark, or the right to register the work as theirs.

**Characters vs this drawing:** If the buyer brought an original character, they already own that character. The artist owns *this picture of it*. The buyer may keep using their character; they may not treat the artist’s specific drawing as work they can relicense to a studio unless commercial/transfer terms say so. If the artist invents a new character in the piece, that character stays the artist’s unless the brief commissioned a character design with stated IP terms.

**Portfolio:** The artist may show the work in their Arya portfolio and process posts unless the order is marked private. The buyer does not get to hide it by default.

**Discover and saves:** Looking at or saving public art is not ownership. No license attaches until there is a completed order (or a separate stated license on a print product, which the MVP does not sell).

**Prints:** Arya does not ship physical goods in the MVP. “Print-ready file” means the buyer may print under their license. It is not a shipped poster and not a merch license.

**Later certificate / provenance:** A certificate would say “this buyer received this unique delivery, human-made on Arya, under these terms.” It does not replace copyright. It does not add print/merch rights the license did not already grant.

Checkout and the order snapshot must show usage in one line a teen can understand, for example: “You get the files for personal use, including printing at home. [Artist] keeps the copyright.” Commercial: “You get the files plus a commercial license for [context]. [Artist] still owns the copyright.”

Protected-teen commercial licenses still require the simulated parent-approval checkpoint.

**Acceptance criteria**

- Request, checkout, and completed-order summary each state files vs license vs copyright in plain language.
- Personal vs commercial matches the accepted offer; commercial cannot be assumed from “I paid.”
- Demo copy never says the buyer “owns the art” or “owns the NFT” as a substitute for a license.

### 8.4 Artist response

The artist sees the full brief, references, estimated price, requested deadline, usage, and buyer account protection state.

Actions:

- **Accept** — confirms scope, price, and deadline.
- **Counter** — changes price, deadline, included revisions, or notes; requires a reason.
- **Decline** — selects a private reason and optional buyer-facing note.

Only one pending response can be active. A buyer can accept or reject a counteroffer. Accepted terms become an immutable order snapshot.

### 8.5 Simulated checkout

Checkout summarizes artist, service, accepted scope, add-ons, price, platform fee display if desired, total, deliverables, usage, and deadline. It uses a clearly labeled demo payment method and does not collect real card data.

Completion records a simulated payment, changes order status to `In progress`, creates the workspace, and updates simulated pending earnings.

### 8.6 Commission workspace

Tabs or responsive panels:

- Messages
- Files
- Timeline
- Details

Canonical statuses:

`Awaiting artist → Counteroffer → Payment required → In progress → Sketch review → Final review → Completed`

Terminal statuses are `Declined` and `Cancelled`.

Milestones:

1. Request accepted
2. Payment confirmed
3. Sketch started
4. Sketch submitted
5. Sketch approved
6. Coloring/rendering
7. Final preview
8. Final delivery
9. Completed

Messages are available only to the buyer and artist attached to that order. System events appear in the same chronological stream but are visually distinct.

**Acceptance criteria**

- The next required action is always visible above the fold.
- Artist can draw a sketch and a final on Arya as the primary delivery path.
- Artist can still upload a sketch or final made in another tool.
- Drawn deliverables appear in Files with a preview the buyer can review.
- Buyer can approve sketch or request revision with required feedback.
- Remaining revisions are visible before submitting feedback.
- Revision count cannot fall below zero without a simulated change order.
- Buyer can accept final delivery, marking the order complete.
- Completed order enables review creation and simulated artist earnings availability.

### 8.7 Waitlists

- Artists select Open, Limited, Waitlist, or Closed and optionally set slot count.
- Buyers can join or leave one waitlist per artist/service combination.
- Position is shown as a friendly approximation in the demo, e.g. “You’re #4.”
- Opening a slot promotes the first eligible entry and creates a time-limited simulated notification.
- Promotion does not create an order; it grants access to submit a request.

### 8.8 Create and Studio

Create types:

- Draw on Arya (primary)
- Finished artwork
- Sketch / WIP
- Process
- Timelapse
- Commission example
- New commission service

Drawing is the default way to add a new piece. Artwork fields include the canvas (or an uploaded image), title, description, style, subject, tools, tags, AI-use disclosure, portfolio visibility, and “Offer commissions like this.” Work drawn in Arya records the tool as **Arya Canvas**. “Offer commissions like this” pre-fills a new service with the artwork as an example.

Studio includes a canvas shortcut, service management, availability, incoming requests, active projects, portfolio/posts, review summary, and simulated pending/available earnings.

Published canvas pieces must appear in the demo Discover feed and the artist’s portfolio without requiring a backend. Seeded catalog art remains the default public library.

### 8.9 Drawing studio

Arya includes an in-browser drawing studio so a teen or adult artist can make work on the platform. This is a first-class product surface, not a decoration on an upload form.

**Where it appears**

1. **Create → Draw on Arya** — draw a piece, add listing details, publish to the demo portfolio.
2. **Commission workspace** — draw the sketch and the final for that order. Delivery stays inside the project.
3. **Request references** — a buyer may sketch a rough visual brief. That drawing is private to the request/order.

**Required tools**

- Pencil, ink, marker, and airbrush, plus eraser, fill, and color sampling. Pressure-aware when the pointer reports pressure.
- Brush size, opacity, hardness, and stroke stabilizer.
- Up to 8 layers with visibility, lock, opacity, and reorder.
- Vertical symmetry for character work.
- Zoom from 50% to 400%, reset, and trackpad/ctrl-wheel zoom.
- Color presets, recent colors, custom color, and paper colors.
- Undo, redo, and clear.
- Commission drawing desk shows the brief and reference images beside the canvas.
- Keyboard shortcuts: `1–4` brushes, `E` eraser, `G` fill, `I` sample, `M` symmetry, `[` `]` size, `+` `-` zoom, `⌘Z` undo.
- Export composites visible layers to a compressed JPEG for the demo store. Empty canvases cannot be published or delivered.

**Interaction and access**

- Pointer drawing must work with mouse, touch, and pen. The canvas uses `touch-action: none` so drawing does not scroll the page.
- Mobile layout at 360px must keep tools reachable and the canvas usable; dedicated draw routes hide the bottom navigation.
- Primary actions stay keyboard-accessible; the canvas has an accessible name.
- Motion on surrounding chrome respects `prefers-reduced-motion`. Drawing strokes themselves are the user’s input, not decorative animation.
- No generative fill, prompt box, or “AI complete this sketch” control.

**Privacy**

- Published Create drawings are public in the demo, like other portfolio work.
- Commission sketches, finals, and buyer reference sketches are participant-only, same as uploaded project files.

**Acceptance criteria**

- An artist persona can open Create, draw a visible mark, title it, and publish. The piece appears in Discover’s “Drawn on Arya” section and on `/art/[id]`.
- From an in-progress order, the artist can draw a sketch, submit it, and the buyer can see the preview without an external file.
- After sketch approval, the artist can draw and submit a final the same way.
- Upload remains available and labeled as the alternative path.
- A buyer can add a drawn reference on the request wizard References step.
- Switching personas does not lose the published drawing or delivered file in the shared demo store.
- The studio does not offer AI image generation.

### 8.10 Reviews

- Only completed-order buyers can submit one review.
- Rating is 1–5 plus optional text.
- Review links to a generic service title but does not expose private project files or messages.
- Demo moderation includes report and hide controls but no production review system.

### 8.11 Notifications

Notification types include request received, accepted, countered, declined, payment required, message received, sketch submitted, revision requested, final delivered, review requested, waitlist movement, slot opened, and parent approval required/completed.

Notifications link directly to the relevant action and support read/unread state.

## 9. Teen safety and privacy behavior

The MVP is for ages 13 and older. Under-13 users are out of scope and must not complete signup. This is a product decision, not a claim of legal compliance.

Protected teen behavior:

- Publicly expose only an age-group state, never birth date or exact age.
- Show a discreet parent-supported indicator.
- Keep commission communication inside the project workspace.
- Do not expose email, phone, school, address, social handles, or off-platform contact fields.
- Detect common contact-sharing patterns in outgoing messages and block the send with: “Message not sent. Sharing personal contact information is restricted for protected teen accounts.”
- Provide report, block, and leave/cancel affordances near communication.
- Simulate parent approval for accepting commercial terms, checkout, and payout-sensitive actions.
- Default safety protections cannot be disabled by a teen account in the MVP.
- Keep uploaded references, buyer reference sketches, commission sketches, and finals private to project participants.

The FTC states that COPPA focuses on children under 13 and can be triggered when an operator has actual knowledge of an under-13 user; the FTC also warns that merely intending to run a teen service does not eliminate risk if the service attracts younger children. Arya therefore needs a clear 13+ gate, minimal age data, privacy disclosures, and counsel review before production. Discord’s current safety-by-default model also supports using age-group states, restricted settings, message-request protections, and safety alerts rather than relying only on user education.

## 10. State model

### Request/order transitions

| Current state | Actor | Action | Next state |
| --- | --- | --- | --- |
| Draft | Buyer | Submit | Awaiting artist |
| Awaiting artist | Artist | Accept | Payment required |
| Awaiting artist | Artist | Counter | Counteroffer |
| Awaiting artist | Artist | Decline | Declined |
| Counteroffer | Buyer | Accept | Payment required |
| Counteroffer | Buyer | Reject | Declined |
| Payment required | Buyer | Complete demo checkout | In progress |
| In progress | Artist | Submit sketch | Sketch review |
| Sketch review | Buyer | Approve | In progress |
| Sketch review | Buyer | Request revision | In progress |
| In progress | Artist | Submit final | Final review |
| Final review | Buyer | Accept | Completed |
| Nonterminal eligible state | Authorized actor | Cancel | Cancelled |

Transitions must be validated in domain logic, not inferred from UI alone. Every transition creates a timeline event.

## 11. Demo data and role switching

Required artists:

- `@LunaLines` — adult, anime/fantasy, $45+, limited, 2 slots.
- `@SketchMaya` — protected teen, cute characters/pets, $20+, waitlist.
- `@PixelNova` — adult, pixel art, $35+, open.
- `@ArtByLeo` — protected teen, comics, $30+, limited, 1 slot.
- `@RoseCanvas` — adult, realism, $120+, closed.

Add a demo account switcher with Buyer, LunaLines, SketchMaya, and Parent Preview. Persist selected persona locally. Seed at least one order in every important state so reviewers can jump directly to each milestone while the main Luna flow remains end-to-end interactive.

## 12. Accessibility and responsive requirements

- WCAG 2.2 AA target for the demo.
- Full keyboard access and visible focus states.
- Semantic headings, labels, landmarks, dialogs, and status announcements.
- Text and essential controls meet contrast requirements independent of artwork.
- Artwork has meaningful alt text; decorative avatars may use empty alt text.
- Motion respects `prefers-reduced-motion`.
- Mobile layouts support 360px width without horizontal page overflow.
- Primary actions remain reachable above mobile bottom navigation.
- Desktop workspace can use split panels; mobile workspace uses tabs or stacked sections.

## 13. Research-informed decisions

- VGen supports both structured custom proposals and instant orders. Arya should use structured custom proposals first because they demonstrate negotiation and scope clarity; instant orders are post-MVP.
- Artistree’s request-card and status-column pattern validates a request-centric artist dashboard. Arya should retain that clarity while presenting a more visual, milestone-oriented workspace.
- Next.js recommends a consistent data-access approach and treats Server Actions as public endpoints requiring authorization and input validation. Arya should use a server-only data access layer and validated server mutations.
- Supabase recommends Row Level Security and least privilege. Private messages, files, requests, and orders require participant-based RLS; public profiles and published artwork receive explicit read policies.
- Safety-by-default patterns for teens support locked protective settings, age-group rather than identity storage, contextual alerts, and stronger message boundaries.

## 14. Open product decisions

These do not block the demo but must be resolved before production planning:

1. Marketplace fee model and who pays it.
2. Refund, cancellation, chargeback, and dispute policy.
3. Production legal text for the default in §8.3.1 (files + license, artist keeps copyright). Exclusive buyouts, work-for-hire, and merch-only add-ons are later SKUs — not implied by personal use.
4. Supported countries, currencies, and payout eligibility.
5. Production parent/guardian relationship and approval mechanism.
6. Age assurance and under-13 handling with counsel.
7. Moderation policy for adult content, fan art, copyrighted characters, and AI-assisted work.
8. Whether physical commissions ever enter scope.
9. Ranking transparency and creator controls.
10. Whether the canvas later adds layers, animation, or file round-trip with Procreate/Photoshop.
11. Maximum canvas resolution and storage strategy once drawings leave local demo persistence.
12. Much later: human-made / commission provenance (certificate language, not NFT marketplace UX). See Drawing Identity PRD §11.1.

## 15. Sources

- [VGen: How the commission system works](https://help.vgen.co/hc/en-us/articles/12820045188119-How-does-the-VGen-commission-system-work)
- [Artistree: How It Works](https://artistree.notion.site/How-It-Works-987a9284e7d44d2e85a8027e85b0029e)
- [FTC: Complying with COPPA FAQs](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [Discord: Safer experiences for teens](https://discord.com/safety/how-discord-is-building-safer-experiences-for-teens)
- [Discord: Approach to content moderation](https://discord.com/safety/our-approach-to-content-moderation)
- [Next.js: Data security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js: Authentication](https://nextjs.org/docs/app/guides/authentication)
- [Supabase: Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase: Securing your data](https://supabase.com/docs/guides/database/secure-data)

> This document describes product behavior for an MVP and is not legal advice or a compliance certification.
