import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'

describe('AppHeader', () => {
  const wrapper = mount(AppHeader)

  it('renders a header element', () => {
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('displays "Babson College" in an h1', () => {
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.find('svg').exists()).toBe(true)
    expect(h1.find('a').attributes('title')).toBe('Babson College')
  })

  it('displays the subtitle text', () => {
    const p = wrapper.find('p')
    expect(p.exists()).toBe(true)
    expect(p.text()).toBe('Find My Brick at Kerry Murphy Healey Park')
  })

  it('applies brickBabsonGreen background', () => {
    expect(wrapper.find('header').classes()).toContain('tw-bg-brickBabsonGreen')
  })

  it('constrains inner content width', () => {
    const inner = wrapper.find('header > div')
    expect(inner.classes()).toContain('tw-max-w-brickMWL')
    expect(inner.classes()).toContain('tw-mx-auto')
  })

  it('uses the white logo and white subtitle text', () => {
    const logoLink = wrapper.find('h1 a')
    expect(logoLink.classes()).toContain('tw-text-white')
    const p = wrapper.find('p')
    expect(p.classes()).toContain('tw-font-oswald')
    expect(p.classes()).toContain('tw-text-white')
    expect(p.classes()).toContain('tw-uppercase')
  })

  it('has no props and emits no events', () => {
    expect(wrapper.props()).toEqual({})
    expect(wrapper.emitted()).toEqual({})
  })

  it('does not render the location trigger CTA', () => {
    expect(wrapper.text()).not.toContain('View Map of Brick Locations')
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
