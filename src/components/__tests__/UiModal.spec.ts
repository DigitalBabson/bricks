import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UiModal from '../UiModal.vue'

// Reset the body scroll lock counter between tests by resetting the module
beforeEach(() => {
  document.body.style.overflow = ''
})

describe('UiModal', () => {
  function mountModal(slotMarkup = '<div>Content</div>', label = 'Test dialog') {
    return mount(UiModal, {
      props: { label },
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
    expect(closeButton?.querySelector('i.fa-solid.fa-xmark')).not.toBeNull()
    wrapper.unmount()
  })

  it('uses fixed positioning for modal overlay', () => {
    const wrapper = mountModal()

    expect(document.body.innerHTML).toContain('tw-fixed')
    expect(document.body.innerHTML).toContain('tw-inset-0')
    wrapper.unmount()
  })

  it('sets aria-label on the dialog element', () => {
    const wrapper = mountModal('<div>Content</div>', 'Brick image: Test Inscription')

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.getAttribute('aria-label')).toBe('Brick image: Test Inscription')
    wrapper.unmount()
  })

  it('sets body overflow hidden on mount and restores on unmount', () => {
    const wrapper = mountModal()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('does not restore body overflow when a second modal is still open', () => {
    const w1 = mountModal()
    const w2 = mountModal()

    expect(document.body.style.overflow).toBe('hidden')

    w1.unmount()
    expect(document.body.style.overflow).toBe('hidden') // still locked

    w2.unmount()
    expect(document.body.style.overflow).toBe('') // now released
  })
})
