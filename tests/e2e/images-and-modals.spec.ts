import { test, expect, type Locator, type Page } from '@playwright/test';

// Placeholder ("Image Coming Soon") cards don't open a modal, so use a card that
// has a real photo.
function cardWithPhoto(page: Page, index = 0): Locator {
  return page
    .locator('.brick-card')
    .filter({ has: page.locator('[role="button"][aria-label^="Enlarge brick image"]') })
    .nth(index);
}

function imageDialog(page: Page): Locator {
  return page.getByRole('dialog', { name: /^Brick image:/ });
}

function mapDialog(page: Page): Locator {
  return page.getByRole('dialog', { name: /^Location map:/ });
}

function closeButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Close modal', exact: true });
}

function overlayOpacity(page: Page): Promise<number> {
  return page
    .locator('#bricks-modal-root > div')
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));
}

test.describe('Image Display and Modals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.brick-card', { timeout: 10000 });
  });

  test('brick cards display images', async ({ page }) => {
    const image = page.locator('.brick-card').first().locator('img');

    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src');
  });

  test('clicking image opens modal with larger view', async ({ page }) => {
    await cardWithPhoto(page).locator('img').click();

    await expect(imageDialog(page)).toBeVisible();
    await expect(imageDialog(page).getByRole('img')).toBeVisible();
  });

  test('modal has close button', async ({ page }) => {
    await cardWithPhoto(page).locator('img').click();

    await expect(closeButton(page)).toBeVisible();
  });

  test('clicking close button closes modal', async ({ page }) => {
    await cardWithPhoto(page).locator('img').click();
    await expect(imageDialog(page)).toBeVisible();

    await closeButton(page).click();

    await expect(imageDialog(page)).toHaveCount(0);
  });

  test('clicking backdrop closes modal', async ({ page }) => {
    await cardWithPhoto(page).locator('img').click();
    await expect(imageDialog(page)).toBeVisible();

    // The overlay fills the viewport; its top-left corner is outside the dialog.
    await page.locator('#bricks-modal-root > div').first().click({ position: { x: 10, y: 10 } });

    await expect(imageDialog(page)).toHaveCount(0);
  });

  test('view location details button opens zone map modal', async ({ page }) => {
    const mapButton = page
      .locator('.brick-card')
      .first()
      .getByRole('button', { name: /view location details for/i });
    await expect(mapButton).toBeVisible();

    await mapButton.click();

    await expect(mapDialog(page)).toBeVisible();
    await expect(mapDialog(page).getByText('Brick Location:')).toBeVisible();
  });

  test('can open and close multiple modals sequentially', async ({ page }) => {
    const card = cardWithPhoto(page);

    await card.locator('img').click();
    await expect(imageDialog(page)).toBeVisible();
    await closeButton(page).click();
    await expect(imageDialog(page)).toHaveCount(0);

    await card.getByRole('button', { name: /view location details for/i }).click();

    await expect(mapDialog(page)).toBeVisible();
  });

  test('multiple brick cards can open their own modals', async ({ page }) => {
    const first = cardWithPhoto(page, 0);
    const second = cardWithPhoto(page, 1);
    test.skip((await second.count()) === 0, 'fewer than two bricks with photos on the first page');

    await first.locator('img').click();
    await expect(imageDialog(page)).toBeVisible();
    await closeButton(page).click();
    await expect(imageDialog(page)).toHaveCount(0);

    const secondInscription = (await second.locator('[role="button"][aria-label^="Enlarge brick image"]')
      .getAttribute('aria-label'))!.replace(/^Enlarge brick image:\s*/, '');
    await second.locator('img').click();

    await expect(page.getByRole('dialog', { name: `Brick image: ${secondInscription}` })).toBeVisible();
  });

  test('modal fades in and out', async ({ page }) => {
    await cardWithPhoto(page).locator('img').click();

    // Partly transparent while the 0.5s transition runs, then fully opaque.
    await expect.poll(() => overlayOpacity(page), { intervals: [20] }).toBeLessThan(1);
    await expect.poll(() => overlayOpacity(page)).toBe(1);

    await closeButton(page).click();

    // Still in the DOM, fading, before it's removed.
    await expect.poll(() => overlayOpacity(page), { intervals: [20] }).toBeLessThan(1);
    await expect(imageDialog(page)).toHaveCount(0);
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

  test.skip('placeholder image has proper styling', async () => {
    // Test that placeholder with inscription has correct CSS
    // await page.goto('/');
    // const overlay = page.locator('.inscription-overlay').first();
    // await expect(overlay).toHaveCSS('position', 'absolute');
  });
});
