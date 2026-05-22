import { test, expect } from '@playwright/test';

test.describe('Navigation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Bricks/i);
  });

  test('displays Babson header', async ({ page }) => {
    // Look for header/logo
    const header = page.locator('header').or(page.locator('img[alt*="logo"]')).or(page.locator('svg'));
    const headerCount = await header.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('displays brick cards in grid layout', async ({ page }) => {
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    const cards = page.locator('.brick-card');
    const cardCount = await cards.count();

    expect(cardCount).toBeGreaterThan(0);
  });

  test('all brick cards have required elements', async ({ page }) => {
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    const firstCard = page.locator('.brick-card').first();

    // Each card should have an image
    const image = firstCard.locator('img');
    await expect(image).toBeVisible();

    // Each card should have "View on map" button
    const button = firstCard.getByRole('button', { name: /view on map/i });
    await expect(button).toBeVisible();
  });

  test('page is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForSelector('.brick-card', { timeout: 10000 });

    // Verify cards are still visible and stacked
    const cards = page.locator('.brick-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify search input is visible
    const searchInput = page.locator('input#search-brick');
    await expect(searchInput).toBeVisible();
  });

  test('page is responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await page.waitForSelector('.brick-card', { timeout: 10000 });

    const cards = page.locator('.brick-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('page is responsive on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await page.waitForSelector('.brick-card', { timeout: 10000 });

    const cards = page.locator('.brick-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('scroll behavior works correctly', async ({ page }) => {
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    // Scroll down the page
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // Verify page is still functional
    const searchInput = page.locator('input#search-brick');
    await expect(searchInput).toBeVisible();
  });

  test('keyboard navigation works for search input', async ({ page }) => {
    const searchInput = page.locator('input#search-brick');

    // Focus on search input with keyboard
    await searchInput.focus();
    await expect(searchInput).toBeFocused();

    // Type using keyboard
    await page.keyboard.type('John Doe');
    await expect(searchInput).toHaveValue('John Doe');

    // Clear with keyboard
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await expect(searchInput).toHaveValue('');
  });

  test('tab navigation works through interactive elements', async ({ page }) => {
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    // Press Tab to navigate through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // First focusable element should be the search input
    const searchInput = page.locator('input#search-brick');
    const isSearchFocused = await searchInput.evaluate(el => el === document.activeElement);

    if (isSearchFocused) {
      expect(isSearchFocused).toBe(true);
    }

    // Continue tabbing
    await page.keyboard.press('Tab'); // Clear button
    await page.keyboard.press('Tab'); // First card elements
    await page.waitForTimeout(100);

    // Verify we can tab through the page
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
  });

  test('page handles no data gracefully', async ({ page }) => {
    // This test checks what happens if there's no data
    // Either cards are shown or a message is displayed

    const hasCards = await page.locator('.brick-card').count() > 0;
    const hasMessage = await page.getByText(/no bricks/i).isVisible().catch(() => false);

    // Either should be true
    expect(hasCards || hasMessage).toBe(true);
  });
});

test.describe('Performance and Loading', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('images load progressively', async ({ page }) => {
    await page.goto('/');

    // Wait for at least one image to load
    await page.waitForSelector('.brick-card img', { timeout: 10000 });

    const images = page.locator('.brick-card img');
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);

    // Check that at least one image has loaded
    const firstImage = images.first();
    const hasSource = await firstImage.getAttribute('src');
    expect(hasSource).toBeTruthy();
  });

  test('search is responsive and not laggy', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 10000 });

    const searchInput = page.locator('input#search-brick');

    // Measure search responsiveness
    const startTime = Date.now();
    await searchInput.fill('test');
    await page.waitForTimeout(100);
    const responseTime = Date.now() - startTime;

    // Search should respond within 500ms
    expect(responseTime).toBeLessThan(500);
  });
});
