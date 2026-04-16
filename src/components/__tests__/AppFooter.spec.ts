import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../AppFooter.vue'

describe('AppFooter', () => {
  const wrapper = mount(AppFooter)

  it('renders a footer element', () => {
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('displays "Babson College"', () => {
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('a').attributes('aria-label')).toBe('Babson College home')
  })

  it('does not contain the subheader text', () => {
    expect(wrapper.text()).not.toContain('Find My Brick')
  })

  it('applies brickBabsonGreen background', () => {
    expect(wrapper.find('footer').classes()).toContain('tw-bg-brickBabsonGreen')
  })

  it('constrains inner content width to match header', () => {
    const inner = wrapper.find('footer > div')
    expect(inner.classes()).toContain('tw-max-w-brickMWL')
    expect(inner.classes()).toContain('tw-mx-auto')
  })

  it('uses the white logo mark', () => {
    const logoLink = wrapper.find('a')
    expect(logoLink.classes()).toContain('tw-text-white')
  })

  it('has no props and emits no events', () => {
    expect(wrapper.props()).toEqual({})
    expect(wrapper.emitted()).toEqual({})
  })
})
