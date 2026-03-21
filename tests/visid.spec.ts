import { test } from '@playwright/test';
import { takeStableScreenshot } from './utils';

/**
 * VisId Visual Regression Tests
 * 
 * Screenshots saved to: tests/screenshots/visid/{projectName}/{snapshotName}.png
 */

test('Collapsible Section', async ({ page }) => {
    await page.goto('https://publish-stage.hp.com/content/hp-com/language-masters/global-master/en/team-test-content/yauheni-regression/hp-visid-components/collapsible-section.html', {
        waitUntil: 'domcontentloaded',
    });

    await takeStableScreenshot(page, 'collapsible-section.png', {
        maskLargeImages: false,
    });
});

test('BG Container Video Banner', async ({ page }) => {
    await page.goto('https://publish-stage.hp.com/content/hp-com/language-masters/global-master/en/team-test-content/yauheni-regression/hp-visid-components/bg-container-video-banner.html', {
        waitUntil: 'domcontentloaded',
    });

    await takeStableScreenshot(page, 'bg-container-video-banner.png', {
        maskLargeImages: false,
    });
});
