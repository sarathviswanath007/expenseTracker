# End-to-end tests

Two suites, split by whether they need a session.

## Public — always runs

`tests/e2e/public/` covers the landing page and the auth pages. No account,
no configuration.

```bash
npm run test:e2e
```

## Authenticated — opt in

`tests/e2e/authenticated/` covers the signed-in app: navigation, the expense
round-trip, and the export downloads. It runs only when both variables are
set, so the suite stays green for anyone without them:

```bash
E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e
```

`tests/e2e/auth.setup.ts` signs in once and saves the session to
`playwright/.auth/user.json` (gitignored); the specs reuse it.

### Use a throwaway account

**These tests write data.** The expense spec creates an expense and deletes it
again, and a failure part-way could leave a stray row behind. Point them at a
dedicated test user, never a real one — RLS keeps that user's rows separate
from everyone else's.

Create one from the app's own signup page, confirm the email, and complete
onboarding once so there is a budget to render.

### In CI

Add `E2E_EMAIL` and `E2E_PASSWORD` as repository secrets and pass them through
in `.github/workflows/ci.yml`. Until then the E2E job runs the public suite
only, and reports success on that basis.
