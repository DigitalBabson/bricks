import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

test.describe('Brick Search Functionality', () => {
  async function waitForInitialBricks(page: Page) {
    await expect(page.locator('.brick-card').first()).toBeVisible({ timeout: 10000 })
  }

  async function waitForKeywordRequest(page: Page) {
    await page.waitForResponse((response) =>
      response.url().includes('filter[brickInscription][operator]=CONTAINS') && response.ok(),
    )
  }

  async function waitForBrowseRequest(page: Page) {
    await page.waitForResponse((response) =>
      response.url().includes('/jsonapi/bricks?page[limit]=20') &&
      !response.url().includes('filter[brickInscription][operator]=CONTAINS') &&
      !response.url().includes('filter[brickParkLocation.id]=') &&
      response.ok(),
    )
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('input#search-brick', { timeout: 10000 })
    await waitForInitialBricks(page)
  })

  test('displays the search input without an inline clear button', async ({ page }) => {
    const searchInput = page.locator('input#search-brick')

    await expect(searchInput).toBeVisible()
    await expect(page.getByRole('button', { name: 'Clear search' })).toHaveCount(0)
  })

  test('filters bricks by inscription text', async ({ page }) => {
    const initialCards = await page.locator('.brick-card').count()
    expect(initialCards).toBeGreaterThan(0)

    const searchInput = page.locator('input#search-brick')
    await searchInput.fill('John')
    await waitForKeywordRequest(page)

    const filteredCards = await page.locator('.brick-card').count()
    expect(filteredCards).toBeLessThanOrEqual(initialCards)

    if (filteredCards > 0) {
      await expect(page.locator('.brick-card').first()).toBeVisible()
    }
  })

  test('shows "No bricks match your criteria" when no results found', async ({ page }) => {
    const searchInput = page.locator('input#search-brick')

    await searchInput.fill('ZZZZZZNONEXISTENT123456')
    await waitForKeywordRequest(page)

    const noResultsMessage = page.getByText(/no bricks match your criteria/i)
    await expect(noResultsMessage).toBeVisible()

    const cardCount = await page.locator('.brick-card').count()
    expect(cardCount).toBe(0)
  })

  test('clearing the field manually resets the search filter', async ({ page }) => {
    const initialCards = await page.locator('.brick-card').count()

    const searchInput = page.locator('input#search-brick')
    await searchInput.fill('test search')
    await waitForKeywordRequest(page)

    await searchInput.clear()
    await waitForBrowseRequest(page)

    await expect(searchInput).toHaveValue('')
    const resetCards = await page.locator('.brick-card').count()
    expect(resetCards).toBe(initialCards)
  })

  test('search is case-insensitive', async ({ page }) => {
    const searchInput = page.locator('input#search-brick')

    await searchInput.fill('john')
    await waitForKeywordRequest(page)
    const lowercaseCount = await page.locator('.brick-card').count()

    await searchInput.fill('JOHN')
    await waitForKeywordRequest(page)
    const uppercaseCount = await page.locator('.brick-card').count()

    expect(lowercaseCount).toBe(uppercaseCount)
  })

  test('search updates in real-time as user types', async ({ page }) => {
    const searchInput = page.locator('input#search-brick')
    const initialCount = await page.locator('.brick-card').count()

    await searchInput.pressSequentially('Joh', { delay: 100 })
    await waitForKeywordRequest(page)

    const filteredCount = await page.locator('.brick-card').count()
    const noResultsVisible = await page.getByText(/no bricks match your criteria/i).isVisible().catch(() => false)

    if (noResultsVisible) {
      expect(filteredCount).toBe(0)
    } else {
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    }
  })

  test('empty search shows all bricks', async ({ page }) => {
    const searchInput = page.locator('input#search-brick')
    const initialCount = await page.locator('.brick-card').count()

    await searchInput.fill('test')
    await waitForKeywordRequest(page)

    await searchInput.clear()
    await waitForBrowseRequest(page)

    const finalCount = await page.locator('.brick-card').count()
    expect(finalCount).toBe(initialCount)
  })
})
