import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import axios from 'axios'
import App from '../../App.vue'
import { defaultEnvKey, defaultUrlKey } from '../../types/index'
import { preloadImage } from '../../utils/preloadImage'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

vi.mock('../../utils/preloadImage', () => ({ preloadImage: vi.fn() }))

const locationsResponse = {
  data: {
    data: [
      {
        id: 'loc-1',
        attributes: { name: 'Class Walk of 2019' },
        relationships: {
          field_brick_zone_image: { data: { type: 'media--image', id: 'media-1' } },
        },
      },
      {
        id: 'loc-2',
        attributes: { name: 'Rodger Babson Statue' },
        relationships: {
          field_brick_zone_image: { data: { type: 'media--image', id: 'media-2' } },
        },
      },
    ],
    included: [
      { type: 'media--image', id: 'media-1', attributes: {}, relationships: { field_media_image: { data: { type: 'file--file', id: 'file-1' } } } },
      { type: 'media--image', id: 'media-2', attributes: {}, relationships: { field_media_image: { data: { type: 'file--file', id: 'file-2' } } } },
      { type: 'file--file', id: 'file-1', attributes: { uri: { url: '/sites/default/files/map1.png' }, image_style_uri: { full_im: 'https://example.com/styles/full_im/map1.png?itok=a', brick_large: 'https://example.com/styles/brick_large/map1.png?itok=b' } } },
      { type: 'file--file', id: 'file-2', attributes: { uri: { url: '/sites/default/files/map2.png' }, image_style_uri: { full_im: 'https://example.com/styles/full_im/map2.png?itok=c', brick_large: 'https://example.com/styles/brick_large/map2.png?itok=d' } } },
    ],
  },
}

function mountApp() {
  return mount(App, {
    global: {
      provide: {
        [defaultEnvKey as symbol]: 'https://example.com',
        [defaultUrlKey as symbol]: 'https://example.com/jsonapi/',
      },
      stubs: {
        AppHeader: true,
        AppHero: { name: 'AppHero', template: '<div><slot /></div>' },
        BrickFilter: true,
        TheBricks: true,
        LocationExplorerTrigger: true,
        AppFooter: true,
        teleport: true,
      },
    },
  })
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue(locationsResponse)
  })

  it('fetches locations on mount and stores them in state', async () => {
    const wrapper = mountApp()
    await flushPromises()

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://example.com/jsonapi/parkLocations' +
      '?include=field_brick_zone_image,field_brick_zone_image.field_media_image' +
      '&fields[parkLocation]=name,field_brick_zone_image' +
      '&fields[media--image]=field_media_image' +
      '&fields[file--file]=uri,url,image_style_uri,changed' +
      '&sort=name'
    )

    const vm = wrapper.vm as unknown as { locations: Array<{ id: string; name: string; mapImageUrl: string }> }
    expect(vm.locations).toEqual([
      { id: 'loc-1', name: 'Class Walk of 2019', mapImageUrl: 'https://example.com/sites/default/files/map1.png' },
      { id: 'loc-2', name: 'Rodger Babson Statue', mapImageUrl: 'https://example.com/sites/default/files/map2.png' },
    ])
  })

  it('falls back to full_im, never the cropped brick_large, when the original path is missing', async () => {
    const response = structuredClone(locationsResponse)
    for (const item of response.data.included) {
      if (item.type === 'file--file') {
        (item.attributes as { uri?: unknown }).uri = undefined
      }
    }
    mockedAxios.get.mockResolvedValueOnce(response)

    const wrapper = mountApp()
    await flushPromises()

    const vm = wrapper.vm as unknown as { locations: Array<{ mapImageUrl: string }> }
    expect(vm.locations.map((location) => location.mapImageUrl)).toEqual([
      'https://example.com/styles/full_im/map1.png?itok=a',
      'https://example.com/styles/full_im/map2.png?itok=c',
    ])
  })

  it('preloads the first location map when the explorer trigger is about to be used', async () => {
    const wrapper = mountApp()
    await flushPromises()

    wrapper.findComponent({ name: 'AppHero' }).vm.$emit('prefetchLocations')

    expect(preloadImage).toHaveBeenCalledWith('https://example.com/sites/default/files/map1.png')
  })

  it('resets inscription and locationIds with clearAllFilters', async () => {
    const wrapper = mountApp()
    await flushPromises()

    const vm = wrapper.vm as unknown as {
      inscription: string
      locationIds: string[]
      clearAllFilters: () => void
    }

    vm.inscription = 'sample'
    vm.locationIds = ['loc-1', 'loc-2']
    vm.clearAllFilters()

    expect(vm.inscription).toBe('')
    expect(vm.locationIds).toEqual([])
  })
})
