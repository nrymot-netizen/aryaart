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

Shared drawings need three Vercel env vars after you create a Supabase project and run `supabase/migrations/20261102_published_art.sql`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Leave them unset to keep the live site local-only. Never put the service role in client code. Do not add real payment keys or wallet keys.

## Local production check

```bash
npm test
npm run typecheck
npm run build
```

## Demo data on the live site

Demo commissions stay **per browser** (`localStorage`). Testers do not share orders. Reset demo is local. Drawings stored as JPEG data URLs can hit quota; the provider already surfaces that error — do not silent-fail.

Visitor drawings published as You can appear on other phones when the Supabase env above is set. Demo personas (Luna, Maya, Alex) stay local.

## Do not deploy

- `.env` secrets
- `.vercel/` (gitignored)
- Chain/wallet SDKs
- Generative-AI APIs

## Custom domain

Optional later. Not required for validation. Hobby remains for personal, non-commercial use until the company needs Pro.
