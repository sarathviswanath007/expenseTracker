# BudgetWise AI

Track smarter. Spend better. Save more.

A personal budgeting app: log expenses, set per-category budgets, and get told
what changed each month — with the numbers behind every claim.

Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres + Auth) ·
Tailwind v4 · Playwright · Vitest

## Running locally

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase values
npm run dev
```

| Variable                        | Required | Where it comes from                                      |
| ------------------------------- | -------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | Supabase → Project Settings → Data API                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | Supabase → Project Settings → API Keys                   |
| `ANTHROPIC_API_KEY`             | no       | console.anthropic.com — enables the AI advice panel only |

Without the Anthropic key everything works; the "Where to optimise next month"
panel reports that it isn't configured. Never prefix that key with
`NEXT_PUBLIC_` — that would ship it to every visitor's browser.

## Database

Schema lives in `supabase/migrations/`, applied in filename order. With the
Supabase CLI linked:

```bash
supabase db push
```

Without it, paste each migration into the SQL Editor in order. Every table has
row-level security enabled and scoped to `auth.uid()`, so the database — not
the app — decides what a request may read.

## Checks

```bash
npm run lint
npm run type-check     # runs `next typegen` first; route types are generated
npm run test:unit
npm run test:e2e       # public pages; see tests/e2e/README.md for the rest
npm run build
```

GitHub Actions runs all of these on every pull request.

## Deploying to Vercel

### 1. Import the repository

At [vercel.com/new](https://vercel.com/new), import the GitHub repo. Vercel
detects Next.js — leave the build and output settings alone.

### 2. Add environment variables

In the import screen (or Project → Settings → Environment Variables), add
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for **all three**
environments: Production, Preview, and Development. Add `ANTHROPIC_API_KEY` too
if you want the advice panel, Production only is fine.

Changing an environment variable does not rebuild anything — redeploy after.

### 3. Point Supabase at the deployed URL

**This is the step people miss, and signup breaks without it.** Confirmation and
password-reset emails are built from the origin the request came from, so
Supabase has to recognise the production domain.

Supabase → Authentication → URL Configuration:

- **Site URL** — `https://your-app.vercel.app`
- **Redirect URLs** — add `https://your-app.vercel.app/auth/callback`, and
  `http://localhost:3000/auth/callback` so local signup keeps working

Preview deployments get a fresh URL per branch, so add a wildcard
(`https://your-project-*.vercel.app/auth/callback`) if you want auth to work on
previews as well.

### 4. Deploy

Pushing to `main` deploys to production; every pull request gets its own preview
URL. GitHub Actions still runs the test suite independently of Vercel's build.

### After deploying

- Sign up with a real address and confirm the email — that exercises the redirect
  configuration end to end, which nothing else does.
- The first account to sign up should be promoted to admin (`role = 'admin'` in
  `public.users`) to reach the Users page.
