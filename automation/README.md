# Frontend Automation (Playwright)

Folder: **`automation/`** — call it **automation** with the team (not a separate “e2e repo”).

```
automation/
  fixtures/   # auth seed, API mocks, BVA/ECP data, feature seeds
  pages/      # Page Object Model
  specs/      # suites tagged by purpose
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run test:automation` | Full suite |
| `npm run test:automation:sanity` | Critical smoke gate |
| `npm run test:automation:critical` | Critical multi-page journeys |
| `npm run test:automation:regression` | Broad module regression |
| `npm run test:automation:integration` | Cross-feature flows |
| `npm run test:automation:roles` | Admin vs engineer |
| `npm run test:automation:network` | API failure UI |
| `npm run test:automation:bva` | BVA + equivalence classes |
| `npm run test:automation:headed` | Watch Chromium |
| `npm run test:automation:ui` | Playwright UI mode |
| `npm run test:automation:report` | Open **Allure Awesome** report |
| `npm run test:automation:all` | `build:ci` + full suite (stable preview) |

## Coverage checklist

| Area | Status |
|------|--------|
| Critical E2E user flows | `@critical` — login journey, list→detail, CTA round-trips, settings deep links |
| Functional major features | Module specs + regression matrix |
| Regression | `@regression` + per-module specs |
| Integration across pages | `@integration` + critical flows |
| Navigation / routing | `navigation.spec`, protected redirects, deep links |
| Forms & validations | Auth + BVA/ECP form suites |
| Auth login / logout | `auth.spec`, critical flow, session edges |
| Roles / permissions | `@roles` — admin System Usage vs engineer |
| Positive & negative | Across auth, CRUD shells, network |
| Edge cases | Empty states, cancel modals, BVA boundaries |
| API / network → UI | `@network` — abort/500/Retry/Authorization header |
| Page objects / utilities | `automation/pages/*`, `fixtures/*` |
| Test data / config | `test-data.ts`, `seed.ts`, `api.ts` users |
| Screenshots / traces / report | screenshot + video on fail; trace on retry; Allure + HTML + JUnit (CI) |
| CI-friendly | `.github/workflows/playwright.yml` — build:ci, artifacts always |

## Reporting on failure

- Screenshots + video → `test-results/`
- Trace (retry) → open with `npx playwright show-trace …`
- Allure → `npm run test:automation:report`
- CI artifact → `automation-report` (Allure + Playwright HTML + results)

## What to tell the team

Frontend automation lives in **`automation/`** in this repo (POM + mocked API).  
Run locally: `npm run test:automation` then `npm run test:automation:report`.  
CI uploads the Allure report on every run.

## Branch / review gate (do not push to `main`)

1. Work on a **`feature/*`** branch (example: `feature/frontend-automation-suite`).
2. Open a **PR into `main`** — use the PR template checklist and review the diff yourself.
3. Merge only after you approve. Never commit/push straight to `main`.
