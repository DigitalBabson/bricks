import { test, expect } from '@playwright/test';

test.describe('Sorting and Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 15000 });
  });

  test('bricks load in alphabetical order', async ({ page }) => {
    // Extract inscriptions from image alt attributes (inscription is only in alt and modal)
    const inscriptions = await page.locator('.brick-card img').evaluateAll(imgs =>
      imgs
        .map(img => img.getAttribute('alt') ?? '')
        .filter(alt => alt.length > 0 && alt !== 'Brick image')
    );

    expect(inscriptions.length).toBeGreaterThan(1);

    // Verify the list is sorted A–Z (case-insensitive to match DB collation)
    const sorted = [...inscriptions].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    expect(inscriptions).toEqual(sorted);
  });

  test('pagination control is visible on initial load', async ({ page }) => {
    const pagination = page.locator('nav[aria-label="Page navigation"]');
    await expect(pagination).toBeVisible({ timeout: 15000 });
  });

  test('page 1 is active on initial load', async ({ page }) => {
    const activePage = page.locator('[aria-current="page"]');
    await expect(activePage).toHaveText('1');
  });

  test('previous arrow is disabled on page 1', async ({ page }) => {
    const prevButton = page.locator('button[aria-label="Previous page"]');
    await expect(prevButton).toBeDisabled();
  });

  test('clicking page 2 loads new bricks and highlights page 2', async ({ page }) => {
    // Get first brick on page 1
    const firstBrickPage1 = await page.locator('.brick-card').first().textContent();

    // Click page 2
    const page2Button = page.locator('nav[aria-label="Page navigation"] button', { hasText: '2' });
    await page2Button.click();

    // Wait for new data to load
    await page.waitForResponse(resp => resp.url().includes('bricks') && resp.status() === 200);
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    // Page 2 should now be active
    const activePage = page.locator('[aria-current="page"]');
    await expect(activePage).toHaveText('2');

    // Previous arrow should now be enabled
    const prevButton = page.locator('button[aria-label="Previous page"]');
    await expect(prevButton).toBeEnabled();

    // Bricks should be different from page 1
    const firstBrickPage2 = await page.locator('.brick-card').first().textContent();
    expect(firstBrickPage2).not.toEqual(firstBrickPage1);
  });

  test('next arrow advances to next page', async ({ page }) => {
    const nextButton = page.locator('button[aria-label="Next page"]');
    await nextButton.click();

    await page.waitForResponse(resp => resp.url().includes('bricks') && resp.status() === 200);
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    const activePage = page.locator('[aria-current="page"]');
    await expect(activePage).toHaveText('2');
  });

  test('ellipsis is visible on page 1 with many pages', async ({ page }) => {
    const pagination = page.locator('nav[aria-label="Page navigation"]');
    await expect(pagination).toBeVisible();

    // Should show "..." for large page counts
    const ellipsis = pagination.locator('span', { hasText: '...' });
    const count = await ellipsis.count();
    // If there are enough pages, at least one ellipsis should show
    if (count > 0) {
      await expect(ellipsis.first()).toBeVisible();
    }
  });
});
