# Deploy

Arya Art is a Next.js app on **Vercel Hobby**. Production tracks GitHub `main`.

## URLs

| What | Where |
| --- | --- |
| Production | https://aryaart.vercel.app |
| GitHub | https://github.com/nrymot-netizen/aryaart |
| Vercel project | `aryaart` under the Hobby team that owns the GitHub connection |

An older claimed preview (`temporary-flying-copper-…`) may still exist. Prefer a single Git-connected project. Delete the preview in the Vercel dashboard if it causes confusion.

## How a release happens

1. Commit on `main` (or merge to `main`).
2. Push to `origin`.
3. Vercel builds with `npm run build` (`next build --webpack` in `package.json`; `vercel.json` sets `framework: nextjs` and that build command).
4. Hobby Git deploys require the **commit author** to match the Vercel Hobby owner (GitHub login `nrymot-netizen`).

There is no production `.env` yet. Do not add real payment keys, Supabase, or wallet keys.

## Local production check

```bash
npm test
npm run typecheck
npm run build
```

## Demo data on the live site

State is **per browser** (`localStorage`). Testers do not share orders. Reset demo is local. Drawings stored as JPEG data URLs can hit quota; the provider already surfaces that error — do not silent-fail.

## Do not deploy

- `.env` secrets
- `.vercel/` (gitignored)
- Chain/wallet SDKs
- Generative-AI APIs

## Custom domain

Optional later. Not required for validation. Hobby remains for personal, non-commercial use until the company needs Pro.
