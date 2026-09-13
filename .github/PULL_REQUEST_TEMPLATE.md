## Summary
<!-- What does this PR change? Why? -->

-

## Review checklist (required before merge to `main`)
- [ ] I reviewed the diff myself
- [ ] **Automation suite green** — CI job `automation-suite` passed (or locally: `npm run test:automation`)
- [ ] Allure / failure artifacts checked if anything failed (**download CI artifact — do not commit report folders**)
- [ ] No secrets (`.env`, tokens) **and no** `allure-*` / `playwright-report` / `test-results` in the diff
- [ ] Not merging via force-push to `main`
- [ ] New UI behavior has matching tests under `automation/specs/` when applicable

## Test plan
- [ ] `npm run test:automation:sanity`
- [ ] `npm run test:automation` (full)
- [ ] Spot-check UI for touched features

## Notes
Do **not** commit or push directly to `main`. Use a `feature/*` branch + PR.
