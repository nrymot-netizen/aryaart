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

## Safety loop

1. **SketchMaya · Artist** — protected indicator, no exact age.
2. In an order workspace, try a message with an email or phone. Send is blocked with the product string from PRD §9.
3. **Parent preview** can complete a pending simulated approval when one exists.
4. First visit shows a 13+ notice that is not verification.
5. Order chrome includes Report, Block, and Leave/cancel. Reviews include Report and Hide.

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

## Commands

```bash
npm test
npm run typecheck
npm run build
```

After UI work: exercise the changed flow in the browser (desktop and 360px). A screenshot is not a pass.

## Accessibility smoke

- Keyboard to request submit, persona switcher, draw route primary actions.
- Canvas has an accessible name.
- Replay (when present) does not autoplay against reduced motion.
- Contrast on chrome independent of artwork.

## Definition of done (every phase)

Matches [Implementation plan §1](./IMPLEMENTATION_PLAN.md): acceptance criteria, layouts, keyboard, `npm run build`, tests, prior loops, deterministic reset.
