import { expect, Page } from '@playwright/test';

/**
 * Shared utilities for visual regression tests.
 * 
 * Import this in any test file:
 *   import { takeStableScreenshot } from './utils';
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
        const highestId = window.setInterval(() => { }, 99999);
        for (let i = 0; i <= highestId; i++) {
            window.clearInterval(i);
        }
    });

    // 1. Force scroll to bottom to trigger all lazy-loaded content
    await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.setAttribute('loading', 'eager');
        });

        document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(img => {
            if (!img.src || img.src.includes('data:image')) {
                img.src = img.getAttribute('data-src') || '';
            }
        });

        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 150;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    setTimeout(() => {
                        window.scrollTo(0, 0);
                        resolve();
                    }, 500);
                }
            }, 100);
        });
    });

    // 2. Wait for all <img> tags to finish downloading
    await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('img'));
        const promises = images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
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

    await page.waitForTimeout(500);

    // 4. Find dynamic content to mask
    const locatorsToMask = [];
    locatorsToMask.push(page.locator('video, iframe'));

    if (maskLargeImages) {
        const images = page.locator('img');
        const count = await images.count();
        for (let i = 0; i < count; i++) {
            const imgLocator = images.nth(i);
            const box = await imgLocator.boundingBox();
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
