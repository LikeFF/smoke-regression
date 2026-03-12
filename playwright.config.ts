import { defineConfig, devices } from '@playwright/test';

/**
 * Visual Regression Testing Configuration
 * 
 * Runs each test across 3 resolutions × 2 browsers = 6 projects.
 * Screenshots are organized into folders by resolution and browser.
 */

const resolutions = [
    { name: 'Desktop-1680x1080', width: 1680, height: 1080 },
    { name: 'Tablet-760x1024', width: 760, height: 1024 },
    { name: 'Mobile-375x812', width: 375, height: 812 },
];

const browsers = [
    { name: 'chromium', device: 'Desktop Chrome' },
    // { name: 'firefox', device: 'Desktop Firefox' },
];

export default defineConfig({
    testDir: './tests',
    /* Timeout for each test */
    timeout: 90000,
    /* Run tests in files in parallel */
    fullyParallel: true,
    reporter: [['html', { open: 'never' }]],

    /* Global expect settings */
    expect: {
        toHaveScreenshot: {
            threshold: 0.1, // Pixelmatch threshold (per pixel color tolerance)
            maxDiffPixelRatio: 0.0001, // 0.01% failureThreshold (total tolerable different pixels ratio)
        },
    },

    /* Snapshot folder structure: tests/screenshots/{resolution}/{browser}/{snapshotName} */
    snapshotPathTemplate: '{testDir}/screenshots/{projectName}/{arg}{ext}',

    use: {
        trace: 'on-first-retry',
        /* Add extra HTTP headers for all requests */
        extraHTTPHeaders: {
            'hp-origin': 'true',
            'X-Forwarded-For': '15.65.244.13',
        },
    },

    /* 6 projects = 3 resolutions × 2 browsers */
    projects: resolutions.flatMap((res) =>
        browsers.map((browser) => ({
            name: `${res.name}-${browser.name}`,
            use: {
                ...devices[browser.device],
                viewport: { width: res.width, height: res.height },
            },
        }))
    ),
});
