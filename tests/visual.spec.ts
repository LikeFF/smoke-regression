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
    maxDiffPixelRatio?: number; // Optional custom variance for pages with unavoidable pixel shifting
}

/**
 * Helper function to ensure screenshots are stable. 
 * Resolves lazy loading, freezes animations, and heuristically masks large dynamic images.
 */
export async function takeStableScreenshot(page: Page, name: string, options: StableScreenshotOptions = {}) {
    const {
        maskLargeImages = true,
        minImageWidth = 150,
        minImageHeight = 150,
        maxDiffPixelRatio
    } = options;

    // 0. Kill all JavaScript timers (setInterval) to stop auto-playing carousels and sliders
    await page.evaluate(() => {
        // Create a dummy interval to get the highest current ID,
        // then clear everything from 0 up to that ID.
        const highestId = window.setInterval(() => { }, 99999);
        for (let i = 0; i <= highestId; i++) {
            window.clearInterval(i);
        }
    });

    // 1. Force scroll to bottom to trigger all lazy-loaded content
    await page.evaluate(async () => {
        // Pre-emptively disable browser-level lazy loading for all images
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.setAttribute('loading', 'eager');
        });

        // HP specifically often uses data-src. Force them into the src attribute immediately
        document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(img => {
            if (!img.src || img.src.includes('data:image')) {
                img.src = img.getAttribute('data-src') || '';
            }
        });

        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            // Use smaller steps (150px) to ensure IntersectionObservers have time to trigger
            const distance = 150;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                // Compare against document.body.scrollHeight to check if we hit the bottom
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    // Add a tiny extra delay at the bottom before snapping back
                    setTimeout(() => {
                        window.scrollTo(0, 0);
                        resolve();
                    }, 500);
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
        ...(maxDiffPixelRatio !== undefined && { maxDiffPixelRatio })
    });
}


test.describe('smoke', () => {
    test('SMOKE:HCSv2 + ContentAccordion + BasicTabsSquare + GridContainer', async ({ page }) => {
        await page.goto('https://publish-stage.hp.com/content/hp-com/us-en/industrial-digital-presses.html', {
            waitUntil: 'domcontentloaded',
        });

        await takeStableScreenshot(page, 'industrial-digital-presses.png', {
            maskLargeImages: false,
            minImageWidth: 150,
            minImageHeight: 150
        });
    });

    test('Smoke: LCS+BasicBanner+UseCaseDrawer+PortViewerv2+SecNav+VCS+ProdModule', async ({ page }) => {
        await page.goto('https://publish-stage.hp.com/content/hp-com/au-en/laptops/envy/envy-15-laptop.html', {
            waitUntil: 'domcontentloaded',
        });

        await takeStableScreenshot(page, 'envy-15-laptop.png', {
            maskLargeImages: false,
            minImageWidth: 150,
            minImageHeight: 150,
        });
    });

    test('Collapsible Section', async ({ page }) => {
        await page.goto('https://publish-stage.hp.com/content/hp-com/language-masters/global-master/en/team-test-content/hp-marketing-demo-pages/lookbook-pages1/collapsible-section.html', {
            waitUntil: 'domcontentloaded',
        });

        await takeStableScreenshot(page, 'collapsible-section.png', {
            maskLargeImages: false,
        });
    });

    test('KSP Carousel', async ({ page }) => {
        await page.goto('https://publish-stage.hp.com/content/hp-com/language-masters/global-master/en/team-test-content/hp-marketing-demo-pages/lookbook-pages1/ksp-carousel.html', {
            waitUntil: 'domcontentloaded',
        });

        await takeStableScreenshot(page, 'ksp-carousel.png', {
            maskLargeImages: false,
        });
    });
});

test.describe('visid', () => {
    test('Collapsible Section', async ({ page }) => {
        await page.goto('https://publish-stage.hp.com/content/hp-com/language-masters/global-master/en/team-test-content/yauheni-regression/hp-visid-components/collapsible-section.html', {
            waitUntil: 'domcontentloaded',
        });

        await takeStableScreenshot(page, 'visid-collapsible-section.png', {
            maskLargeImages: false,
        });
    });

    test('BG Container Video Banner', async ({ page }) => {
        await page.goto('https://publish-stage.hp.com/content/hp-com/language-masters/global-master/en/team-test-content/yauheni-regression/hp-visid-components/bg-container-video-banner.html', {
            waitUntil: 'domcontentloaded',
        });

        await takeStableScreenshot(page, 'visid-bg-container-video-banner.png', {
            maskLargeImages: false,
        });
    });
});
