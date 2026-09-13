# TapeoutOps Automation Framework

High-level **UI automation framework** (Playwright + POM) living in this frontend repo.

```
automation/
├── config/       # Env, timeouts, tags, users (single source of truth)
├── core/         # BasePage, BaseComponent, waits
├── data/         # BVA/ECP datasets, seeds, route matrices
├── helpers/      # API mocks, auth seed, network faults
├── pages/        # Page Object Model (feature pages)
├── fixtures/     # Playwright test.extend (page + auth fixtures)
├── reporters/    # Allure metadata
├── specs/        # Test cases (sanity / regression / integration / …)
└── index.ts      # Public framework entry
```

## Architecture

| Layer | Responsibility |
|-------|----------------|
| **config** | Base URL, timeouts, suite tags, persona users |
| **core** | Shared page/component base + wait helpers |
| **data** | Test data, BVA/ECP, seeded entities |
| **helpers** | `mockApi`, `seedAuth`, `failApi`, `abortApi` |
| **pages** | One POM class per screen / flow |
| **fixtures** | Inject pages + `authenticated` / `authenticatedEngineer` |
| **specs** | Thin tests — assert behavior, not selectors |
| **reporters** | Allure env; reports stay **out of git** |

```
specs  →  fixtures  →  pages  →  core
                ↘ helpers / data / config
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run test:automation` | Full suite |
| `npm run test:automation:sanity` | Smoke gate |
| `npm run test:automation:critical` | Critical journeys |
| `npm run test:automation:regression` | Regression |
| `npm run test:automation:integration` | Cross-feature |
| `npm run test:automation:roles` | Admin vs engineer |
| `npm run test:automation:network` | API failure UI |
| `npm run test:automation:bva` | BVA + ECP |
| `npm run test:automation:ddt` | Data-driven same/cross domain visibility |
| `npm run test:automation:headed` | Watch browser |
| `npm run test:automation:report` | Open Allure (local only) |

## Writing a new test

```ts
import { test, expect } from '../fixtures'
import { Tags } from '../config'
import { seedFeatureData } from '../data'

test.describe('My feature @regression', () => {
  test('positive path', { tag: [Tags.regression] }, async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.expectLoaded()
  })
})
```

## Always-on gate

- Tests live **only** under `automation/`
- CI job `automation-suite` runs on **every push and PR**
- UI changes → add/update matching specs + POM helpers

## Reporting (never commit to main / git)

| Where | What |
|-------|------|
| Local | `allure-results/`, `allure-report/`, `test-results/` (**gitignored**) |
| CI | Artifact `automation-report-<run_id>` |
| Open | `npm run test:automation:report` |

**Full suite = full report.** `npm run test:automation` wipes `allure-results` first so you never see fake “178 skipped” from mixing an old full run with a filtered 12-test run. Always open the report **after** a full run.

## Branch / review

1. Work on `feature/*` (not direct `main`)
2. Open PR → self-review checklist
3. Merge only after you approve
