import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BrickCard from '../BrickCard.vue'
import UiModal from '../UiModal.vue'

describe('BrickCard', () => {
  let wrapper
  const mockBrick = {
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
          defaultEnv: 'https://example.com',
          defaultUrl: 'https://example.com/api/'
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
      expect(wrapper.vm.showImg).toBe(false)

      wrapper.vm.openImg()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showImg).toBe(true)
    })

    it('closes image modal via method', async () => {
      wrapper.vm.showImg = true
      await wrapper.vm.$nextTick()

      wrapper.vm.closeImg()

      expect(wrapper.vm.showImg).toBe(false)
    })
  })

  describe('Map Modal', () => {
    it('opens map modal when button is clicked', async () => {
      expect(wrapper.vm.showMap).toBe(false)

      await wrapper.find('button').trigger('click')

      expect(wrapper.vm.showMap).toBe(true)
    })

    it('closes map modal via method', async () => {
      wrapper.vm.showMap = true
      await wrapper.vm.$nextTick()

      wrapper.vm.closeMap()

      expect(wrapper.vm.showMap).toBe(false)
    })
  })

  describe('Props', () => {
    it('accepts brick prop', () => {
      expect(wrapper.props('brick')).toEqual(mockBrick)
    })
  })

  describe('Component State', () => {
    it('initializes with modals closed', () => {
      expect(wrapper.vm.showMap).toBe(false)
      expect(wrapper.vm.showImg).toBe(false)
    })

    it('initializes with loading state', () => {
      expect(wrapper.vm.isImgLoading).toBeDefined()
      expect(wrapper.vm.hasImgError).toBe(false)
    })
  })
})
