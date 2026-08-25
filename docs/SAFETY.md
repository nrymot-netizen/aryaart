# Guardrails and safety procedures

**Status:** Demo playbook. Not a legal policy, COPPA certification, or production trust-and-safety program.  
**Companion:** [PRD §9](./PRODUCT_REQUIREMENTS.md) · [Identity PRD §8](./DRAWING_IDENTITY_PRD.md) · [Demo and QA](./DEMO_AND_QA.md)

Arya is for **ages 13+**, including teen artists. Under-13 is out of scope. The live site is a **mock** (per-browser `localStorage`). That limits cross-user harm today and **does not** make the product safe for real accounts tomorrow.

If a sentence would only be true after lawyers, age assurance, and a moderation team exist, do not put it in the UI.

## 1. What we already have

| Guardrail | Where | Honest limit |
| --- | --- | --- |
| No open DMs | Product principle; messages live on an order | Adults on an all-adult order can still paste contact info |
| Contact-sharing block | `evaluateContactSharing` + workspace send | Regex. Easy to dodge (images, canvas, “gmail dot com”, brief fields). Client flag can be lied to in the reducer |
| Block if the **artist** is a protected teen **or** the **sender** is | `orders/[id]/page.tsx` | Does not look up a teen **buyer** unless they are the sender. No teen-buyer persona in the demo |
| Protected-teen chrome | Notice, no exact age | Label only; not identity verification |
| Simulated parent approval | Request + checkout for Maya | Not legal consent |
| Private files | Order participants only in the UI | Demo store is still on that browser |
| No generative AI | Canvas PRD + studio | Must not be added “for growth” |
| Report / block / leave | Order chrome + review hide/report | Demo stubs. Copy says no moderator is on call |
| Tests | `tests/safety.test.ts`, demo-loop contact block | Does not test canvas/brief side channels |

PRD also asks for **report, block, and leave/cancel near messages**. Those demo stubs exist on the order, plus review report/hide. There is still no moderator.

## 2. Demo operating procedures (use these now)

The public URL does not share one person’s drawings or messages with another person’s browser. Treat it as a **walkthrough**, not a community.

1. **Testers are 13+.** Do not invite under-13 users to “try Arya,” including family, unless counsel says otherwise. Intending a teen product does not stop COPPA if younger children show up and you know it.
2. **Say it is a demo.** Payments, parents, and moderation are simulated. Do not tell press or schools it is a safe launched marketplace.
3. **Seed content.** Anything in `src/data/` and public routes is what strangers see. No sexualized minors, no exact ages, no real phone numbers or addresses in seeds.
4. **Canvas and briefs.** Testers can draw or type anything in their own browser. There is no live moderator. If you run a supervised test, stay in the room.
5. **Reset.** “Reset demo” clears that browser’s store. You cannot reset someone else’s laptop.
6. **If a tester reports harm on the live demo:** believe them, stop the session, capture what they saw (screenshot), and do not promise a takedown of another person’s localStorage. If the content is **in the git catalog**, remove it and redeploy. If it is illegal imagery, do not copy it around; contact counsel / the appropriate authorities. This demo is not a NCMEC reporter setup.
7. **Founder / daughter rule.** Private motivational model (Identity Appendix A) stays internal. Public story is human-made art, structured work, no DMs.

## 3. Product guardrails for every build

Do not ship a feature that breaks these, including “just for virality.”

- No open DMs, group chat, or off-platform contact fields.
- No follower counts.
- No generative fill or prompt-to-image.
- No exact age in public UI.
- Teens cannot turn default protections off.
- Contact filter must run on **any order where a participant is a protected teen**, computed from profiles, not a checkbox the client sends. (Today the UI approximates this; the reducer still trusts the client.)
- Scan **messages** now; treat **briefs, filenames, and canvas stills** as known bypasses until a later pass.
- Share cards never include briefs, messages, or contact.
- Process stories default **off**; protected-teen paid work stays private unless explicit rules in the Identity PRD.
- Never “you own the art” / NFT mint language.
- Desire is style and subject, never bodies, never sexualizing minors.

## 4. Demo safety controls (now in the product)

These are **demo stubs**, labeled as such. They are not a moderation team.

1. **Report** on the order — stores `report_submitted`, toast explains there is no on-call moderator.
2. **Leave / cancel** next to messages when the domain allows cancel (including sketch review).
3. **Block** — hides the other party’s messages for this viewer; toggle to unblock. Not a network ban.
4. **Protected thread** is derived from buyer + artist account types. The client cannot turn the filter off.
5. **Review report / hide** on artist review lists.
6. **Brief, notes, and reference filenames** are scanned on request submit for protected threads.
7. **Obfuscation cases** (`at` / `dot`, profile URLs) are covered in `tests/safety.test.ts`.
8. **13+ notice** on first visit (`arya-age-attestation-v1`). Explicitly not verification. Under-13 sees a stop screen.

Known remaining bypass: contact drawn on the canvas or in a reference image. Production T&S is still [§5](#5-missing-for-production-do-not-claim-we-have-these).

## 5. Missing for production (do not claim we have these)

Do not start real signups until counsel has reviewed this list. PRD already marks production T&S as a non-goal for the MVP.

| Procedure | Why |
| --- | --- |
| Age gate + under-13 refusal that actually blocks signup | COPPA / actual knowledge |
| Parent/guardian relationship that is not a persona switcher | Real money and real teens |
| Privacy policy, ToS, license text | §8.3.1 is product copy, not a contract |
| Moderation queue for public art, challenges, share cards | Replay will travel |
| CSAM / illegal content: detection, preservation, reporting | Required of real hosts; not simulated |
| Harassment, sexual content, copyright, fan-art policy | Open decision in the PRD |
| 24h report intake and an on-call path | A button with no operator is theater |
| Rate limits, ban, appeal | Abuse follows any public canvas |
| Server-side authorization and private storage | localStorage is not privacy |
| Crisis / school / press response | “We are a demo” vs a launched teen product |

A later provenance certificate does not replace any row above. Wallets for 13–17 stay forbidden.

## 6. Incident labels (demo)

Use these internally. Do not invent a public “Safety Center” until there is a team behind it.

| Label | Meaning | Demo action |
| --- | --- | --- |
| `contact_blocked` | Matcher refused a send | Already recorded as `safety_message_blocked` |
| `report_demo` | Tester used Report | Show confirmation; store event |
| `seed_takedown` | Harm is in git | Patch seed, deploy |
| `legal_external` | Possible crime | Counsel / authorities; do not file-share the material in Slack |

## 7. Review gate

Before merging: would this make it easier for a stranger to reach a teen off-platform, see private files, or generate images? If yes, reject. Would we need Appendix A to explain the screen? If yes, rewrite the copy.
