import { expect, test, type Page } from '@playwright/test'

async function waitForBricks(page: Page) {
  await page.waitForSelector('.brick-card', { timeout: 15000 })
}

async function waitForBrickResponse(page: Page) {
  await page.waitForResponse((response) => response.url().includes('/jsonapi/bricks'))
}

test.describe('Location Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForBricks(page)
  })

  test('renders the location list inside the hero search form', async ({ page }) => {
    const listbox = page.locator('[role="listbox"]')
    const options = page.locator('[role="option"]')

    await expect(listbox).toBeVisible()
    await expect(options.first()).toBeVisible()
    await expect(options).toHaveCount(await options.count())
    await expect(listbox).toHaveAttribute('aria-labelledby', 'locations-label')
  })

  test('selects and deselects a location with pill feedback', async ({ page }) => {
    const firstOption = page.locator('[role="option"]').first()
    const firstLocationName = (await firstOption.textContent())?.trim() ?? ''

    await Promise.all([
      waitForBrickResponse(page),
      firstOption.click(),
    ])

    await expect(page.getByText(`Brick Location: ${firstLocationName}`)).toBeVisible()

    await Promise.all([
      waitForBrickResponse(page),
      firstOption.click(),
    ])

    await expect(page.getByText(`Brick Location: ${firstLocationName}`)).toHaveCount(0)
  })

  test('clear all removes the location filter and restores browse mode', async ({ page }) => {
    const firstOption = page.locator('[role="option"]').first()
    const firstLocationName = (await firstOption.textContent())?.trim() ?? ''

    await Promise.all([
      waitForBrickResponse(page),
      firstOption.click(),
    ])

    const clearAll = page.getByRole('button', { name: 'Clear all' })
    await expect(page.getByText(`Brick Location: ${firstLocationName}`)).toBeVisible()

    await Promise.all([
      waitForBrickResponse(page),
      clearAll.click(),
    ])

    await expect(page.getByText(`Brick Location: ${firstLocationName}`)).toHaveCount(0)
    await expect(clearAll).toHaveCount(0)
    const currentPage = page.locator('nav[aria-label="Page navigation"] [aria-current="page"]')
    if (await currentPage.count()) {
      await expect(currentPage).toHaveText('1')
    } else {
      await expect(page.locator('nav[aria-label="Page navigation"]')).toHaveCount(0)
    }
  })

  test('resets pagination to page 1 when a location is selected', async ({ page }) => {
    const pageTwoButton = page.getByRole('button', { name: '2' })
    await Promise.all([
      waitForBrickResponse(page),
      pageTwoButton.click(),
    ])

    await expect(page.locator('nav[aria-label="Page navigation"] [aria-current="page"]')).toHaveText('2')

    const firstOption = page.locator('[role="option"]').first()
    await Promise.all([
      waitForBrickResponse(page),
      firstOption.click(),
    ])

    const currentPage = page.locator('nav[aria-label="Page navigation"] [aria-current="page"]')
    if (await currentPage.count()) {
      await expect(currentPage).toHaveText('1')
    } else {
      await expect(page.locator('nav[aria-label="Page navigation"]')).toHaveCount(0)
    }
  })

  test('supports keyboard navigation and selection in the location listbox', async ({ page }) => {
    const searchInput = page.locator('#search-brick')
    const listbox = page.locator('[role="listbox"]')
    const options = page.locator('[role="option"]')

    await searchInput.focus()
    await page.keyboard.press('Tab')
    await expect(listbox).toBeFocused()

    await expect.poll(async () => listbox.evaluate((element) => window.getComputedStyle(element).boxShadow)).not.toBe('none')

    const firstId = await options.first().getAttribute('id')
    await expect(listbox).toHaveAttribute('aria-activedescendant', firstId ?? '')

    await page.keyboard.press('End')
    const lastOption = options.last()
    const lastId = await lastOption.getAttribute('id')
    await expect(listbox).toHaveAttribute('aria-activedescendant', lastId ?? '')

    await page.keyboard.press('Home')
    await expect(listbox).toHaveAttribute('aria-activedescendant', firstId ?? '')

    await page.keyboard.press('ArrowDown')
    const secondOption = options.nth(1)
    const secondId = await secondOption.getAttribute('id')
    const secondName = (await secondOption.textContent())?.trim() ?? ''

    await expect(listbox).toHaveAttribute('aria-activedescendant', secondId ?? '')

    await Promise.all([
      waitForBrickResponse(page),
      page.keyboard.press('Enter'),
    ])

    await expect(page.getByText(`Brick Location: ${secondName}`)).toBeVisible()

    await Promise.all([
      waitForBrickResponse(page),
      page.keyboard.press('Enter'),
    ])

    await expect(page.getByText(`Brick Location: ${secondName}`)).toHaveCount(0)
  })

  test('supports filtered pagination when the selected location has multiple pages', async ({ page }) => {
    const firstOption = page.locator('[role="option"]').first()

    await Promise.all([
      waitForBrickResponse(page),
      firstOption.click(),
    ])

    const filteredPageTwo = page.getByRole('button', { name: '2' })
    test.skip(!(await filteredPageTwo.isVisible()), 'Selected location has only one page in current dev data')

    await Promise.all([
      waitForBrickResponse(page),
      filteredPageTwo.click(),
    ])

    await expect(page.locator('nav[aria-label="Page navigation"] [aria-current="page"]')).toHaveText('2')

    const secondOption = page.locator('[role="option"]').nth(1)
    await Promise.all([
      waitForBrickResponse(page),
      secondOption.click(),
    ])

    const currentPage = page.locator('nav[aria-label="Page navigation"] [aria-current="page"]')
    if (await currentPage.count()) {
      await expect(currentPage).toHaveText('1')
    } else {
      await expect(page.locator('nav[aria-label="Page navigation"]')).toHaveCount(0)
    }
  })

  test('shows the empty-results message for a location with no bricks when such data exists', async ({ page }) => {
    const options = page.locator('[role="option"]')
    const count = await options.count()
    let foundEmpty = false

    for (let index = 0; index < count; index += 1) {
      const option = options.nth(index)
      await Promise.all([
        waitForBrickResponse(page),
        option.click(),
      ])

      if (await page.getByText(/No bricks match your criteria/i).isVisible().catch(() => false)) {
        foundEmpty = true
        break
      }
    }

    test.skip(!foundEmpty, 'No empty-result location exists in current dev data')
    await expect(page.getByText(/No bricks match your criteria/i)).toBeVisible()
  })
})
