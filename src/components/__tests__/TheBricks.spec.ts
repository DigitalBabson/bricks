import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import axios from 'axios'
import TheBricks from '../TheBricks.vue'
import { defaultEnvKey, defaultUrlKey } from '../../types/index'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

function makeBrick(id: string, inscription: string, locationId = 'loc-1') {
  return {
    id,
    attributes: { brickNumber: id, brickInscription: inscription },
    relationships: {
      brickImage: { data: null },
      brickParkLocation: { data: { id: locationId } },
    },
  }
}

function mockApiResponse(bricks: ReturnType<typeof makeBrick>[], count: number) {
  return {
    data: {
      data: bricks,
      links: { next: count > 20 ? { href: 'next-url' } : undefined },
      meta: { count },
    },
  }
}

function mountTheBricks(
  props: Partial<{
    inscription: string
    locationIds: string[]
  }> = {}
) {
  return mount(TheBricks, {
    props,
    global: {
      provide: {
        [defaultEnvKey as symbol]: 'prod',
        [defaultUrlKey as symbol]: 'https://example.com/jsonapi/',
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
    mockedAxios.get.mockResolvedValue(
      mockApiResponse(
        [makeBrick('1', 'Alpha'), makeBrick('2', 'Beta')],
        100
      )
    )
  })

  it('includes sort=brickInscription in browse requests', async () => {
    mountTheBricks()
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('&sort=brickInscription')
  })

  it('uses Drupal IN filtering when locationIds are present', async () => {
    mountTheBricks({ locationIds: ['loc-2', 'loc-3'] })
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter[brickParkLocation.id][operator]=IN')
    expect(url).toContain('filter[brickParkLocation.id][value]=loc-2,loc-3')
    expect(url).not.toContain('filter[brickInscription][operator]=CONTAINS')
  })

  it('omits the location filter when locationIds is empty', async () => {
    mountTheBricks({ locationIds: [] })
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).not.toContain('filter[brickParkLocation.id][value]=')
  })

  it('uses Drupal CONTAINS filtering for keyword-only search during testing', async () => {
    mountTheBricks({ inscription: 'John', locationIds: [] })
    await flushPromises()

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter[brickInscription][operator]=CONTAINS')
    expect(url).toContain('filter[brickInscription][value]=John')
    expect(url).not.toContain('filter[brickParkLocation.id][value]=')
  })

  it('refetches when inscription reaches the keyword threshold without a location filter', async () => {
    const wrapper = mountTheBricks({ inscription: '', locationIds: [] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: 'John' })
    await flushPromises()

    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter[brickInscription][operator]=CONTAINS')
  })

  it('does not refetch from inscription changes while a location filter is active', async () => {
    const wrapper = mountTheBricks({ inscription: '', locationIds: ['loc-1'] })
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.setProps({ inscription: 'John' })
    await flushPromises()

    expect(mockedAxios.get).not.toHaveBeenCalled()
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
    expect(url).toContain('filter[brickParkLocation.id][value]=loc-1,loc-2')
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
    expect(url).not.toContain('filter[brickParkLocation.id][value]=')
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
})
