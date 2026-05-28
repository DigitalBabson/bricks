/**
 * Playwright regression tests for ITCMS-7535 comment 508930 fixes.
 *
 * Issues verified:
 *  #5  – Clear All button same height as filter pills (2.74rem)
 *  #6  – Search input has no visible border
 *  #7a – Location-explorer list is scrollable on mobile (overflow-y: auto, not visible)
 *  #8  – Mobile gap between filter and brick grid is 3rem
 *  #9  – Brick-grid container shows no focus outline on page load
 */

import { expect, test, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForBricks(page: Page) {
  await page.waitForSelector('.brick-card', { timeout: 15_000 })
}

// ---------------------------------------------------------------------------
// #6 – Search input: no border
// ---------------------------------------------------------------------------

test.describe('Issue #6 – Search input has no border', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('search-brick input has border-width of 0px', async ({ page }) => {
    const input = page.locator('#search-brick')
    await expect(input).toBeVisible()
    await expect(input).toHaveCSS('border-top-width', '0px')
    await expect(input).toHaveCSS('border-right-width', '0px')
    await expect(input).toHaveCSS('border-bottom-width', '0px')
    await expect(input).toHaveCSS('border-left-width', '0px')
  })
})

// ---------------------------------------------------------------------------
// #5 – Clear All button height matches filter pills
// ---------------------------------------------------------------------------

test.describe('Issue #5 – Clear All button height', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('Clear All button is exactly 27.4px tall (2.74rem at 10px base)', async ({ page }) => {
    const clearAll = page.getByRole('button', { name: 'Clear all' })
    await expect(clearAll).toBeVisible()
    const box = await clearAll.boundingBox()
    expect(box).not.toBeNull()
    // Allow ±1px for sub-pixel rendering
    expect(box!.height).toBeGreaterThanOrEqual(26)
    expect(box!.height).toBeLessThanOrEqual(29)
  })

  test('Clear All button and active filter pills share the same height', async ({ page }) => {
    // Select first location so a pill appears
    const firstOption = page.locator('[role="option"]').first()
    await firstOption.click()

    const clearAll = page.getByRole('button', { name: 'Clear all' })
    const pill = page.locator('.bricks__filter-actions span').first()

    await expect(pill).toBeVisible()

    const clearBox = await clearAll.boundingBox()
    const pillBox = await pill.boundingBox()

    expect(clearBox).not.toBeNull()
    expect(pillBox).not.toBeNull()

    // Heights should be within 2px of each other
    expect(Math.abs(clearBox!.height - pillBox!.height)).toBeLessThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// #7a – Location Explorer: list is scrollable (overflow-y: auto, not visible)
// ---------------------------------------------------------------------------

test.describe('Issue #7a – Location Explorer list overflow', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('location list inside the explorer has overflow-y auto (not visible)', async ({ page }) => {
    // Open the explorer via the floating trigger
    const trigger = page.locator('button.tw-fixed', { hasText: /view.*brick.*location/i })
    await trigger.click()
    await page.locator('[aria-label="Close location explorer"]').waitFor()

    const list = page.locator('nav[aria-label="Park locations"] ul[role="listbox"]')
    await expect(list).toBeVisible()
    // overflow-y must NOT be 'visible' — the explorer needs to scroll on short devices
    const overflowY = await list.evaluate((el) => getComputedStyle(el).overflowY)
    expect(overflowY).not.toBe('visible')
  })
})

// ---------------------------------------------------------------------------
// #8 – Mobile gap between filter hero and brick grid is 3rem (30px)
// ---------------------------------------------------------------------------

test.describe('Issue #8 – Mobile spacing between filter and brick grid', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('brick grid wrapper has padding-top of 30px (3rem) on mobile', async ({ page }) => {
    // The wrapper div sits directly above TheBricks and carries tw-pt-[3rem]
    const grid = page.locator('.bricks')
    const wrapper = grid.locator('xpath=..')

    const pt = await wrapper.evaluate((el) => getComputedStyle(el).paddingTop)
    // 3rem at 10px/rem = 30px
    expect(pt).toBe('30px')
  })
})

// ---------------------------------------------------------------------------
// #9 – Brick grid container: no focus outline on page load / after pagination
// ---------------------------------------------------------------------------

test.describe('Issue #9 – Brick grid container has no focus outline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('brick grid container shows no outline when programmatically focused', async ({ page }) => {
    // Simulate what goToPage does — programmatic focus
    await page.evaluate(() => {
      const grid = document.querySelector<HTMLElement>('.bricks')
      grid?.focus()
    })

    const grid = page.locator('.bricks')
    // After programmatic focus the outline should be suppressed
    await expect(grid).toHaveCSS('outline-style', 'none')
    // ITCMS-7535 #510146: the global `*:focus-visible { box-shadow: 0 0 0 6px #fff }`
    // rule painted a white ring around the grid after pagination. `.bricks:focus`
    // must zero it out — assert box-shadow explicitly, not just outline.
    await expect(grid).toHaveCSS('box-shadow', 'none')
  })

  test('brick grid container has no box-shadow ring after selecting a new page', async ({ page }) => {
    // Repro the reported path: keyboard-driven page change → goToPage → grid.focus()
    const altPage = page.locator('.bricks__pagination button', { hasText: /^\d+$/ })
      .filter({ hasNot: page.locator('.page-active') })
      .first()
    const hasPagination = await altPage.count()
    test.skip(hasPagination === 0, 'single page of results — no alternate page button to click')

    await altPage.focus()
    await altPage.click()
    await waitForBricks(page)

    const grid = page.locator('.bricks')
    await expect(grid).toHaveCSS('box-shadow', 'none')
    await expect(grid).toHaveCSS('outline-style', 'none')
  })

  test('brick grid container is not focused on initial page load', async ({ page }) => {
    const isGridFocused = await page.evaluate(() => {
      const grid = document.querySelector('.bricks')
      return document.activeElement === grid
    })
    expect(isGridFocused).toBe(false)
  })
})
