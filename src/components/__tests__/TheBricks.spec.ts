import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import axios from 'axios'
import TheBricks from '../TheBricks.vue'
import { defaultEnvKey, defaultUrlKey, searchstaxEndpointKey, searchstaxTokenKey } from '../../types/index'
import type { BrickApiItem, FileApiItem, ParkLocation } from '../../types/index'
import * as searchstaxService from '../../services/searchstax'

vi.mock('axios')
vi.mock('../../services/searchstax')

const mockedAxios = vi.mocked(axios, true)
const mockedSearchBricks = vi.mocked(searchstaxService.searchBricks)

function makeBrick(id: string, inscription: string, locationId = 'loc-1', imageId?: string): BrickApiItem {
  return {
    id,
    attributes: { field_brick_inscription: inscription },
    relationships: {
      field_brick_image: { data: imageId ? { id: imageId } : null },
      field_brick_zone: { data: { id: locationId } },
    },
  }
}

function makeIncludedFile(id: string, preview = `https://cdn.example.com/${id}-preview.jpg`, full = `https://cdn.example.com/${id}-full.jpg`) {
  return {
    type: 'file--file',
    id,
    attributes: {
      uri: { url: `/files/${id}.jpg` },
      image_style_uri: {
        brick_preview: preview,
        brick_large: full,
      },
    },
  }
}

function makePlaceholderIncludedFile(id: string) {
  return {
    type: 'file--file',
    id,
    attributes: {
      uri: { url: '/sites/default/files/images/bricks/coming-soon-gray.jpg' },
      image_style_uri: {
        brick_preview: 'https://babsondev.prod.acquia-sites.com/sites/default/files/styles/brick_preview/public/images/bricks/coming-soon-gray.jpg',
        brick_large: 'https://babsondev.prod.acquia-sites.com/sites/default/files/styles/brick_large/public/images/bricks/coming-soon-gray.jpg',
      },
    },
  }
}

function makeFileItem(id: string, preview = `https://cdn.example.com/${id}-preview.jpg`, full = `https://cdn.example.com/${id}-full.jpg`): FileApiItem {
  return {
    id,
    attributes: {
      uri: { url: `/files/${id}.jpg` },
      image_style_uri: {
        brick_preview: preview,
        brick_large: full,
      },
    },
  }
}

const defaultLocations: ParkLocation[] = [
  { id: 'zone-1', name: 'Zone 1', mapImageUrl: 'https://example.com/map-zone-1.jpg' },
  { id: 'zone-2', name: 'Zone 2', mapImageUrl: 'https://example.com/map-zone-2.jpg' },
  { id: 'loc-1', name: 'Location 1', mapImageUrl: 'https://example.com/map-loc-1.jpg' },
]

function mockApiResponse(
  bricks: BrickApiItem[],
  count: number,
  included: ReturnType<typeof makeIncludedFile>[] = []
) {
  return {
    data: {
      data: bricks,
      included,
      links: { next: count > 20 ? { href: 'next-url' } : undefined },
      meta: { count },
    },
  }
}

function mountTheBricks(
  props: Partial<{
    inscription: string
    locationIds: string[]
    locations: ParkLocation[]
  }> = {}
) {
  return mount(TheBricks, {
    props: {
      locations: defaultLocations,
      ...props,
    },
    global: {
      provide: {
        [defaultEnvKey as symbol]: 'prod',
        [defaultUrlKey as symbol]: 'https://example.com/jsonapi/',
        [searchstaxEndpointKey as symbol]: 'https://search.example.com/emselect',
        [searchstaxTokenKey as symbol]: 'test-token',
      },
      stubs: {
        BrickCard: { template: '<div class="stub-brick" />', props: ['brick'] },
        Pagination: {
          template: '<div v-if="totalPages > 1" class="stub-pagination" />',
          props: ['currentPage', 'totalPages'],
          emits: ['update:page'],
        },
      },
    },
  })
}

describe('TheBricks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    mockedAxios.get.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('file/file')) {
        return Promise.resolve({
          data: {
            data: [makeFileItem('img-1'), makeFileItem('img-2')],
          },
        } as never)
      }

      return Promise.resolve(
        mockApiResponse(
          [makeBrick('1', 'Alpha'), makeBrick('2', 'Beta')],
          100
        ) as never
      )
    })
    mockedSearchBricks.mockResolvedValue({
      bricks: [
        { id: 'ss-1', inscription: 'BRUCE SMITH', brickImage: 'img-1', brickParkLocation: 'zone-1' },
      ],
      numFound: 1,
    })
  })

  // --- Existing tests (updated for new behavior) ---

  it('includes sort=field_brick_inscription in browse requests', async () => {
    mountTheBricks()
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('&sort=field_brick_inscription')
    expect(url).toContain('&include=field_brick_image')
    expect(url).toContain('&fields[brick]=field_brick_inscription,field_brick_image,field_brick_zone')
    expect(url).toContain('&fields[file--file]=uri,url,image_style_uri')
  })

  it('uses Drupal IN filtering when locationIds are present', async () => {
    mountTheBricks({ locationIds: ['loc-2', 'loc-3'] })
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter[field_brick_zone.id][operator]=IN')
    expect(url).toContain('filter[field_brick_zone.id][value]=loc-2,loc-3')
    expect(url).not.toContain('filter[field_brick_inscription][operator]=CONTAINS')
  })

  it('omits the location filter when locationIds is empty', async () => {
    mountTheBricks({ locationIds: [] })
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).not.toContain('filter[field_brick_zone.id][value]=')
  })

  it('initializes with currentPage 1 and totalPages 1', () => {
    mockedAxios.get.mockResolvedValue(mockApiResponse([], 0))
    const wrapper = mountTheBricks()
    const vm = wrapper.vm as InstanceType<typeof TheBricks> & { currentPage: number; totalPages: number }

    expect(vm.currentPage).toBe(1)
    expect(vm.totalPages).toBe(1)
  })

  it('calculates totalPages from meta.count and emits totalCount', async () => {
    const wrapper = mountTheBricks({ locationIds: ['loc-1'] })
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & { totalPages: number }
    expect(vm.totalPages).toBe(5)
    expect(wrapper.emitted('update:totalCount')).toEqual([[100]])
  })

  it('goToPage sets currentPage and fetches with the correct offset', async () => {
    const wrapper = mountTheBricks({ locationIds: ['loc-1'] })
    await flushPromises()
    vi.clearAllMocks()

    mockedAxios.get.mockResolvedValue(mockApiResponse([makeBrick('3', 'Charlie')], 100))

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & { goToPage: (page: number) => void; currentPage: number }
    vm.goToPage(3)
    await flushPromises()

    expect(vm.currentPage).toBe(3)
    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('page[offset]=40')
  })

  it('replaces bricks instead of appending on page changes', async () => {
    const wrapper = mountTheBricks()
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & { bricks: Array<{ id: string }>; goToPage: (page: number) => void }
    expect(vm.bricks).toHaveLength(2)

    mockedAxios.get.mockResolvedValue(mockApiResponse([makeBrick('3', 'Charlie')], 100))
    vm.goToPage(2)
    await flushPromises()

    expect(vm.bricks).toHaveLength(1)
    expect(vm.bricks[0].id).toBe('3')
  })

  it('maps included Drupal image styles onto bricks', async () => {
    mockedAxios.get.mockResolvedValue(
      mockApiResponse(
        [
          makeBrick('1', 'Alpha', 'loc-1', 'img-1'),
        ],
        1,
        [makeIncludedFile('img-1')]
      )
    )

    const wrapper = mountTheBricks()
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & {
      bricks: Array<{ brickImagePreviewUrl?: string; brickImageFullUrl?: string }>
    }

    expect(vm.bricks[0].brickImagePreviewUrl).toBe('https://cdn.example.com/img-1-preview.jpg')
    expect(vm.bricks[0].brickImageFullUrl).toBe('https://cdn.example.com/img-1-full.jpg')
  })

  it('marks Drupal default placeholder images as coming-soon bricks', async () => {
    mockedAxios.get.mockResolvedValue(
      mockApiResponse(
        [
          makeBrick('1', 'Alpha', 'loc-1', 'img-1'),
        ],
        1,
        [makePlaceholderIncludedFile('img-1')]
      )
    )

    const wrapper = mountTheBricks()
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & {
      bricks: Array<{ isPlaceholderImage?: boolean; brickImagePreviewUrl?: string; brickImageFullUrl?: string }>
    }

    expect(vm.bricks[0].isPlaceholderImage).toBe(true)
    expect(vm.bricks[0].brickImagePreviewUrl).toBeUndefined()
    expect(vm.bricks[0].brickImageFullUrl).toBeUndefined()
  })

  it('enriches existing bricks when locations arrive after the initial fetch', async () => {
    const wrapper = mountTheBricks({ locations: [] })
    await flushPromises()

    await wrapper.setProps({
      locations: [{ id: 'loc-1', name: 'Late Location', mapImageUrl: 'https://example.com/late-map.jpg' }],
    })
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & {
      bricks: Array<{ parkLocationName?: string; parkLocationImgURL?: string }>
    }

    expect(vm.bricks[0].parkLocationName).toBe('Late Location')
    expect(vm.bricks[0].parkLocationImgURL).toBe('https://example.com/late-map.jpg')
  })

  it('resets currentPage to 1 and refetches when locationIds changes', async () => {
    const wrapper = mountTheBricks({ locationIds: [] })
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & { currentPage: number }
    vm.currentPage = 3
    vi.clearAllMocks()

    await wrapper.setProps({ locationIds: ['loc-1', 'loc-2'] })
    await flushPromises()

    expect(vm.currentPage).toBe(1)
    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter[field_brick_zone.id][value]=loc-1,loc-2')
  })

  it('shows the no-results message when a location filter returns zero results', async () => {
    mockedAxios.get.mockResolvedValue(mockApiResponse([], 0))
    const wrapper = mountTheBricks({ locationIds: ['loc-empty'] })
    await flushPromises()

    expect(wrapper.text()).toContain('No bricks match your criteria')
  })

  it('keeps default browse working when there are no active filters', async () => {
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()

    expect(wrapper.findAll('.stub-brick')).toHaveLength(2)
    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('bricks?page[limit]=20')
    expect(url).not.toContain('filter[field_brick_zone.id][value]=')
  })

  it('renders pagination only when more than one page is available', async () => {
    const wrapper = mountTheBricks()
    await flushPromises()
    expect(wrapper.find('.stub-pagination').exists()).toBe(true)

    mockedAxios.get.mockResolvedValue(mockApiResponse([makeBrick('1', 'Alpha')], 5))
    const singlePageWrapper = mountTheBricks()
    await flushPromises()
    expect(singlePageWrapper.find('.stub-pagination').exists()).toBe(false)
  })

  // --- New SearchStax routing tests ---

  it('routes keyword-only search through SearchStax', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: 'bruce' })
    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(mockedSearchBricks).toHaveBeenCalledTimes(1)
    expect(mockedSearchBricks).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'bruce',
        locationIds: undefined,
      })
    )
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    expect(mockedAxios.get.mock.calls[0][0]).toContain('file/file?filter[id-filter][condition][path]=id')
  })

  it('routes combined keyword + location search through SearchStax', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: '', locationIds: ['zone-1', 'zone-2'] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: 'bruce' })
    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(mockedSearchBricks).toHaveBeenCalledTimes(1)
    expect(mockedSearchBricks).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'bruce',
        locationIds: ['zone-1', 'zone-2'],
      })
    )
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    expect(mockedAxios.get.mock.calls[0][0]).toContain('file/file?filter[id-filter][condition][path]=id')
  })

  it('uses SearchStax results with one batched file hydration request', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    mockedSearchBricks.mockResolvedValue({
      bricks: [
        { id: 'ss-1', inscription: 'BRUCE SMITH', brickImage: 'img-1', brickParkLocation: 'zone-1' },
        { id: 'ss-2', inscription: 'BRUCE JONES', brickImage: 'img-2', brickParkLocation: 'zone-2' },
      ],
      numFound: 2,
    })

    await wrapper.setProps({ inscription: 'bruce' })
    vi.advanceTimersByTime(500)
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & {
      bricks: Array<{
        id: string
        inscription: string
        brickImagePreviewUrl?: string
        parkLocationName?: string
      }>
    }
    expect(vm.bricks).toHaveLength(2)
    expect(vm.bricks[0].id).toBe('ss-1')
    expect(vm.bricks[1].inscription).toBe('BRUCE JONES')
    expect(vm.bricks[0].brickImagePreviewUrl).toBe('https://cdn.example.com/img-1-preview.jpg')
    expect(vm.bricks[0].parkLocationName).toBe('Zone 1')
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    expect(mockedAxios.get.mock.calls[0][0]).toContain('file/file?filter[id-filter][condition][path]=id')
    expect(mockedAxios.get.mock.calls[0][0]).not.toContain('/jsonapi/bricks?')
  })

  it('uses SearchStax numFound for pagination when keyword is active', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    mockedSearchBricks.mockResolvedValue({
      bricks: [{ id: 'ss-1', inscription: 'BRUCE', brickImage: 'img-1', brickParkLocation: 'zone-1' }],
      numFound: 45,
    })

    await wrapper.setProps({ inscription: 'bruce' })
    vi.advanceTimersByTime(500)
    await flushPromises()

    const vm = wrapper.vm as InstanceType<typeof TheBricks> & { totalPages: number }
    expect(vm.totalPages).toBe(3) // ceil(45/20) = 3
  })

  it('falls back to Drupal CONTAINS when SearchStax fails', async () => {
    vi.useFakeTimers()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    mockedSearchBricks.mockRejectedValue(new Error('SearchStax down'))
    mockedAxios.get.mockResolvedValue(
      mockApiResponse([makeBrick('d-1', 'BRUCE FALLBACK')], 1)
    )

    await wrapper.setProps({ inscription: 'bruce' })
    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(mockedSearchBricks).toHaveBeenCalledTimes(1)
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter[field_brick_inscription][operator]=CONTAINS')
    expect(url).toContain('filter[field_brick_inscription][value]=bruce')
    expect(warnSpy).toHaveBeenCalledWith('SearchStax unavailable, falling back to Drupal keyword search')

    warnSpy.mockRestore()
  })

  it('falls back to Drupal CONTAINS with location filter when SearchStax fails for combined search', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountTheBricks({ inscription: '', locationIds: ['zone-1'] })
    await flushPromises()
    vi.clearAllMocks()

    mockedSearchBricks.mockRejectedValue(new Error('SearchStax down'))
    mockedAxios.get.mockResolvedValue(
      mockApiResponse([makeBrick('d-1', 'BRUCE FALLBACK')], 1)
    )

    await wrapper.setProps({ inscription: 'bruce' })
    vi.advanceTimersByTime(500)
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter[field_brick_inscription][operator]=CONTAINS')
    expect(url).toContain('filter[field_brick_zone.id][operator]=IN')
    expect(url).toContain('filter[field_brick_zone.id][value]=zone-1')

    vi.mocked(console.warn).mockRestore()
  })

  // --- Debounce tests ---

  it('debounces keyword search by 500ms', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: 'bru' })
    await flushPromises()

    // Not fired yet (only 0ms elapsed)
    expect(mockedSearchBricks).not.toHaveBeenCalled()

    // After 200ms still not fired
    vi.advanceTimersByTime(200)
    await flushPromises()
    expect(mockedSearchBricks).not.toHaveBeenCalled()

    // After 500ms total — fires
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(mockedSearchBricks).toHaveBeenCalledTimes(1)
  })

  it('only fires one fetch when typing rapidly', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: 'bru' })
    vi.advanceTimersByTime(200)
    await wrapper.setProps({ inscription: 'bruc' })
    vi.advanceTimersByTime(200)
    await wrapper.setProps({ inscription: 'bruce' })
    vi.advanceTimersByTime(500)
    await flushPromises()

    // Only one call for the final value
    expect(mockedSearchBricks).toHaveBeenCalledTimes(1)
    expect(mockedSearchBricks).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: 'bruce' })
    )
  })

  it('fires immediately when clearing the keyword (no debounce)', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: 'bruce', locationIds: [] })
    // Need to wait for the debounced initial fetch
    vi.advanceTimersByTime(500)
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: '' })
    await flushPromises()

    // Should call Drupal immediately (no 500ms wait)
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('bricks?page[limit]=20')
    expect(url).not.toContain('filter[field_brick_inscription]')
  })

  it('does not fetch for keywords under 3 characters', async () => {
    vi.useFakeTimers()
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: 'ab' })
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(mockedSearchBricks).not.toHaveBeenCalled()
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })

  it('locationIds watcher fires immediately (no debounce)', async () => {
    const wrapper = mountTheBricks({ locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ locationIds: ['loc-1'] })
    await flushPromises()

    // Should fire immediately without needing timer advancement
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
  })
})
