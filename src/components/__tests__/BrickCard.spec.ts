import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
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

describe('BrickCard', () => {
  let wrapper: VueWrapper
  const mockBrick: Brick = {
    id: '123',
    inscription: 'John Doe 1985',
    brickImage: 'default',
    brickParkLocation: 'park-1',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue(mockParkLocationResponse())

    wrapper = mount(BrickCard, {
      props: {
        brick: mockBrick
      },
      global: {
        provide: {
          [defaultEnvKey as symbol]: 'https://example.com',
          [defaultUrlKey as symbol]: 'https://example.com/api/'
        },
        components: {
          UiModal
        },
        stubs: {
          teleport: true
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders brick card article', () => {
      expect(wrapper.find('article').exists()).toBe(true)
    })

    it('renders "View location details" button', () => {
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('View location details')
    })
  })

  describe('Image Modal', () => {
    it('opens image modal via method', async () => {
      const vm = wrapper.vm as any
      expect(vm.showImg).toBe(false)

      vm.openImg()
      await vm.$nextTick()

      expect(vm.showImg).toBe(true)
    })

    it('closes image modal via method', async () => {
      const vm = wrapper.vm as any
      vm.showImg = true
      await vm.$nextTick()

      vm.closeImg()

      expect(vm.showImg).toBe(false)
    })
  })

  describe('Map Modal', () => {
    it('opens map modal when button is clicked', async () => {
      const vm = wrapper.vm as any
      expect(vm.showMap).toBe(false)

      await wrapper.find('button').trigger('click')

      expect(vm.showMap).toBe(true)
    })

    it('closes map modal via method', async () => {
      const vm = wrapper.vm as any
      vm.showMap = true
      await vm.$nextTick()

      vm.closeMap()

      expect(vm.showMap).toBe(false)
    })
  })

  describe('Props', () => {
    it('accepts brick prop', () => {
      expect((wrapper as any).props('brick')).toEqual(mockBrick)
    })
  })

  describe('Component State', () => {
    it('initializes with modals closed', () => {
      const vm = wrapper.vm as any
      expect(vm.showMap).toBe(false)
      expect(vm.showImg).toBe(false)
    })

    it('initializes with loading state', () => {
      const vm = wrapper.vm as any
      expect(vm.isImgLoading).toBeDefined()
    })

    it('loads the park location map only when the modal is opened', async () => {
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://example.com/api/parkLocations/park-1' +
        '?include=field_brick_zone_image,field_brick_zone_image.field_media_image' +
        '&fields[parkLocation]=name,field_brick_zone_image' +
        '&fields[media--image]=field_media_image' +
        '&fields[file--file]=uri,url,image_style_uri'
      )
      expect((wrapper.vm as any).parkLocation).toBe('Zone 1')
      expect((wrapper.vm as any).parkLocationImgURL).toBe('https://example.com/map-large.jpg')
    })

    it('uses hydrated image and location data without extra requests', async () => {
      const styledBrick: Brick = {
        ...mockBrick,
        brickImage: 'img-1',
        brickImagePreviewUrl: 'https://example.com/preview.jpg',
        brickImageFullUrl: 'https://example.com/full.jpg',
        parkLocationName: 'Zone 1',
        parkLocationImgURL: 'https://example.com/map-large.jpg',
      }

      vi.clearAllMocks()
      mockedAxios.get.mockResolvedValue(mockParkLocationResponse())

      wrapper = mount(BrickCard, {
        props: {
          brick: styledBrick,
        },
        global: {
          provide: {
            [defaultEnvKey as symbol]: 'https://example.com',
            [defaultUrlKey as symbol]: 'https://example.com/jsonapi/',
          },
          components: {
            UiModal,
          },
          stubs: {
            teleport: true,
          },
        },
      })

      await wrapper.vm.$nextTick()
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(mockedAxios.get).not.toHaveBeenCalled()
      expect((wrapper.vm as any).thumbnailUrl).toBe('https://example.com/preview.jpg')
      expect((wrapper.vm as any).brickImgUrl).toBe('https://example.com/full.jpg')
      expect((wrapper.vm as any).parkLocation).toBe('Zone 1')
      expect((wrapper.vm as any).parkLocationImgURL).toBe('https://example.com/map-large.jpg')
    })
  })
})
