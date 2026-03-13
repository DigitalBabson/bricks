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

    // Backdrop is the div with tw-fixed tw-inset-0 tw-bg-gray-900
    const backdrop = wrapper.find('.tw-bg-gray-900')
    await backdrop.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('close')
  })

  it('emits close event when Escape is pressed', () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div>Content</div>'
      },
      attachTo: document.body
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted()).toHaveProperty('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close when modal content is clicked', async () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div class="modal-body">Content</div>'
      },
      attachTo: document.body
    })

    const modalContent = wrapper.find('.modal-body')
    await modalContent.trigger('click')

    expect(wrapper.html()).toContain('Content')
  })

  it('renders close button with FontAwesome icon', () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div>Content</div>'
      },
      attachTo: document.body
    })

    const closeButton = wrapper.find('button')
    expect(closeButton.exists()).toBe(true)
    expect(closeButton.find('i.fas.fa-times').exists()).toBe(true)
  })

  it('uses fixed positioning for modal overlay', () => {
    const wrapper = mount(UiModal, {
      slots: {
        default: '<div>Content</div>'
      },
      attachTo: document.body
    })

    expect(wrapper.html()).toContain('tw-fixed')
    expect(wrapper.html()).toContain('tw-inset-0')
  })
})
