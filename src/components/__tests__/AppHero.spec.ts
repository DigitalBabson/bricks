import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHero from '../AppHero.vue'
import LocationExplorerTrigger from '../LocationExplorerTrigger.vue'

describe('AppHero', () => {
  it('renders a section element', () => {
    const wrapper = mount(AppHero)
    expect(wrapper.find('section').exists()).toBe(true)
  })

  it('applies background-image style from env var', () => {
    const wrapper = mount(AppHero)
    const section = wrapper.find('section')
    const style = section.attributes('style') || ''
    // In test env, import.meta.env.DEV_HERO_IMAGE may be undefined
    // but the style attribute should contain background-image
    expect(style).toContain('background-image')
  })

  it('uses bg-cover and bg-center classes', () => {
    const wrapper = mount(AppHero)
    const section = wrapper.find('section')
    expect(section.classes()).toContain('tw-bg-cover')
    expect(section.classes()).toContain('tw-bg-center')
  })

  it('renders default slot content', () => {
    const wrapper = mount(AppHero, {
      slots: {
        default: '<div class="slot-content">Search Form</div>'
      }
    })
    expect(wrapper.find('.slot-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Search Form')
  })

  it('renders LocationExplorerTrigger', () => {
    const wrapper = mount(AppHero)
    const trigger = wrapper.findComponent(LocationExplorerTrigger)
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toBe('View Map of Brick Locations')
  })

  it('emits openLocations when trigger is clicked', async () => {
    const wrapper = mount(AppHero)
    await wrapper.findComponent(LocationExplorerTrigger).trigger('click')
    expect(wrapper.emitted()).toHaveProperty('openLocations')
    expect(wrapper.emitted('openLocations')).toHaveLength(1)
  })

  it('hides trigger on mobile via responsive class', () => {
    const wrapper = mount(AppHero)
    const trigger = wrapper.findComponent(LocationExplorerTrigger)
    expect(trigger.classes()).toContain('tw-hidden')
    expect(trigger.classes()).toContain('md:tw-block')
  })

  it('has semi-transparent backdrop for slot content', () => {
    const wrapper = mount(AppHero, {
      slots: { default: '<span>test</span>' }
    })
    const backdrop = wrapper.find('.tw-bg-white\\/80')
    expect(backdrop.exists()).toBe(true)
  })
})
