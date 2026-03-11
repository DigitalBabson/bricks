import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TheBricks from '../TheBricks.vue'
import { defaultEnvKey, defaultUrlKey } from '../../types/index'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

function makeBrick(id: string, inscription: string) {
  return {
    id,
    attributes: { brickNumber: id, brickInscription: inscription },
    relationships: {
      brickImage: { data: null },
      brickParkLocation: { data: null },
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

function mountTheBricks(props: { inscription?: string } = {}) {
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

  describe('Sorting', () => {
    it('fetchBricks URL includes &sort=brickInscription', async () => {
      mountTheBricks()
      await flushPromises()
      const url = mockedAxios.get.mock.calls[0][0] as string
      expect(url).toContain('&sort=brickInscription')
    })
  })

  describe('Pagination state', () => {
    it('initializes with currentPage 1 and totalPages 1', () => {
      // Suppress the mounted fetch
      mockedAxios.get.mockResolvedValue(mockApiResponse([], 0))
      const wrapper = mountTheBricks()
      const vm = wrapper.vm as any
      expect(vm.currentPage).toBe(1)
      expect(vm.totalPages).toBe(1)
    })

    it('calculates totalPages from meta.count', async () => {
      const wrapper = mountTheBricks()
      await flushPromises()
      const vm = wrapper.vm as any
      // 100 items / 20 per page = 5 pages
      expect(vm.totalPages).toBe(5)
    })

    it('goToPage sets currentPage and fetches with correct offset', async () => {
      const wrapper = mountTheBricks()
      await flushPromises()
      vi.clearAllMocks()

      mockedAxios.get.mockResolvedValue(
        mockApiResponse([makeBrick('3', 'Charlie')], 100)
      )

      const vm = wrapper.vm as any
      vm.goToPage(3)
      await flushPromises()

      expect(vm.currentPage).toBe(3)
      const url = mockedAxios.get.mock.calls[0][0] as string
      expect(url).toContain('page[offset]=40')
    })

    it('replaces bricks array on page change (not append)', async () => {
      const wrapper = mountTheBricks()
      await flushPromises()
      const vm = wrapper.vm as any
      expect(vm.bricks).toHaveLength(2)

      mockedAxios.get.mockResolvedValue(
        mockApiResponse([makeBrick('3', 'Charlie')], 100)
      )
      vm.goToPage(2)
      await flushPromises()

      // Should be replaced, not appended
      expect(vm.bricks).toHaveLength(1)
      expect(vm.bricks[0].id).toBe('3')
    })
  })

  describe('Query reset', () => {
    it('resets currentPage to 1 when inscription changes', async () => {
      const wrapper = mountTheBricks({ inscription: '' })
      await flushPromises()

      const vm = wrapper.vm as any
      vm.currentPage = 3

      await wrapper.setProps({ inscription: 'testquery' })
      await flushPromises()

      expect(vm.currentPage).toBe(1)
    })
  })

  describe('Template integration', () => {
    it('passes currentPage and totalPages to Pagination', async () => {
      const wrapper = mountTheBricks()
      await flushPromises()

      const pagination = wrapper.find('.stub-pagination')
      // With 100 items, pagination should be visible (totalPages=5 > 1)
      expect(pagination.exists()).toBe(true)
    })

    it('hides Pagination when totalPages <= 1', async () => {
      mockedAxios.get.mockResolvedValue(mockApiResponse([makeBrick('1', 'A')], 5))
      const wrapper = mountTheBricks()
      await flushPromises()

      // 5 items / 20 per page = 1 page → no pagination
      const pagination = wrapper.find('.stub-pagination')
      expect(pagination.exists()).toBe(false)
    })
  })

  describe('No results message', () => {
    it('shows no results message for empty search', async () => {
      const wrapper = mountTheBricks({ inscription: '' })
      await flushPromises()

      // Now mock empty response and change inscription
      mockedAxios.get.mockResolvedValue(mockApiResponse([], 0))
      await wrapper.setProps({ inscription: 'zzzzz' })
      await flushPromises()

      const vm = wrapper.vm as any
      expect(vm.showMessage).toBe(true)
    })
  })
})
