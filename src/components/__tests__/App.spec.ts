import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import axios from 'axios'
import App from '../../App.vue'
import { defaultUrlKey } from '../../types/index'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const locationsResponse = {
  data: {
    data: [
      {
        id: 'loc-1',
        attributes: { name: 'Class Walk of 2019' },
        relationships: {
          brick_zone_image: { data: { id: 'img-1' } },
        },
      },
      {
        id: 'loc-2',
        attributes: { name: 'Rodger Babson Statue' },
        relationships: {
          brick_zone_image: { data: { id: 'img-2' } },
        },
      },
    ],
    included: [
      { id: 'img-1', attributes: { image_style_uri: { full_img: 'https://example.com/map1.jpg' } } },
      { id: 'img-2', attributes: { image_style_uri: { full_img: 'https://example.com/map2.jpg' } } },
    ],
  },
}

function mountApp() {
  return mount(App, {
    global: {
      provide: {
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
      'https://example.com/jsonapi/parkLocations?fields[parkLocation]=name&include=brick_zone_image&sort=name'
    )

    const vm = wrapper.vm as unknown as { locations: Array<{ id: string; name: string; mapImageUrl: string }> }
    expect(vm.locations).toEqual([
      { id: 'loc-1', name: 'Class Walk of 2019', mapImageUrl: 'https://example.com/map1.jpg' },
      { id: 'loc-2', name: 'Rodger Babson Statue', mapImageUrl: 'https://example.com/map2.jpg' },
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
