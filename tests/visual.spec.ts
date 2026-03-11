import { test, expect, Page } from '@playwright/test';

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

export interface StableScreenshotOptions {
    maskLargeImages?: boolean; // Set to false if you want to test the actual image content
    minImageWidth?: number;
    minImageHeight?: number;
}

/**
 * Helper function to ensure screenshots are stable. 
 * Resolves lazy loading, freezes animations, and heuristically masks large dynamic images.
 */
export async function takeStableScreenshot(page: Page, name: string, options: StableScreenshotOptions = {}) {
    const { maskLargeImages = true, minImageWidth = 150, minImageHeight = 150 } = options;

    // 1. Force scroll to bottom to trigger all lazy-loaded content
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

    // 2. Wait for all <img> tags to finish downloading before calculating sizes (with timeout safety)
    await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('img'));
        const promises = images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                // Resolve on load or error
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });

                // Fallback: don't wait forever for broken/hanging images (max 5s per image)
                setTimeout(resolve, 5000);
            });
        });
        await Promise.all(promises);
    });

    // 3. Freeze all animations and transitions
    await page.addStyleTag({
        content: `
            *, *::before, *::after {
                animation: none !important;
                transition: none !important;
                animation-delay: 0s !important;
                transition-delay: 0s !important;
            }
            video, iframe { display: none !important; }
        `,
    });

    // Extra tick for CSS application
    await page.waitForTimeout(500);

    // 4. Find dynamic content to mask based on calculated sizes
    const locatorsToMask = [];

    // Always mask videos and iframes
    locatorsToMask.push(page.locator('video, iframe'));

    if (maskLargeImages) {
        const images = page.locator('img');
        const count = await images.count();
        for (let i = 0; i < count; i++) {
            const imgLocator = images.nth(i);
            const box = await imgLocator.boundingBox();

            // Mask only images greater than threshold, AND ensure they are currently visible
            // Hidden images (like secondary tabs in an Accordion) shouldn't be masked
            // or they might draw a mask over their parent container's coordinates
            if (box && box.width >= minImageWidth && box.height >= minImageHeight) {
                const isVisible = await imgLocator.isVisible();
                if (isVisible) {
                    locatorsToMask.push(imgLocator);
                }
            }
        }
    }

    // 5. Take the screenshot
    await expect(page).toHaveScreenshot(name, {
        fullPage: true,
        mask: locatorsToMask,
        timeout: 60000,
    });
}

test('homepage visual regression', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // For the homepage, we might want to test its structure and ignore large dynamic banners.
    await takeStableScreenshot(page, 'homepage.png', { maskLargeImages: true });
});

test('SMOKE:HCSv2 + ContentAccordion + BasicTabsSquare + GridContainer', async ({ page }) => {
    await page.goto('https://publish-stage.hp.com/content/hp-com/us-en/industrial-digital-presses.html', {
        waitUntil: 'domcontentloaded',
    });

    // This is a layout test where we don't care about the large image content, only the layout structure.
    await takeStableScreenshot(page, 'industrial-digital-presses.png', {
        maskLargeImages: true,
        minImageWidth: 150,
        minImageHeight: 150
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
