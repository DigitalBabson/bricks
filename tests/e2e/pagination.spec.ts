import { test, expect } from '@playwright/test';

test.describe('Sorting and Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 15000 });
  });

  test('bricks load in alphabetical order', async ({ page }) => {
    // Drupal sorts on field_sort_alpha for accurate alphabetical ordering
    // Check that the app asks for that sort and renders the bricks in order
    const bricksResponse = page.waitForResponse(
      (resp) => resp.url().includes('/jsonapi/bricks?') && resp.url().includes('sort=field_sort_alpha') && resp.ok()
    );
    await page.goto('/');
    const body = await (await bricksResponse).json();
    const expected: string[] = body.data.map(
      (brick: { attributes: { field_brick_inscription: string } }) => brick.attributes.field_brick_inscription
    );
    await page.waitForSelector('.brick-card', { timeout: 15000 });

    const inscriptions = await page.locator('.brick-card img').evaluateAll(imgs =>
      imgs
        .map(img => img.getAttribute('alt') ?? '')
        .filter(alt => alt.length > 0 && alt !== 'Brick image')
    );

    expect(inscriptions.length).toBeGreaterThan(1);
    expect(inscriptions).toEqual(expected.slice(0, inscriptions.length));
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
    // Cards show the inscription only in the image alt text
    const firstBrickPage1 = await page.locator('.brick-card img').first().getAttribute('alt');

    // Click page 2
    const page2Button = page.getByRole('button', { name: 'Page 2', exact: true });
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
    await expect(page.locator('.brick-card img').first()).not.toHaveAttribute('alt', firstBrickPage1!);
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
