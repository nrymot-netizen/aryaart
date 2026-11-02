# Arya Art documentation

Read in this order before writing code. Do not assume a blank product; the mock marketplace and drawing studio already exist.

| Order | Doc | Use it for |
| --- | --- | --- |
| 1 | [Root README](../README.md) | Run locally, live URL, stack |
| 2 | [Current state](./CURRENT_STATE.md) | What is shipped vs next |
| 3 | [Product requirements](./PRODUCT_REQUIREMENTS.md) | Marketplace, canvas, safety, license defaults (§8.3.1) |
| 4 | [Drawing identity](./DRAWING_IDENTITY_PRD.md) | Replay, share, proof, later provenance |
| 5 | [Implementation plan](./IMPLEMENTATION_PLAN.md) | Architecture, next phase, tests, Cursor protocol |
| 6 | [Demo and QA](./DEMO_AND_QA.md) | Stakeholder script and acceptance gates |
| 7 | [Safety](./SAFETY.md) | Guardrails vs production procedures; demo playbook |
| 8 | [Deploy](./DEPLOY.md) | GitHub + Vercel |

## Rules that override feature ideas

1. Art leads. Fit over followers. No follower counts.
2. No open DMs. No generative AI in the canvas.
3. Teen safety is a product state. Never exact ages in public UI. Follow [Safety](./SAFETY.md).
4. Demo payments stay labeled simulated.
5. Private motivational model never appears in UI, marketing, or user-visible events. Skip Identity PRD Appendix A unless mapping hungers internally. Never copy it into UI.
6. Buyer gets files plus a license. Artist keeps copyright. See PRD §8.3.1.
7. No wallets, mint buttons, or NFT chrome now.

## Next build

Do not reopen Phases 0–10 unless fixing a regression.

Keep the visitor loop usable: Watch both → Draw back → publish. Do not start real auth, cards, or order sync unless product asks. Provenance certificates and Playwright e2e remain later.
