import { expect, test, type Page } from '@playwright/test'

async function waitForBricks(page: Page) {
  await page.waitForSelector('.brick-card', { timeout: 15000 })
}

// AppHero renders two triggers: the hero one (lg+) and a floating one below lg.
// Only one is displayed at a time, and getByRole skips the hidden one.
async function openExplorer(page: Page) {
  await page.getByRole('button', { name: 'View Brick Locations', exact: true }).click()
  await page.locator('[aria-label="Close location explorer"]').waitFor()
}

test.describe('Location Explorer — Desktop', () => {
  // Pin a desktop size so the mobile projects (Pixel 5, iPhone 12) don't run
  // these at phone width, where the list sits full-width below the map.
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('opens the overlay from the hero trigger', async ({ page }) => {
    await openExplorer(page)

    const nav = page.locator('nav[aria-label="Park locations"]')
    await expect(nav).toBeVisible()

    const mapImage = page.locator('img[alt^="Map of"]')
    await expect(mapImage).toBeVisible()
  })

  test('lists multiple locations in the sidebar', async ({ page }) => {
    await openExplorer(page)

    const items = page.locator('nav[aria-label="Park locations"] li')
    await expect(items.first()).toBeVisible()
    const count = await items.count()
    expect(count).toBeGreaterThan(1)
  })

  test('selects the first location by default', async ({ page }) => {
    await openExplorer(page)

    const firstItem = page.locator('nav[aria-label="Park locations"] li').first()
    await expect(firstItem).toHaveAttribute('aria-selected', 'true')
    await expect(firstItem).toHaveClass(/tw-font-medium/)
  })

  test('clicking a location updates the map image', async ({ page }) => {
    await openExplorer(page)

    const items = page.locator('nav[aria-label="Park locations"] li')
    const firstItem = items.first()
    const secondItem = items.nth(1)

    // Get initial map src
    const mapImage = page.locator('img[alt^="Map of"]')
    const initialSrc = await mapImage.getAttribute('src')

    // Click a different location
    await secondItem.click()

    // Verify highlight switched
    await expect(secondItem).toHaveClass(/tw-font-medium/)
    await expect(firstItem).not.toHaveClass(/tw-font-medium/)

    // Verify map image changed
    const newSrc = await mapImage.getAttribute('src')
    expect(newSrc).not.toBe(initialSrc)
  })

  test('renders only one map image at a time', async ({ page }) => {
    await openExplorer(page)

    const images = page.locator('img[alt^="Map of"]')
    await expect(images).toHaveCount(1)

    // Click another location
    const secondItem = page.locator('nav[aria-label="Park locations"] li').nth(1)
    await secondItem.click()

    // Still only one image
    await expect(images).toHaveCount(1)
  })

  test('closes the overlay via the × button', async ({ page }) => {
    await openExplorer(page)

    const closeButton = page.locator('[aria-label="Close location explorer"]')
    await closeButton.click()

    await expect(page.locator('nav[aria-label="Park locations"]')).toHaveCount(0)
  })

  test('closes the overlay via Escape key', async ({ page }) => {
    await openExplorer(page)

    await page.keyboard.press('Escape')

    await expect(page.locator('nav[aria-label="Park locations"]')).toHaveCount(0)
  })

  test('closes the overlay via backdrop click', async ({ page }) => {
    await openExplorer(page)

    // Click in the top-left corner of the backdrop, which is outside the content
    const backdrop = page.locator('.tw-bg-black\\/\\[0\\.87\\]')
    const box = await backdrop.boundingBox()
    if (box) {
      await page.mouse.click(box.x + 5, box.y + 5)
    }

    await expect(page.locator('nav[aria-label="Park locations"]')).toHaveCount(0)
  })

  test('desktop layout overlays the location list on the left of the map', async ({ page }) => {
    await openExplorer(page)

    const nav = page.locator('nav[aria-label="Park locations"]')
    const mapImage = page.locator('img[alt^="Map of"]')

    const navBox = await nav.boundingBox()
    const mapBox = await mapImage.boundingBox()

    expect(navBox).toBeTruthy()
    expect(mapBox).toBeTruthy()
    // The list sits over the map's left side rather than beside it
    expect(navBox!.x).toBeGreaterThanOrEqual(mapBox!.x - 1)
    expect(navBox!.x + navBox!.width).toBeLessThan(mapBox!.x + mapBox!.width / 2)
  })

  test('re-opening resets to the first location', async ({ page }) => {
    await openExplorer(page)

    // Select the second location
    const secondItem = page.locator('nav[aria-label="Park locations"] li').nth(1)
    await secondItem.click()
    await expect(secondItem).toHaveClass(/tw-font-medium/)

    // Close
    await page.keyboard.press('Escape')
    await expect(page.locator('nav[aria-label="Park locations"]')).toHaveCount(0)

    // Re-open
    await openExplorer(page)

    // First location should be selected again
    const firstItem = page.locator('nav[aria-label="Park locations"] li').first()
    await expect(firstItem).toHaveClass(/tw-font-medium/)
  })
})

test.describe('Location Explorer — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('opens the overlay from the floating trigger', async ({ page }) => {
    await openExplorer(page)

    const nav = page.locator('nav[aria-label="Park locations"]')
    await expect(nav).toBeVisible()
  })

  test('mobile layout shows map above the location list', async ({ page }) => {
    await openExplorer(page)

    const mapImage = page.locator('img[alt^="Map of"]')
    const nav = page.locator('nav[aria-label="Park locations"]')

    await expect(mapImage).toBeVisible()
    await expect(nav).toBeVisible()

    const mapBox = await mapImage.boundingBox()
    const navBox = await nav.boundingBox()

    expect(mapBox).toBeTruthy()
    expect(navBox).toBeTruthy()
    // Map should be above the nav
    expect(mapBox!.y).toBeLessThan(navBox!.y)
  })

  test('location list items are centered', async ({ page }) => {
    await openExplorer(page)

    const firstItem = page.locator('nav[aria-label="Park locations"] li').first()
    await expect(firstItem).toHaveCSS('text-align', 'center')
  })

  test('selected location is marked selected and uses medium weight', async ({ page }) => {
    await openExplorer(page)

    const firstItem = page.locator('nav[aria-label="Park locations"] li').first()
    await expect(firstItem).toHaveAttribute('aria-selected', 'true')
    await expect(firstItem).toHaveClass(/tw-font-medium/)
  })

  test('closes the overlay on mobile', async ({ page }) => {
    await openExplorer(page)

    const closeButton = page.locator('[aria-label="Close location explorer"]')
    await closeButton.click()

    await expect(page.locator('nav[aria-label="Park locations"]')).toHaveCount(0)
  })
})
