import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import axios from 'axios'
import BrickCard from '../BrickCard.vue'
import UiModal from '../UiModal.vue'
import type { Brick } from '../../types/index'
import { defaultEnvKey, defaultUrlKey } from '../../types/index'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

function mockParkLocationResponse() {
  return {
    data: {
      data: {
        attributes: { name: 'Zone 1' },
        relationships: {
          field_brick_zone_image: { data: { type: 'media--image', id: 'media-1' } },
        },
      },
      included: [
        {
          type: 'media--image',
          id: 'media-1',
          relationships: {
            field_media_image: { data: { type: 'file--file', id: 'file-1' } },
          },
        },
        {
          type: 'file--file',
          id: 'file-1',
          attributes: {
            uri: { url: '/sites/default/files/map.jpg' },
            image_style_uri: { brick_large: 'https://example.com/map-large.jpg' },
          },
        },
      ],
    },
  } as never
}

function mountBrickCard(brick: Brick) {
  return mount(BrickCard, {
    props: {
      brick,
    },
    global: {
      provide: {
        [defaultEnvKey as symbol]: 'https://example.com',
        [defaultUrlKey as symbol]: 'https://example.com/api/',
      },
      components: {
        UiModal,
      },
      stubs: {
        teleport: true,
      },
    },
  })
}

function getLocationButton(wrapper: VueWrapper): DOMWrapper<Element> {
  const button = wrapper.findAll('button').find((item) => item.text() === 'View location details')

  if (!button) {
    throw new Error('View location details button not found')
  }

  return button
}

function getBrickCardVm(wrapper: VueWrapper) {
  return wrapper.vm as unknown as {
    showImg: boolean
    showMap: boolean
    parkLocation: string
    parkLocationImgURL: string
    thumbnailUrl: string
    brickImgUrl: string
    hasMissingImage: boolean
  }
}

describe('BrickCard', () => {
  const comingSoonBrick: Brick = {
    id: '123',
    inscription: 'John Doe 1985',
    brickImage: 'default',
    brickParkLocation: 'park-1',
  }

  const hydratedBrick: Brick = {
    id: '456',
    inscription: 'Jane Doe 1992',
    brickImage: 'img-1',
    brickParkLocation: 'park-2',
    brickImagePreviewUrl: 'https://example.com/preview.jpg',
    brickImageFullUrl: 'https://example.com/full.jpg',
    parkLocationName: 'Zone 2',
    parkLocationImgURL: 'https://example.com/map-zone-2.jpg',
  }

  const missingImageBrick: Brick = {
    id: '789',
    inscription: 'MICHAEL JAMES PACE CLASS OF 2015',
    brickImage: 'img-missing',
    brickParkLocation: 'park-3',
  }

  const drupalPlaceholderBrick: Brick = {
    id: '790',
    inscription: 'MICHAEL JAMES PACE CLASS OF 2015',
    brickImage: '1b458e85-7575-4e00-9658-eacdb769ddaf',
    brickParkLocation: 'park-3',
    isPlaceholderImage: true,
    brickImagePreviewUrl: 'https://babsondev.prod.acquia-sites.com/sites/default/files/styles/brick_preview/public/images/bricks/coming-soon-gray.jpg',
    brickImageFullUrl: 'https://babsondev.prod.acquia-sites.com/sites/default/files/styles/brick_large/public/images/bricks/coming-soon-gray.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue(mockParkLocationResponse())
  })

  describe('coming soon bricks', () => {
    let wrapper: VueWrapper

    beforeEach(async () => {
      wrapper = mountBrickCard(comingSoonBrick)
      await wrapper.vm.$nextTick()
    })

    it('renders the card as a non-interactive container around real controls', () => {
      const article = wrapper.find('article')

      expect(article.exists()).toBe(true)
      expect(article.attributes('tabindex')).toBeUndefined()
      expect(article.attributes('role')).toBeUndefined()
      expect(article.attributes('aria-label')).toBeUndefined()
    })

    it('renders the coming-soon overlay and disables the enlarge affordance', () => {
      expect(wrapper.text()).toContain('John Doe 1985')
      expect(wrapper.text()).toContain('Image Coming Soon')
      expect(wrapper.find('button[aria-label="Enlarge brick image"]').exists()).toBe(false)
    })

    it('does not open the image modal when the placeholder image is clicked', async () => {
      await wrapper.find('img').trigger('click')

      expect(getBrickCardVm(wrapper).showImg).toBe(false)
    })

    it('opens the map modal from the location button', async () => {
      await getLocationButton(wrapper).trigger('click')
      await flushPromises()

      expect(getBrickCardVm(wrapper).showMap).toBe(true)
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://example.com/api/parkLocations/park-1' +
        '?include=field_brick_zone_image,field_brick_zone_image.field_media_image' +
        '&fields[parkLocation]=name,field_brick_zone_image' +
        '&fields[media--image]=field_media_image' +
        '&fields[file--file]=uri,url,image_style_uri'
      )
      expect(getBrickCardVm(wrapper).parkLocation).toBe('Zone 1')
      expect(getBrickCardVm(wrapper).parkLocationImgURL).toBe('https://example.com/map-large.jpg')
    })

    it('keeps the location button keyboard reachable', async () => {
      const button = getLocationButton(wrapper)

      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('View location details')
      expect(button.attributes('tabindex')).toBeUndefined()

      await button.trigger('click')

      expect(getBrickCardVm(wrapper).showMap).toBe(true)
    })
  })

  describe('hydrated bricks with real images', () => {
    let wrapper: VueWrapper

    beforeEach(async () => {
      wrapper = mountBrickCard(hydratedBrick)
      await wrapper.vm.$nextTick()
    })

    it('keeps the loading placeholder visible until the hydrated image finishes loading', async () => {
      expect(wrapper.find('.brick-card__placeholder').exists()).toBe(true)
      expect(wrapper.find('img').exists()).toBe(true)
      expect(wrapper.find('img').classes()).toContain('brick-card__image--loading')

      await wrapper.find('img').trigger('load')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.brick-card__placeholder').exists()).toBe(false)
      expect(wrapper.find('img').classes()).not.toContain('brick-card__image--loading')
    })

    it('shows the hover affordances and reuses hydrated data without extra requests', async () => {
      expect(mockedAxios.get).not.toHaveBeenCalled()
      expect(wrapper.find('button[aria-label="Enlarge brick image"]').exists()).toBe(true)
      expect(wrapper.html()).toContain('tw-bg-white/40')
      expect(getBrickCardVm(wrapper).thumbnailUrl).toBe('https://example.com/preview.jpg')
      expect(getBrickCardVm(wrapper).brickImgUrl).toBe('https://example.com/full.jpg')
      expect(getBrickCardVm(wrapper).parkLocation).toBe('Zone 2')
      expect(getBrickCardVm(wrapper).parkLocationImgURL).toBe('https://example.com/map-zone-2.jpg')

      await getLocationButton(wrapper).trigger('click')
      await flushPromises()

      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('opens the image modal when the image is clicked', async () => {
      await wrapper.find('img').trigger('click')

      expect(getBrickCardVm(wrapper).showImg).toBe(true)
      expect(getBrickCardVm(wrapper).showMap).toBe(false)
    })

    it('opens the image modal when Enter is pressed on the media area', async () => {
      await wrapper.find('.brick-card__media').trigger('keydown', { key: 'Enter' })

      expect(getBrickCardVm(wrapper).showImg).toBe(true)
      expect(getBrickCardVm(wrapper).showMap).toBe(false)
    })

    it('opens the image modal when the enlarge button is clicked', async () => {
      await wrapper.get('button[aria-label="Enlarge brick image"]').trigger('click')

      expect(getBrickCardVm(wrapper).showImg).toBe(true)
      expect(getBrickCardVm(wrapper).showMap).toBe(false)
    })

    it('opens the map modal from the location button without fetching again', async () => {
      await getLocationButton(wrapper).trigger('click')
      await flushPromises()

      expect(getBrickCardVm(wrapper).showMap).toBe(true)
      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('renders the map caption with visible location and inscription details', async () => {
      await getLocationButton(wrapper).trigger('click')
      await flushPromises()

      const caption = wrapper.get('.brick__map-caption')
      const captionRows = caption.findAll('div')
      const labels = caption.findAll('.tw-font-oswald')
      const values = caption.findAll('.tw-font-zilla')
      const mapImage = wrapper.get('.brick__map-wrapper img')

      expect(getBrickCardVm(wrapper).showMap).toBe(true)
      expect(mapImage.attributes('src')).toBe('https://example.com/map-zone-2.jpg')
      expect(caption.isVisible()).toBe(true)
      expect(captionRows).toHaveLength(2)
      expect(captionRows[0]?.isVisible()).toBe(true)
      expect(captionRows[1]?.isVisible()).toBe(true)
      expect(labels.map((label) => label.text())).toEqual([
        'Brick Location:',
        'Brick Inscription:',
      ])
      expect(values.map((value) => value.text())).toEqual([
        'Zone 2',
        'Jane Doe 1992',
      ])
    })
  })

  describe('bricks with unresolved image assets', () => {
    it('shows the coming-soon overlay and disables enlarge when image hydration fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('missing image'))

      const wrapper = mountBrickCard(missingImageBrick)
      await flushPromises()

      expect(getBrickCardVm(wrapper).hasMissingImage).toBe(true)
      expect(wrapper.text()).toContain('MICHAEL JAMES PACE CLASS OF 2015')
      expect(wrapper.text()).toContain('Image Coming Soon')
      expect(wrapper.html()).toContain('tw-bg-white/70')
      expect(wrapper.find('button[aria-label="Enlarge brick image"]').exists()).toBe(false)

      await wrapper.find('img').trigger('click')

      expect(getBrickCardVm(wrapper).showImg).toBe(false)
    })
  })

  describe('bricks using Drupal default placeholder images', () => {
    it('treats the Drupal default image as coming soon even when style URLs exist', async () => {
      const wrapper = mountBrickCard(drupalPlaceholderBrick)
      await flushPromises()

      expect(wrapper.text()).toContain('MICHAEL JAMES PACE CLASS OF 2015')
      expect(wrapper.text()).toContain('Image Coming Soon')
      expect(wrapper.find('button[aria-label="Enlarge brick image"]').exists()).toBe(false)
      expect(mockedAxios.get).not.toHaveBeenCalled()

      await wrapper.find('img').trigger('click')

      expect(getBrickCardVm(wrapper).showImg).toBe(false)
    })
  })
})
