# Project: Smoke Regression (Playwright Visual Testing)

## Context & Memory
This file serves as a persistent context for Antigravity (or any AI agent) to maintain continuity across sessions and accounts.

## Tech Stack
- **Framework:** Playwright (TypeScript)
- **CI/CD:** GitHub Actions
- **Reporting:** HTML Playwright Report hosted on GitHub Pages (gh-pages branch)
- **Automation:** peaceiris/actions-gh-pages for deployment, custom script for 15-run retention policy.

## Project Structure
- `tests/visual.spec.ts`: Core visual regression tests.
- `playwright.config.ts`: Configuration for cross-browser/cross-resolution testing.
- `.github/workflows/playwright-visual-tests.yml`: The CI/CD pipeline definition.
- `tests/screenshots/`: Baseline images (Snapshots).

## Key Commands
- `npm ci`: Install dependencies correctly.
- `npx playwright test`: Run all visual tests locally.
- `npx playwright test --update-snapshots`: Update baseline images locally.
- `npx playwright show-report`: View HTML report locally.

## CI/CD Pipeline Logic
- **Trigger:** Manual (`workflow_dispatch`).
- **Inputs:** 
  - `update_snapshots` (boolean): If true, runs with `--update-snapshots` and commits changes back to `main`.
  - `test_file` (string): Filter by specific file.
  - `test_name` (string): Filter by test name (grep).
- **Retention:** Only the last 15 reports are kept on the `gh-pages` branch.

## Current Progress & Next Steps
- [x] Initial Playwright setup.
- [x] Visual regression test for Homepage and Industrial Digital Presses.
- [x] GitHub repository created and code pushed.
- [x] GitHub Actions workflow created and pushed.
- [x] Playwright config optimized for CI (headless, no-open report).
- [ ] **NEXT STEP:** Perform the first run in GitHub Actions with `update_snapshots: true` to establish Linux-based baselines.
- [ ] **NEXT STEP:** Navigate to Repository Settings -> Pages and ensure it's pointing to the `gh-pages` branch (once created by the first run).

## Important Notes
- Baselines generated on Mac may fail on CI (Linux). Use the CI pipeline to update them.
- GitHub Pages index.html automatically redirects to the latest available report.
