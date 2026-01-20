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

    it('initializes with imageError as false', () => {
      expect(wrapper.vm.imageError).toBe(false)
    })

    it('can open both modals independently', async () => {
      // Open image modal by clicking the container
      await wrapper.find('.brick-image-container').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showImg).toBe(true)
      expect(wrapper.vm.showMap).toBe(false)

      // Close image modal
      wrapper.vm.closeImg()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showImg).toBe(false)

      // Open map modal
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showMap).toBe(true)
      expect(wrapper.vm.showImg).toBe(false)
    })
  })

  describe('Inscription Overlay', () => {
    it('displays image when no error occurs', () => {
      expect(wrapper.vm.imageError).toBe(false)
      expect(wrapper.find('.brick-image').exists()).toBe(true)
      expect(wrapper.find('.brick-placeholder').exists()).toBe(false)
    })

    it('shows placeholder with inscription when image fails to load', async () => {
      // Trigger image error
      await wrapper.vm.handleImageError()
      await wrapper.vm.$nextTick()

      // Check that imageError state is true
      expect(wrapper.vm.imageError).toBe(true)

      // Check that placeholder is shown instead of image
      expect(wrapper.find('.brick-placeholder').exists()).toBe(true)
      expect(wrapper.find('.brick-image').exists()).toBe(false)
    })

    it('displays inscription text in overlay when image fails', async () => {
      // Trigger image error
      await wrapper.vm.handleImageError()
      await wrapper.vm.$nextTick()

      // Find the inscription overlay
      const overlay = wrapper.find('.inscription-overlay')
      expect(overlay.exists()).toBe(true)
      expect(overlay.text()).toBe(mockBrick.inscription)
    })

    it('handles image error event', async () => {
      // Find the image element
      const img = wrapper.find('.brick-image')
      expect(img.exists()).toBe(true)

      // Trigger the error event on the image
      await img.trigger('error')

      // Check that the error handler was called
      expect(wrapper.vm.imageError).toBe(true)
    })

    it('shows placeholder in modal when image fails', async () => {
      // Set image error
      await wrapper.vm.handleImageError()
      await wrapper.vm.$nextTick()

      // Open modal
      wrapper.vm.showImg = true
      await wrapper.vm.$nextTick()

      // Check that modal has placeholder with large overlay
      expect(wrapper.find('.brick-placeholder-large').exists()).toBe(true)
      expect(wrapper.find('.inscription-overlay-large').exists()).toBe(true)
    })

    it('clicking placeholder opens modal', async () => {
      // Set image error
      await wrapper.vm.handleImageError()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showImg).toBe(false)

      // Click the placeholder container
      await wrapper.find('.brick-image-container').trigger('click')

      expect(wrapper.vm.showImg).toBe(true)
    })
  })
})
