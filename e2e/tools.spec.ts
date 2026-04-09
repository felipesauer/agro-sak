import { test, expect } from '@playwright/test';

const TOOL_SLUGS = [
    'unit-converter',
    'yield-converter',
    'moisture-discount',
    'drying-loss',
    'tank-mix',
    'spray-mix',
    'seeding-rate',
    'liming',
    'npk-fertilization',
    'nutrient-removal',
    'npk-formula-comparer',
    'plant-spacing',
    'pre-harvest-yield',
    'harvest-loss',
    'sprayer-calibration',
    'operational-capacity',
    'fuel-consumption',
    'production-cost',
    'break-even',
    'sale-pricing',
    'funrural',
    'crop-profit-simulator',
    'rural-financing',
    'farm-lease',
    'cash-flow',
    'farm-roi',
    'machinery-cost',
    'machine-depreciation',
    'grain-freight',
    'storage-viability',
    'storage-cost',
    'tax-reform',
    'itr',
    'crop-profitability',
    'planting-window',
    'farm-diagnostics',
    'software-roi',
    'crop-simulator',
    'field-cost-ranking',
    'irrigation',
    'gps-area',
    'crop-comparer',
    'water-balance',
    'seed-treatment',
    'crop-insurance',
    'soil-analysis',
    'drying-cost',
    'fertilizer-blend',
    'carbon-credit',
    'gypsum',
    'electricity-cost',
    'grain-classification',
    'soil-sampling',
    'payback-period',
    'rain-volume',
    'silo-dimensioning',
    'crop-rotation',
    'harvest-cost',
    'micronutrient-correction',
    'aerial-application',
    'input-inventory',
    'livestock-profitability',
    'water-consumption',
];

test.describe('All 63 tools render without errors', () => {
    for (const slug of TOOL_SLUGS) {
        test(`/tools/${slug} — loads and renders`, async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (err) => errors.push(err.message));

            await page.goto(`/tools/${slug}`, { waitUntil: 'networkidle' });

            // Should have a heading (tool title)
            const heading = page.locator('h1');
            await expect(heading).toBeVisible({ timeout: 5000 });

            // Should have at least one interactive element (input, select, or button)
            const interactive = page.locator('input, select, button');
            await expect(interactive.first()).toBeVisible({ timeout: 5000 });

            // No JS errors
            expect(errors).toEqual([]);
        });
    }
});

test('Home page loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();
});
