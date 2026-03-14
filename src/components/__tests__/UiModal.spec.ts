import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiModal from '../UiModal.vue'

describe('UiModal', () => {
  function mountModal(slotMarkup = '<div>Content</div>') {
    return mount(UiModal, {
      slots: {
        default: slotMarkup
      },
      attachTo: document.body
    })
  }

  it('renders modal with slot content', () => {
    const wrapper = mountModal('<div class="test-content">Modal Content</div>')

    expect(document.body.innerHTML).toContain('Modal Content')
    expect(document.body.querySelector('.test-content')).not.toBeNull()
    wrapper.unmount()
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mountModal()

    const closeButton = document.body.querySelector('button')
    expect(closeButton).not.toBeNull()
    ;(closeButton as HTMLButtonElement).click()

    expect(wrapper.emitted()).toHaveProperty('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits close event when backdrop is clicked', async () => {
    const wrapper = mountModal()

    const backdrop = document.body.querySelector('.tw-bg-black\\/\\[0\\.87\\]')
    expect(backdrop).not.toBeNull()
    ;(backdrop as HTMLElement).click()

    expect(wrapper.emitted()).toHaveProperty('close')
    wrapper.unmount()
  })

  it('emits close event when Escape is pressed', () => {
    const wrapper = mountModal()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted()).toHaveProperty('close')
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not emit close when modal content is clicked', async () => {
    const wrapper = mountModal('<div class="modal-body">Content</div>')

    const modalContent = document.body.querySelector('.modal-body')
    expect(modalContent).not.toBeNull()
    ;(modalContent as HTMLElement).click()

    expect(document.body.innerHTML).toContain('Content')
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('renders close button with a visible close glyph', () => {
    const wrapper = mountModal()

    const closeButton = document.body.querySelector('button')
    expect(closeButton).not.toBeNull()
    expect(closeButton?.textContent).toContain('×')
    wrapper.unmount()
  })

  it('uses fixed positioning for modal overlay', () => {
    const wrapper = mountModal()

    expect(document.body.innerHTML).toContain('tw-fixed')
    expect(document.body.innerHTML).toContain('tw-inset-0')
    wrapper.unmount()
  })
})
