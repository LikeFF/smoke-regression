import { test } from '@playwright/test';
import { takeStableScreenshot } from './utils';

/**
 * Smoke Visual Regression Tests
 * 
 * Screenshots saved to: tests/screenshots/visual/{projectName}/{snapshotName}.png
 */

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
        // maxDiffPixelRatio: 0.02
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
