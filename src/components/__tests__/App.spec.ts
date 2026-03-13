import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import axios from 'axios'
import App from '../../App.vue'
import { defaultEnvKey, defaultUrlKey } from '../../types/index'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

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
      { type: 'file--file', id: 'file-1', attributes: { uri: { url: '/sites/default/files/map1.png' }, image_style_uri: { brick_large: 'https://example.com/styles/map1-large.png' } } },
      { type: 'file--file', id: 'file-2', attributes: { uri: { url: '/sites/default/files/map2.png' }, image_style_uri: { brick_large: 'https://example.com/styles/map2-large.png' } } },
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
        AppHero: { template: '<div><slot /></div>' },
        BrickFilter: true,
        TheBricks: true,
        LocationExplorerTrigger: true,
        AppFooter: true,
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
      '&fields[file--file]=uri,url,image_style_uri' +
      '&sort=name'
    )

    const vm = wrapper.vm as unknown as { locations: Array<{ id: string; name: string; mapImageUrl: string }> }
    expect(vm.locations).toEqual([
      { id: 'loc-1', name: 'Class Walk of 2019', mapImageUrl: 'https://example.com/styles/map1-large.png' },
      { id: 'loc-2', name: 'Rodger Babson Statue', mapImageUrl: 'https://example.com/styles/map2-large.png' },
    ])
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
