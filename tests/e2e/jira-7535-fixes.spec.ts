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

// ---------------------------------------------------------------------------
// #510424 – narrow-viewport font sizes (≤400px)
// ---------------------------------------------------------------------------

test.describe('Issue #510424 – narrow-viewport font sizes (≤400px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('pagination nav font-size is 1.6rem (16px at 10px base)', async ({ page }) => {
    const nav = page.locator('nav.bricks__pagination')
    const hasPagination = await nav.count()
    test.skip(hasPagination === 0, 'single page of results — no pagination rendered')
    await expect(nav).toHaveCSS('font-size', '16px')
  })

  test('brick-card location button font-size is 1.4rem (14px at 10px base)', async ({ page }) => {
    const locBtn = page.locator('.brick-card__location-btn').first()
    await expect(locBtn).toHaveCSS('font-size', '14px')
  })
})

// ---------------------------------------------------------------------------
// #510424 – LocationExplorer separator polish on focus
// ---------------------------------------------------------------------------

test.describe('Issue #510424 – LocationExplorer separator polish', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
    // Open the explorer via the floating trigger
    const trigger = page.locator('button.tw-fixed', { hasText: /view.*brick.*location/i })
    await trigger.click()
    await page.locator('[aria-label="Close location explorer"]').waitFor()
  })

  test('non-focused, non-last .location-item separator bottom is .5px', async ({ page }) => {
    const bottom = await page.evaluate(() => {
      const item = document.querySelector('.location-item:not(:last-child)')
      return item ? getComputedStyle(item, '::after').bottom : null
    })
    expect(bottom).toBe('0.5px')
  })

  test('focused .location-item hides its ::after separator', async ({ page }) => {
    // :focus-visible only matches keyboard-initiated focus, so use real Tab presses
    // (programmatic .focus() would not trigger the pseudo-class).
    for (let i = 0; i < 25; i++) {
      const onItem = await page.evaluate(() =>
        document.activeElement?.classList.contains('location-item'),
      )
      if (onItem) break
      await page.keyboard.press('Tab')
    }
    const result = await page.evaluate(() => {
      const focused = document.activeElement
      return focused?.classList.contains('location-item')
        ? { reached: true, display: getComputedStyle(focused, '::after').display }
        : { reached: false, display: null }
    })
    expect(result.reached).toBe(true)
    expect(result.display).toBe('none')
  })
})

// ---------------------------------------------------------------------------
// #510424 – Clear-All returns focus to first brick (Safari focus-loss fix)
// ---------------------------------------------------------------------------

test.describe('Issue #510424 – Clear-All returns focus to first brick', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('pressing Enter on Clear-All moves focus to the .bricks grid (and survives refetch)', async ({ page }) => {
    // Activate a location filter so Clear-All becomes enabled and a refetch will fire on clear.
    const firstOption = page.locator('.bricks__location-listbox [role="option"]').first()
    await firstOption.click()
    await waitForBricks(page)

    const clearAll = page.getByRole('button', { name: 'Clear all' })
    await expect(clearAll).toBeEnabled()
    await clearAll.focus()

    // Wait for the post-clear refetch network response so we know the brick list
    // has remounted (cards inside .bricks have replaced). Using the network signal
    // rather than DOM fingerprints because filtered/unfiltered top-results can
    // coincide and produce identical DOM content.
    const [, _response] = await Promise.all([
      page.keyboard.press('Enter'),
      page.waitForResponse((r) => /\/bricks\?/.test(r.url()) && r.ok(), { timeout: 5000 }),
    ])
    // Give Vue one tick to remount cards after the response resolves.
    await page.waitForTimeout(50)

    // Focus must STILL be on the stable grid container after the cards remounted.
    // If we had focused a specific card it would now be detached → body.
    const focusOnGrid = await page.evaluate(() => {
      const grid = document.querySelector('.bricks')
      return document.activeElement === grid
    })
    expect(focusOnGrid).toBe(true)
  })

  test('mouse click on Clear-All does NOT redirect focus to the .bricks grid', async ({ page }) => {
    const firstOption = page.locator('.bricks__location-listbox [role="option"]').first()
    await firstOption.click()
    await waitForBricks(page)

    const clearAll = page.getByRole('button', { name: 'Clear all' })
    await expect(clearAll).toBeEnabled()
    // Playwright's .click() dispatches a synthetic mouse click (MouseEvent.detail >= 1).
    await clearAll.click()
    await waitForBricks(page)

    const focusOnGrid = await page.evaluate(() => {
      const grid = document.querySelector('.bricks')
      return document.activeElement === grid
    })
    expect(focusOnGrid).toBe(false)
  })
})
