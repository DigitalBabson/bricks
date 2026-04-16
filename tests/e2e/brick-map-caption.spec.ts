import { expect, test, type Locator, type Page, type Route, type TestInfo } from '@playwright/test'

type ViewportSpec = {
  name: string
  width: number
  height: number
}

function buildSvgDataUrl(width: number, height: number, label: string, fill: string): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${fill}"/>`,
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"`,
    ` font-family="Arial, sans-serif" font-size="42" fill="#ffffff">${label}</text>`,
    '</svg>',
  ].join('')

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const thumbnailImageUrl = buildSvgDataUrl(1200, 675, 'Brick Thumbnail', '#1f6f5f')
const fullImageUrl = buildSvgDataUrl(1600, 900, 'Brick Full Image', '#245447')
const mapImageUrl = buildSvgDataUrl(1200, 760, 'North Garden Map', '#355c7d')

const parkLocationsResponse = {
  data: [
    {
      type: 'parkLocation',
      id: 'zone-1',
      attributes: {
        name: 'North Garden',
      },
      relationships: {
        field_brick_zone_image: {
          data: {
            type: 'media--image',
            id: 'media-zone-1',
          },
        },
      },
    },
  ],
  included: [
    {
      type: 'media--image',
      id: 'media-zone-1',
      relationships: {
        field_media_image: {
          data: {
            type: 'file--file',
            id: 'file-zone-1',
          },
        },
      },
    },
    {
      type: 'file--file',
      id: 'file-zone-1',
      attributes: {
        uri: { url: '/sites/default/files/map-zone-1.svg' },
        image_style_uri: {
          brick_large: mapImageUrl,
        },
      },
    },
  ],
}

const bricksResponse = {
  data: [
    {
      type: 'brick',
      id: 'brick-1',
      attributes: {
        field_brick_inscription: 'VISIBLE CAPTION TEST',
      },
      relationships: {
        field_brick_image: {
          data: {
            type: 'file--file',
            id: 'file-brick-1',
          },
        },
        field_brick_zone: {
          data: {
            type: 'parkLocation',
            id: 'zone-1',
          },
        },
      },
    },
  ],
  included: [
    {
      type: 'file--file',
      id: 'file-brick-1',
      attributes: {
        uri: { url: '/sites/default/files/brick-1.svg' },
        image_style_uri: {
          brick_preview: thumbnailImageUrl,
          brick_large: fullImageUrl,
        },
      },
    },
  ],
  meta: {
    count: 1,
  },
}

const singleParkLocationResponse = {
  data: {
    type: 'parkLocation',
    id: 'zone-1',
    attributes: {
      name: 'North Garden',
    },
    relationships: {
      field_brick_zone_image: {
        data: {
          type: 'media--image',
          id: 'media-zone-1',
        },
      },
    },
  },
  included: parkLocationsResponse.included,
}

async function fulfillJson(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

async function installMapCaptionMocks(page: Page) {
  await page.route('**/jsonapi/parkLocations?**', async (route) => {
    await fulfillJson(route, parkLocationsResponse)
  })

  await page.route('**/jsonapi/parkLocations/zone-1?**', async (route) => {
    await fulfillJson(route, singleParkLocationResponse)
  })

  await page.route('**/jsonapi/bricks?**', async (route) => {
    await fulfillJson(route, bricksResponse)
  })
}

async function openMapModal(page: Page) {
  const parkLocationsLoaded = page.waitForResponse(
    (response) => response.url().includes('/jsonapi/parkLocations?') && response.ok()
  )
  const bricksLoaded = page.waitForResponse(
    (response) => response.url().includes('/jsonapi/bricks?') && response.ok()
  )

  await page.goto('/')
  await parkLocationsLoaded
  await bricksLoaded
  await expect(page.locator('.brick-card')).toHaveCount(1)

  await page.getByRole('button', { name: /view location details/i }).click()
  await expect(page.locator('.brick__map-caption')).toBeVisible()
}

async function expectFullyInViewport(locator: Locator, viewport: ViewportSpec) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1)
}

function toFileSafeSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function saveScreenshot(page: Page, testInfo: TestInfo, viewportName: string) {
  const projectName = toFileSafeSegment(testInfo.project.name)
  const fileName = `brick-map-caption-${projectName}-${viewportName}.png`
  await page.screenshot({
    path: testInfo.outputPath(fileName),
    fullPage: false,
  })
}

const desktopViewports: ViewportSpec[] = [
  { name: '1500x800', width: 1500, height: 800 },
  { name: '1728x900', width: 1728, height: 900 },
]

test.describe('Brick map caption visibility', () => {
  for (const viewport of desktopViewports) {
    test(`keeps all map caption elements visible at ${viewport.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await installMapCaptionMocks(page)
      await openMapModal(page)

      const caption = page.locator('.brick__map-caption')
      const mapImage = page.locator('.brick__map-wrapper img')
      const locationLabel = caption.locator('.tw-font-oswald').filter({ hasText: 'Brick Location:' })
      const inscriptionLabel = caption.locator('.tw-font-oswald').filter({ hasText: 'Brick Inscription:' })
      const locationValue = caption.locator('.tw-font-zilla').filter({ hasText: 'North Garden' })
      const inscriptionValue = caption.locator('.tw-font-zilla').filter({ hasText: 'VISIBLE CAPTION TEST' })

      await expect(mapImage).toBeVisible()
      await expect(caption).toBeVisible()
      await expect(locationLabel).toBeVisible()
      await expect(locationValue).toBeVisible()
      await expect(inscriptionLabel).toBeVisible()
      await expect(inscriptionValue).toBeVisible()

      await expectFullyInViewport(caption, viewport)
      await expectFullyInViewport(locationLabel, viewport)
      await expectFullyInViewport(locationValue, viewport)
      await expectFullyInViewport(inscriptionLabel, viewport)
      await expectFullyInViewport(inscriptionValue, viewport)

      await saveScreenshot(page, testInfo, viewport.name)
    })
  }
})
