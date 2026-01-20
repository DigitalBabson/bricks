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
    imgLink: 'test-image.jpg',
    zone: 'zone1'
  }

  beforeEach(() => {
    wrapper = mount(BrickCard, {
      props: {
        brick: mockBrick
      },
      global: {
        components: {
          UiModal
        },
        stubs: {
          teleport: true // Stub teleport for testing
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders brick card with image', () => {
      expect(wrapper.find('article').exists()).toBe(true)
      expect(wrapper.find('img').attributes('src')).toBe(mockBrick.imgLink)
    })

    it('renders "View on map" button', () => {
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('View on map')
    })
  })

  describe('Image Modal', () => {
    it('shows image modal when image is clicked', async () => {
      expect(wrapper.vm.showImg).toBe(false)

      await wrapper.find('img').trigger('click')

      expect(wrapper.vm.showImg).toBe(true)
    })

    it('closes image modal when close event is emitted', async () => {
      wrapper.vm.showImg = true
      await wrapper.vm.$nextTick()

      wrapper.vm.closeImg()

      expect(wrapper.vm.showImg).toBe(false)
    })
  })

  describe('Map Modal', () => {
    it('shows map modal when "View on map" button is clicked', async () => {
      expect(wrapper.vm.showMap).toBe(false)

      await wrapper.find('button').trigger('click')

      expect(wrapper.vm.showMap).toBe(true)
    })

    it('closes map modal when close event is emitted', async () => {
      wrapper.vm.showMap = true
      await wrapper.vm.$nextTick()

      wrapper.vm.closeMap()

      expect(wrapper.vm.showMap).toBe(false)
    })

    it('renders correct zone map path when modal is open', async () => {
      wrapper.vm.showMap = true
      await wrapper.vm.$nextTick()

      // Note: With teleport stubbed, we can still test the logic
      // In real DOM, teleport would move content to body
      const expectedPath = `src/assets/maps/${mockBrick.zone}.jpg`
      expect(wrapper.html()).toContain(expectedPath)
    })
  })

  describe('Props', () => {
    it('accepts brick prop', () => {
      expect(wrapper.props('brick')).toEqual(mockBrick)
    })

    it('uses brick data in rendering', () => {
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe(mockBrick.imgLink)
    })
  })

  describe('Component State', () => {
    it('initializes with modals closed', () => {
      expect(wrapper.vm.showMap).toBe(false)
      expect(wrapper.vm.showImg).toBe(false)
    })

    it('can open both modals independently', async () => {
      // Open image modal
      await wrapper.find('img').trigger('click')
      expect(wrapper.vm.showImg).toBe(true)
      expect(wrapper.vm.showMap).toBe(false)

      // Close image modal
      wrapper.vm.closeImg()
      expect(wrapper.vm.showImg).toBe(false)

      // Open map modal
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showMap).toBe(true)
      expect(wrapper.vm.showImg).toBe(false)
    })
  })
})
