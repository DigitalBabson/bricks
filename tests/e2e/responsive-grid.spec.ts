import { test, expect } from '@playwright/test';

test.describe('Responsive Grid Layout', () => {
  test('mobile viewport shows 2-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 15000 });

    const grid = page.locator('.bricks');
    const gridStyle = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);

    // Should have 2 columns (two values in gridTemplateColumns)
    const columnCount = gridStyle.split(' ').filter(v => v.length > 0).length;
    expect(columnCount).toBe(2);

    // Verify no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('desktop viewport shows 4-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 15000 });

    const grid = page.locator('.bricks');
    const gridStyle = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);

    // Should have 4 columns
    const columnCount = gridStyle.split(' ').filter(v => v.length > 0).length;
    expect(columnCount).toBe(4);
  });
});
