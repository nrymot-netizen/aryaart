# Demo script and QA gates

Use this before calling a phase done. Desktop and 360px mobile. Demo state: Reset demo if the store is dirty.

## Primary stakeholder loop (must not regress)

Time box: about 10 minutes.

1. Open `/` as **Alex · Buyer**. Confirm art leads the page.
2. Open LunaLines → **Anime Character Portrait** → Request commission.
3. Complete the wizard (brief, personal use, references optional). Submit. Status: Awaiting artist.
4. Switch to **LunaLines · Artist**. Studio or Orders → Accept.
5. Switch to Alex → simulated checkout. Confirm copy says the payment is fake. Complete checkout.
6. Switch to Luna → order → **Draw sketch**. Put a visible mark. Submit. Empty canvas must refuse.
7. Switch to Alex → approve sketch (preview in the action card, not only Files).
8. Luna draws and submits a final. Alex accepts and reviews.

**Pass:** Both personas saw the same order. No open DM surface. No generative-AI control.

## Artist publish loop

1. Luna → Create → **Draw on Arya**.
2. Draw, title, publish.
3. Piece appears in Discover **Drawn on Arya** and `/art/[id]`.
4. Optional: Offer commissions like this → service form prefilled.
5. Draw a mark, leave Create, return: the still is still there. Publish clears the draft.

## Studio demand and checkout

- Studio as Luna shows incoming · waitlist · open slots. Studio as Maya shows waitlist demand (seeded 3).
- Checkout copy: simulated pay, digital files plus a license, no physical shipping.
- Notifications includes a **Demo events** list (this browser only).

## Safety loop

1. **SketchMaya · Artist** — protected indicator, no exact age.
2. In an order workspace, try a message with an email or phone. Send is blocked with the product string from PRD §9.
3. **Parent preview** can complete a pending simulated approval when one exists. Empty Orders as Parent preview can **Load a pending teen request**. Riley · Buyer submits into draft until that approval.
4. First visit shows a 13+ notice that is not verification.
5. Order chrome includes Report, Block, and Leave/cancel. Reviews include Report and Hide.
6. `/settings` shows default protections. Teen accounts cannot turn them off.

Canvas/image side channels are still a known bypass; do not mark production T&S complete.

## Seeded side doors

- `/orders/order-first-flight` as Alex — sketch review.
- Studio as Maya — open a slot, waitlist promotion.
- Search filters survive in the URL.

## License copy (Phase 8)

Request review, checkout, and completed order each include a plain sentence, not only the word `personal` / `commercial`.

Personal example: “You get the files for personal use, including printing at home. The artist keeps the copyright.”

Never: “You own the art.” Never: “You own the NFT.”

## Identity A (shipped)

- Publish from canvas → Play replay + Share on `/art/[id]`.
- `prefers-reduced-motion`: still first, play is a button.
- Upload-only work: share still allowed; no human-made-from-strokes mark; no fake replay.
- Studio as Luna shows **First paid piece**.
- Grep the UI for vice names, “NFT,” “mint,” “hunger,” “sin.” Zero hits in user-facing copy.

## Identity B — challenges (shipped)

- Discover shows **Night lantern** with Try this brief.
- `/challenges/night-lantern` ranks Arya-canvas entries by saves, not followers.
- Luna can enter from Create; uploads cannot enter.
- Buyer can save an entry and request Luna from a tile. Maya tiles stay waitlist.

## Identity C — process stories (shipped)

- `/orders/order-luna-first-paid` as Alex, then Luna: Share process is off until both opt in.
- After both opt in, Discover shows **Sketch to final** and `/process/order-luna-first-paid` has stills (optional final replay). No brief, messages, or references.
- Opting out unpublishes.
- Completing a Maya order does not auto-post. Caption with an email is blocked.

## Identity D — draw-back

- Discover shows **Watch it get drawn. Draw back.** Seeded pair: lantern study + paper lantern.
- `/art/lantern-study` has **Draw back**. Opens `/create/draw?back=lantern-study` with a ghost still. Uploads hidden.
- Publish as Luna or Maya → `/draw-back/[id]` plays both replays. Request CTAs stay on the artists. No comments. No DMs.
- Upload-only work cannot be a source or a reply.

## Commands

```bash
npm test
npm run typecheck
npm run build
```

After UI work: exercise the changed flow in the browser (desktop and 360px). A screenshot is not a pass.

## Accessibility smoke

- Keyboard to request submit, persona switcher, draw route primary actions.
- Canvas has an accessible name. At 360px the paper fits the viewport; tools scroll sideways; Brush / Color / Layers / Publish are tabs.
- Replay (when present) does not autoplay against reduced motion.
- Challenge grid is keyboard-reachable; each tile names title + artist.
- Contrast on chrome independent of artwork.

## Definition of done (every phase)

Matches [Implementation plan §1](./IMPLEMENTATION_PLAN.md): acceptance criteria, layouts, keyboard, `npm run build`, tests, prior loops, deterministic reset.
