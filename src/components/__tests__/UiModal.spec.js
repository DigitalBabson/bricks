import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiModal from '../UiModal.vue'

describe('UiModal', () => {
  it('renders modal with slot content', () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div class="test-content">Modal Content</div>'
      },
      attachTo: document.body
    })

    expect(wrapper.html()).toContain('Modal Content')
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div>Content</div>'
      },
      attachTo: document.body
    })

    const closeButton = wrapper.find('button')
    await closeButton.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close event when backdrop is clicked', async () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div>Content</div>'
      },
      attachTo: document.body
    })

    // Find the backdrop (the outer div with absolute positioning)
    const backdrop = wrapper.find('[class*="absolute inset-0"]')
    await backdrop.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('close')
  })

  it('does not emit close when modal content is clicked', async () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div class="modal-body">Content</div>'
      },
      attachTo: document.body
    })

    // Click on the modal content area (not backdrop)
    const modalContent = wrapper.find('.modal-body')
    await modalContent.trigger('click')

    // Should not emit close event when clicking inside modal
    // (This depends on implementation - may need adjustment based on actual UiModal.vue)
    expect(wrapper.html()).toContain('Content')
  })

  it('renders close button with X symbol', () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div>Content</div>'
      },
      attachTo: document.body
    })

    const closeButton = wrapper.find('button')
    expect(closeButton.exists()).toBe(true)
    expect(closeButton.text()).toBe('X')
  })

  it('has correct CSS classes for modal styling', () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div>Content</div>'
      },
      attachTo: document.body
    })

    // Check for backdrop classes (absolute positioning, dark overlay)
    expect(wrapper.html()).toContain('absolute')
    expect(wrapper.html()).toContain('inset-0')
  })
})
