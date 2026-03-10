import { describe, it, expect, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import BrickCard from '../BrickCard.vue'
import UiModal from '../UiModal.vue'
import type { Brick } from '../../types/index'
import { defaultEnvKey, defaultUrlKey } from '../../types/index'

describe('BrickCard', () => {
  let wrapper: VueWrapper
  const mockBrick: Brick = {
    id: '123',
    number: '456',
    inscription: 'John Doe 1985',
    brickImage: 'default',
    brickParkLocation: 'park-1'
  }

  beforeEach(() => {
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

    it('renders "See location details" button', () => {
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('See location details')
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
  })
})
