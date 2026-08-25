# Arya Art

Arya Art is a web-first art discovery and commission marketplace demo. Buyers find independent artists by the work they make, artists can draw on the platform, and both complete a structured custom-art loop inside a safer workspace.

The demo now covers the full buyer/artist car: discovery, in-app drawing, evaluation, request, artist response, simulated checkout, milestone workspace, review, studio supply, waitlists, and notifications. There is no Supabase backend yet — state lives in a versioned local demo store so both personas see the same transitions.

## Demo loop

1. Browse Discover as **Alex · Buyer**.
2. Open LunaLines → **Anime Character Portrait** → Request commission.
3. Switch to **LunaLines · Artist** → Studio or Orders → Accept.
4. Switch back to Alex → simulated checkout.
5. Luna **draws a sketch** on Arya (`Draw sketch` in the workspace); Alex approves; Luna draws a final; Alex accepts and reviews.

Artists can also open **Create → Draw on Arya** to paint a piece and publish it to Discover. File upload remains as a fallback for work made in another app.

Other seeded paths: Leo sketch-review (`/orders/order-first-flight`), Rose completed history, Maya waitlist promotion from Studio.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Local mock data + command-based demo store

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run typecheck
npm run build
```

## Product status

This is a product-validation demo, not a production marketplace. Payments, payouts, identity checks, and parental approval are simulated. Commission messages stay inside an order. Protected teen accounts cannot send personal contact information.

## Product documentation

- [Product requirements](./docs/PRODUCT_REQUIREMENTS.md)
- [Technical architecture and implementation plan](./docs/IMPLEMENTATION_PLAN.md)
