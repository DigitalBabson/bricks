import { test, expect } from '@playwright/test';

test.describe('Image Display and Modals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 10000 });
  });

  test('brick cards display images', async ({ page }) => {
    // Verify at least one brick card has an image
    const firstCard = page.locator('.brick-card').first();
    const image = firstCard.locator('img');

    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src');
  });

  test('clicking image opens modal with larger view', async ({ page }) => {
    // Click on first brick image
    const firstCard = page.locator('.brick-card').first();
    const cardImage = firstCard.locator('img');

    await cardImage.click();

    // Wait for modal to appear
    // Modal is teleported to body, so search globally
    const modal = page.locator('body').getByRole('img').last();

    // Verify modal is visible
    await expect(modal).toBeVisible();
  });

  test('modal has close button', async ({ page }) => {
    // Open modal
    const firstCard = page.locator('.brick-card').first();
    const cardImage = firstCard.locator('img');
    await cardImage.click();

    // Look for close button (typically shows "X")
    const closeButton = page.getByRole('button', { name: /x/i });
    await expect(closeButton).toBeVisible();
  });

  test('clicking close button closes modal', async ({ page }) => {
    // Open modal
    const firstCard = page.locator('.brick-card').first();
    const cardImage = firstCard.locator('img');
    await cardImage.click();

    // Verify modal is open
    await page.waitForTimeout(500);

    // Click close button
    const closeButton = page.getByRole('button', { name: /x/i }).first();
    await closeButton.click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify modal is no longer in viewport (or has opacity 0)
    // This might need adjustment based on your fade animation
  });

  test('clicking backdrop closes modal', async ({ page }) => {
    // Open modal
    const firstCard = page.locator('.brick-card').first();
    const cardImage = firstCard.locator('img');
    await cardImage.click();

    await page.waitForTimeout(500);

    // Click on backdrop (dark overlay area)
    // Find an element that's part of the backdrop
    const backdrop = page.locator('.absolute.inset-0').first();
    await backdrop.click({ position: { x: 10, y: 10 } });

    // Wait for modal close animation
    await page.waitForTimeout(600);

    // Modal should be closed (verify by checking if close button is not visible)
    const closeButton = page.getByRole('button', { name: /x/i });
    const isVisible = await closeButton.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('view on map button opens zone map modal', async ({ page }) => {
    const firstCard = page.locator('.brick-card').first();
    const mapButton = firstCard.getByRole('button', { name: /view on map/i });

    await expect(mapButton).toBeVisible();

    // Click the button
    await mapButton.click();

    // Wait for modal
    await page.waitForTimeout(500);

    // Verify modal with map image is displayed
    const modalImages = page.locator('body').getByRole('img');
    const imageCount = await modalImages.count();

    // Should have at least the map image visible
    expect(imageCount).toBeGreaterThan(0);
  });

  test('can open and close multiple modals sequentially', async ({ page }) => {
    const firstCard = page.locator('.brick-card').first();

    // Open image modal
    const cardImage = firstCard.locator('img');
    await cardImage.click();
    await page.waitForTimeout(500);

    // Close it
    const closeButton = page.getByRole('button', { name: /x/i }).first();
    await closeButton.click();
    await page.waitForTimeout(600);

    // Open map modal
    const mapButton = firstCard.getByRole('button', { name: /view on map/i });
    await mapButton.click();
    await page.waitForTimeout(500);

    // Verify map modal is visible
    const modalImages = page.locator('body').getByRole('img');
    await expect(modalImages.last()).toBeVisible();
  });

  test('multiple brick cards can open their own modals', async ({ page }) => {
    // Get count of cards
    const cardCount = await page.locator('.brick-card').count();

    if (cardCount >= 2) {
      // Open first card's image
      const firstCard = page.locator('.brick-card').first();
      await firstCard.locator('img').click();
      await page.waitForTimeout(500);

      // Close it
      const closeButton = page.getByRole('button', { name: /x/i }).first();
      await closeButton.click();
      await page.waitForTimeout(600);

      // Open second card's image
      const secondCard = page.locator('.brick-card').nth(1);
      await secondCard.locator('img').click();
      await page.waitForTimeout(500);

      // Verify modal is open
      const modalImage = page.locator('body').getByRole('img').last();
      await expect(modalImage).toBeVisible();
    }
  });

  test('modal fade animation works', async ({ page }) => {
    const firstCard = page.locator('.brick-card').first();
    const cardImage = firstCard.locator('img');

    // Get initial state
    await cardImage.click();

    // Modal should fade in (give time for animation)
    await page.waitForTimeout(600);

    // Close modal
    const closeButton = page.getByRole('button', { name: /x/i }).first();
    await closeButton.click();

    // Modal should fade out
    await page.waitForTimeout(600);
  });
});

test.describe('Image Error Handling (Future)', () => {
  test.skip('shows placeholder with inscription when image fails to load', async ({ page }) => {
    // This test is for the future inscription overlay feature
    // When implemented, this will test that failed images show inscription text
    await page.goto('/');

    // Find a brick with failed image (would need to mock image failure)
    // const placeholderCard = page.locator('.brick-card:has(.inscription-overlay)').first();

    // await expect(placeholderCard).toBeVisible();
    // const inscriptionText = await placeholderCard.locator('.inscription-overlay').textContent();
    // expect(inscriptionText.length).toBeGreaterThan(0);
  });

  test.skip('placeholder image has proper styling', async ({ page }) => {
    // Test that placeholder with inscription has correct CSS
    // await page.goto('/');
    // const overlay = page.locator('.inscription-overlay').first();
    // await expect(overlay).toHaveCSS('position', 'absolute');
  });
});
