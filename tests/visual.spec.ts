import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * 
 * Each test in this file will automatically run across all configured
 * resolution + browser combinations defined in playwright.config.ts:
 *   - Desktop-1680x1080 (chromium + firefox)
 *   - Tablet-760x1024  (chromium + firefox)
 *   - Mobile-375x812   (chromium + firefox)
 * 
 * Screenshots are saved to: tests/screenshots/{resolution-browser}/{snapshotName}.png
 * 
 * HOW TO ADD A NEW TEST:
 * 1. Copy one of the test blocks below
 * 2. Change the test name and URL
 * 3. Change the screenshot filename (use a descriptive name)
 * 4. Run: npx playwright test --update-snapshots  (to generate baselines)
 */

test('homepage visual regression', async ({ page }) => {
    // Navigate to the page you want to capture
    await page.goto('https://playwright.dev/');

    // Take a full-page screenshot and compare with baseline
    // The screenshot name will be used as the filename inside each resolution folder
    await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true, // Captures the full scrolling page
    });
});

test('SMOKE:HCSv2 + ContentAccordion + BasicTabsSquare + GridContainer', async ({ page }) => {
    await page.goto('https://publish-stage.hp.com/content/hp-com/us-en/industrial-digital-presses.html', {
        waitUntil: 'domcontentloaded',
    });

    // Wait for page content to render and animations to settle
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot('industrial-digital-presses.png', {
        fullPage: true,
        timeout: 30000, // Allow more time for stable screenshot on dynamic pages
    });
});

/* test('Smoke: LCS+BasicBanner+UseCaseDrawer+PortViewerv2+SecNav+VCS+ProdModule', async ({ page }) => {
    await page.goto('https://publish-stage.hp.com/content/hp-com/au-en/laptops/envy/envy-15-laptop.html', {
        waitUntil: 'domcontentloaded',
    });

    // Scroll to bottom to trigger all lazy-loaded images and content
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    window.scrollTo(0, 0); // Scroll back to top
                    resolve();
                }
            }, 100);
        });
    });

    // Wait for all content to fully render after scrolling
    await page.waitForTimeout(5000);

    // Freeze all animations, transitions, and carousels to stabilize the page
    await page.addStyleTag({
        content: `
            *, *::before, *::after {
                animation: none !important;
                transition: none !important;
                animation-delay: 0s !important;
                transition-delay: 0s !important;
            }
            video { display: none !important; }
        `,
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('envy-15-laptop.png', {
        fullPage: true,
        timeout: 60000,
        maxDiffPixelRatio: 0.02, // This page has persistent subtle animations
    });
}); */
