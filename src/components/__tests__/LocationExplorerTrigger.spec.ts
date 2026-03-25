import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LocationExplorerTrigger from '../LocationExplorerTrigger.vue'

describe('LocationExplorerTrigger', () => {
  it('renders the CTA copy', () => {
    const wrapper = mount(LocationExplorerTrigger)

    expect(wrapper.text()).toBe('View Brick Locations')
  })

  it('emits openLocations on click', async () => {
    const wrapper = mount(LocationExplorerTrigger)

    await wrapper.trigger('click')

    expect(wrapper.emitted('openLocations')).toHaveLength(1)
  })

  it('supports the mobile floating variant', () => {
    const wrapper = mount(LocationExplorerTrigger, {
      props: {
        floating: true,
      },
    })

    expect(wrapper.classes()).toContain('tw-fixed')
    expect(wrapper.classes()).toContain('tw-bottom-0')
    expect(wrapper.classes()).toContain('tw-right-0')
    expect(wrapper.classes()).toContain('tw-z-50')
    expect(wrapper.classes()).toContain('tw-rounded-none')
  })

  it('uses the desktop sizing by default', () => {
    const wrapper = mount(LocationExplorerTrigger)

    expect(wrapper.classes()).toContain('tw-px-6')
    expect(wrapper.classes()).toContain('tw-py-3')
    expect(wrapper.classes()).not.toContain('tw-fixed')
  })
})
