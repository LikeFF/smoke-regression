# Smoke Regression — Visual Regression Tests

Automated visual regression testing using [Playwright](https://playwright.dev/). Captures full-page screenshots at multiple resolutions and browsers, then compares against baseline snapshots.

## Resolutions & Browsers

Each test runs across **6 combinations**:

| Resolution | Viewport | Browsers |
|---|---|---|
| Desktop | 1680×1080 | Chromium, Firefox |
| Tablet | 760×1024 | Chromium, Firefox |
| Mobile | 375×812 | Chromium, Firefox |

## Screenshots Folder Structure

```
tests/screenshots/
  ├── Desktop-1680x1080-chromium/
  │   └── homepage.png
  ├── Desktop-1680x1080-firefox/
  │   └── homepage.png
  ├── Tablet-760x1024-chromium/
  │   └── homepage.png
  ├── Tablet-760x1024-firefox/
  │   └── homepage.png
  ├── Mobile-375x812-chromium/
  │   └── homepage.png
  └── Mobile-375x812-firefox/
      └── homepage.png
```

## Configuration

- **Pixel tolerance**: `threshold: 0.1` (per pixel color tolerance)
- **Failure tolerance**: `maxDiffPixelRatio: 0.001` (0.1% of total pixels)
- **Test timeout**: 60 seconds
- **HTTP Headers**: `hp-origin: true`, `X-Forwarded-For: 15.65.244.13`

## Setup

```bash
npm install
npx playwright install chromium firefox
```

## Commands

### Run all visual tests
```bash
npx playwright test
```
Runs all tests across all 6 resolution/browser combinations and compares with baseline screenshots.

### Run tests for a single file
```bash
npx playwright test visual.spec.ts
```

### Run a specific test by title
```bash
npx playwright test -g "homepage"
```

### Run a specific test by line number
```bash
npx playwright test visual.spec.ts:22
```

### Run tests for a specific resolution/browser
```bash
npx playwright test --project="Desktop-1680x1080-chromium"
```

### Update all snapshots (generate baselines)
```bash
npx playwright test --update-snapshots
```
Use this when running for the first time or after a **planned** visual change.

### Update snapshots for a single file
```bash
npx playwright test visual.spec.ts --update-snapshots
```

### Update a specific snapshot by test title
```bash
npx playwright test -g "homepage" --update-snapshots
```

### Update snapshots for a specific resolution only
```bash
npx playwright test --project="Tablet-760x1024-chromium" --update-snapshots
```

### View HTML report
```bash
npx playwright show-report
```
Shows a side-by-side comparison and diff overlay for any failed tests.

## Adding New Tests

1. Open `tests/visual.spec.ts`
2. Add a new test block:
```typescript
test('my page name', async ({ page }) => {
    await page.goto('https://example.com/my-page');
    await expect(page).toHaveScreenshot('my-page.png', {
        fullPage: true,
    });
});
```
3. Generate baselines: `npx playwright test --update-snapshots`
4. Run tests: `npx playwright test`
