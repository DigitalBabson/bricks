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
    expect(wrapper.find('.tw-max-w-\\[700px\\]').exists()).toBe(true)
    expect(wrapper.find('.min-\\[700px\\]\\:-tw-mt-\\[245px\\]').exists()).toBe(true)
  })

  it('renders LocationExplorerTrigger', () => {
    const wrapper = mount(AppHero)
    const trigger = wrapper.findComponent(LocationExplorerTrigger)
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toBe('View Brick Locations')
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
    expect(trigger.classes()).toContain('lg:tw-block')
  })

  it('has semi-transparent backdrop for slot content', () => {
    const wrapper = mount(AppHero, {
      slots: { default: '<span>test</span>' }
    })
    const backdrop = wrapper.find('.tw-bg-white\\/80')
    expect(backdrop.exists()).toBe(true)
  })

  it('uses CSS-only spacing for the desktop search panel overlap and grid gap', () => {
    const wrapper = mount(AppHero, {
      slots: { default: '<div class="slot-content">Search Form</div>' }
    })

    expect(wrapper.find('.min-\\[700px\\]\\:tw-mb-\\[60px\\]').exists()).toBe(true)
    expect(wrapper.find('.min-\\[700px\\]\\:-tw-mt-\\[245px\\]').exists()).toBe(true)
  })

  describe('T4 skip-link and accessibility handoff', () => {
    it('moves #page-main-content to the visible h1, hides original from AT, and renders breadcrumbs in a labelled nav', async () => {
      const t4H1 = document.createElement('h1')
      t4H1.id = 'page-main-content'
      t4H1.className = 'type__header--1'
      t4H1.textContent = 'Find My Brick'
      document.body.appendChild(t4H1)

      const t4Breadcrumbs = document.createElement('div')
      t4Breadcrumbs.className = 'c-breadcrumbs c-breadcrumbs--default'
      const ul = document.createElement('ul')
      const li1 = document.createElement('li')
      const a = document.createElement('a')
      a.href = '/alumni/'
      a.textContent = 'Alumni'
      li1.appendChild(a)
      const li2 = document.createElement('li')
      li2.textContent = 'Find My Brick'
      ul.appendChild(li1)
      ul.appendChild(li2)
      t4Breadcrumbs.appendChild(ul)
      document.body.appendChild(t4Breadcrumbs)

      const wrapper = mount(AppHero, { attachTo: document.body })
      try {
        await wrapper.vm.$nextTick()

        // One #page-main-content total — on our visible h1, not the T4 original
        const allIds = document.querySelectorAll('#page-main-content')
        expect(allIds).toHaveLength(1)
        expect(allIds[0]).toBe(wrapper.find('h1').element)

        // Original T4 h1 removed from the accessibility tree
        expect(t4H1.getAttribute('aria-hidden')).toBe('true')

        // Breadcrumbs rendered inside a labelled nav
        const nav = wrapper.find('nav[aria-label="Breadcrumb"]')
        expect(nav.exists()).toBe(true)
        expect(nav.find('.c-breadcrumbs--default').exists()).toBe(true)
      } finally {
        wrapper.unmount()
        document.body.removeChild(t4H1)
        document.body.removeChild(t4Breadcrumbs)
      }
    })
  })
})
