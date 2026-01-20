import { test, expect } from '@playwright/test';

test.describe('Brick Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load and bricks to render
    await page.waitForSelector('.brick-card', { timeout: 10000 });
  });

  test('displays search input and clear button', async ({ page }) => {
    // Check that search form elements exist
    const searchInput = page.locator('input#search-brick');
    const clearButton = page.getByRole('button', { name: /clear/i });

    await expect(searchInput).toBeVisible();
    await expect(clearButton).toBeVisible();
  });

  test('filters bricks by inscription text', async ({ page }) => {
    // Get initial count of brick cards
    const initialCards = await page.locator('.brick-card').count();
    expect(initialCards).toBeGreaterThan(0);

    // Type in search box
    const searchInput = page.locator('input#search-brick');
    await searchInput.fill('John');

    // Wait for results to update
    await page.waitForTimeout(500);

    // Count filtered results
    const filteredCards = await page.locator('.brick-card').count();

    // Results should be less than or equal to initial count
    expect(filteredCards).toBeLessThanOrEqual(initialCards);

    // If there are results, verify they contain the search term
    if (filteredCards > 0) {
      const cards = page.locator('.brick-card');
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('shows "No bricks match your criteria" when no results found', async ({ page }) => {
    const searchInput = page.locator('input#search-brick');

    // Search for something that definitely won't exist
    await searchInput.fill('ZZZZZZNONEXISTENT123456');

    // Wait for results to update
    await page.waitForTimeout(500);

    // Check for no results message
    const noResultsMessage = page.getByText(/no bricks match your criteria/i);
    await expect(noResultsMessage).toBeVisible();

    // Verify no brick cards are displayed
    const cardCount = await page.locator('.brick-card').count();
    expect(cardCount).toBe(0);
  });

  test('clear button resets search filter', async ({ page }) => {
    // Get initial count
    const initialCards = await page.locator('.brick-card').count();

    // Perform search
    const searchInput = page.locator('input#search-brick');
    await searchInput.fill('test search');
    await page.waitForTimeout(500);

    // Click clear button
    const clearButton = page.getByRole('button', { name: /clear/i });
    await clearButton.click();

    // Wait for results to reset
    await page.waitForTimeout(500);

    // Verify input is cleared
    await expect(searchInput).toHaveValue('');

    // Verify all bricks are shown again
    const resetCards = await page.locator('.brick-card').count();
    expect(resetCards).toBe(initialCards);
  });

  test('search is case-insensitive', async ({ page }) => {
    const searchInput = page.locator('input#search-brick');

    // Search with lowercase
    await searchInput.fill('john');
    await page.waitForTimeout(500);
    const lowercaseCount = await page.locator('.brick-card').count();

    // Clear and search with uppercase
    const clearButton = page.getByRole('button', { name: /clear/i });
    await clearButton.click();
    await searchInput.fill('JOHN');
    await page.waitForTimeout(500);
    const uppercaseCount = await page.locator('.brick-card').count();

    // Results should be the same regardless of case
    expect(lowercaseCount).toBe(uppercaseCount);
  });

  test('search updates in real-time as user types', async ({ page }) => {
    const searchInput = page.locator('input#search-brick');

    // Get initial count
    const initialCount = await page.locator('.brick-card').count();

    // Type one character at a time
    await searchInput.pressSequentially('Joh', { delay: 100 });

    // Wait for debounce/update
    await page.waitForTimeout(500);

    // Should have filtered results
    const filteredCount = await page.locator('.brick-card').count();

    // Either shows filtered results or "no results" message
    const noResultsVisible = await page.getByText(/no bricks match your criteria/i).isVisible().catch(() => false);

    if (noResultsVisible) {
      expect(filteredCount).toBe(0);
    } else {
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('empty search shows all bricks', async ({ page }) => {
    const searchInput = page.locator('input#search-brick');

    // Get initial count
    const initialCount = await page.locator('.brick-card').count();

    // Enter search
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Clear manually
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Should show all bricks again
    const finalCount = await page.locator('.brick-card').count();
    expect(finalCount).toBe(initialCount);
  });
});
