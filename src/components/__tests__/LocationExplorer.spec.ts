import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import LocationExplorer from '../LocationExplorer.vue'
import type { ParkLocation } from '../../types/index'

const mockLocations: ParkLocation[] = [
  { id: 'loc-1', name: 'Class Walk of 2019', mapImageUrl: 'https://example.com/map1.jpg' },
  { id: 'loc-2', name: 'Rodger Babson Statue', mapImageUrl: 'https://example.com/map2.jpg' },
  { id: 'loc-3', name: '14-15-16', mapImageUrl: 'https://example.com/map3.jpg' },
]

const emptyLocations: ParkLocation[] = []

const locationWithNoMap: ParkLocation[] = [
  { id: 'loc-4', name: 'New Zone', mapImageUrl: '' },
]

function mountExplorer(locations: ParkLocation[] = mockLocations) {
  return mount(LocationExplorer, {
    props: { locations },
    global: {
      stubs: { teleport: true },
    },
    attachTo: document.body,
  })
}

describe('LocationExplorer', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Rendering', () => {
    beforeEach(() => {
      wrapper = mountExplorer()
    })

    it('renders a dark backdrop overlay', () => {
      const backdrop = wrapper.find('.tw-fixed.tw-inset-0')
      expect(backdrop.exists()).toBe(true)
    })

    it('renders the sidebar with all location names', () => {
      const items = wrapper.findAll('nav li')
      expect(items).toHaveLength(3)
      expect(items[0].text()).toBe('Class Walk of 2019')
      expect(items[1].text()).toBe('Rodger Babson Statue')
      expect(items[2].text()).toBe('14-15-16')
    })

    it('renders the close button with aria-label', () => {
      const closeButton = wrapper.find('button[aria-label="Close location explorer"]')
      expect(closeButton.exists()).toBe(true)
    })

    it('renders the map image for the default-selected first location', () => {
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/map1.jpg')
      expect(img.attributes('alt')).toBe('Map of Class Walk of 2019')
    })

    it('has aria-label on the sidebar nav', () => {
      const nav = wrapper.find('nav')
      expect(nav.attributes('aria-label')).toBe('Park locations')
    })

    it('applies Oswald font and correct typography to list items', () => {
      const item = wrapper.find('nav li')
      expect(item.classes()).toContain('tw-font-oswald')
      expect(item.classes()).toContain('tw-text-[16px]')
      expect(item.classes()).toContain('tw-leading-6')
      expect(item.classes()).toContain('tw-tracking-[0.5px]')
      expect(item.classes()).toContain('tw-text-center')
    })
  })

  describe('Default selection', () => {
    it('selects the first location on mount', () => {
      wrapper = mountExplorer()
      const items = wrapper.findAll('nav li')
      expect(items[0].classes()).toContain('tw-font-medium')
      expect(items[0].classes()).not.toContain('tw-underline')
    })

    it('uses the first location map image as src', () => {
      wrapper = mountExplorer()
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/map1.jpg')
    })
  })

  describe('Clicking a location', () => {
    beforeEach(() => {
      wrapper = mountExplorer()
    })

    it('highlights the clicked location', async () => {
      const items = wrapper.findAll('nav li')
      await items[1].trigger('click')

      expect(items[1].classes()).toContain('tw-font-medium')
      expect(items[1].classes()).not.toContain('tw-underline')
    })

    it('swaps the map image to the clicked location', async () => {
      const items = wrapper.findAll('nav li')
      await items[1].trigger('click')

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/map2.jpg')
      expect(img.attributes('alt')).toBe('Map of Rodger Babson Statue')
    })

    it('removes highlight from the previously selected location', async () => {
      const items = wrapper.findAll('nav li')
      await items[1].trigger('click')

      expect(items[0].classes()).not.toContain('tw-font-medium')
      expect(items[0].classes()).toContain('tw-font-light')
    })

    it('renders only one map image at a time', async () => {
      const items = wrapper.findAll('nav li')
      await items[2].trigger('click')

      const images = wrapper.findAll('img')
      expect(images).toHaveLength(1)
      expect(images[0].attributes('src')).toBe('https://example.com/map3.jpg')
    })
  })

  describe('Close behavior', () => {
    beforeEach(() => {
      wrapper = mountExplorer()
    })

    it('emits close when the × button is clicked', async () => {
      const closeButton = wrapper.find('button[aria-label="Close location explorer"]')
      await closeButton.trigger('click')

      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('emits close when the backdrop is clicked', async () => {
      const backdrop = wrapper.find('.tw-bg-black\\/\\[0\\.87\\]')
      await backdrop.trigger('click')

      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('emits close when Escape is pressed', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      expect(wrapper.emitted('close')).toHaveLength(1)
    })
  })

  describe('Empty locations', () => {
    it('renders no list items when locations is empty', () => {
      wrapper = mountExplorer(emptyLocations)
      const items = wrapper.findAll('nav li')
      expect(items).toHaveLength(0)
    })

    it('shows fallback text when locations is empty', () => {
      wrapper = mountExplorer(emptyLocations)
      expect(wrapper.text()).toContain('No map available for this location.')
    })

    it('does not error on mount with empty locations', () => {
      expect(() => {
        wrapper = mountExplorer(emptyLocations)
      }).not.toThrow()
    })
  })

  describe('No map image', () => {
    it('shows fallback text when selected location has no mapImageUrl', () => {
      wrapper = mountExplorer(locationWithNoMap)
      expect(wrapper.text()).toContain('No map available for this location.')
      expect(wrapper.find('img').exists()).toBe(false)
    })
  })

  describe('Mobile chevrons', () => {
    it('shows down chevron when list is scrollable', async () => {
      wrapper = mountExplorer()
      const list = wrapper.find('ul').element

      // Simulate a scrollable list: scrollHeight > clientHeight
      Object.defineProperty(list, 'scrollHeight', { value: 300, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 100, configurable: true })
      Object.defineProperty(list, 'scrollTop', { value: 0, writable: true, configurable: true })

      list.dispatchEvent(new Event('scroll'))
      await wrapper.vm.$nextTick()

      const downButton = wrapper.find('button[aria-label="Scroll locations down"]')
      expect(downButton.exists()).toBe(true)
    })

    it('shows up chevron when list is scrolled down', async () => {
      wrapper = mountExplorer()
      const list = wrapper.find('ul').element

      Object.defineProperty(list, 'scrollHeight', { value: 300, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 100, configurable: true })
      Object.defineProperty(list, 'scrollTop', { value: 50, writable: true, configurable: true })

      list.dispatchEvent(new Event('scroll'))
      await wrapper.vm.$nextTick()

      const upButton = wrapper.find('button[aria-label="Scroll locations up"]')
      expect(upButton.exists()).toBe(true)
    })

    it('clicking a chevron scrolls the list', async () => {
      wrapper = mountExplorer()
      const list = wrapper.find('ul').element

      Object.defineProperty(list, 'scrollHeight', { value: 300, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 100, configurable: true })
      Object.defineProperty(list, 'scrollTop', { value: 0, writable: true, configurable: true })

      list.dispatchEvent(new Event('scroll'))
      await wrapper.vm.$nextTick()

      let scrollCalled = false
      list.scrollBy = (() => { scrollCalled = true }) as typeof list.scrollBy

      const downButton = wrapper.find('button[aria-label="Scroll locations down"]')
      await downButton.trigger('click')

      expect(scrollCalled).toBe(true)
    })
  })

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      wrapper = mountExplorer()
    })

    it('each location item has tabindex="0", role="option", and aria-selected', () => {
      const items = wrapper.findAll('nav li')
      items.forEach((item) => {
        expect(item.attributes('tabindex')).toBe('0')
        expect(item.attributes('role')).toBe('option')
      })
      expect(items[0].attributes('aria-selected')).toBe('true')
      expect(items[1].attributes('aria-selected')).toBe('false')
    })

    it('listbox container has role="listbox"', () => {
      expect(wrapper.find('ul').attributes('role')).toBe('listbox')
    })

    it('focusing an item updates the map', async () => {
      const items = wrapper.findAll('nav li')
      await items[1].trigger('focus')

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/map2.jpg')
    })

    it('focusing third item updates the map to third location', async () => {
      const items = wrapper.findAll('nav li')
      await items[2].trigger('focus')

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/map3.jpg')
    })

    it('arrow-down on an item focuses the next item', async () => {
      const items = wrapper.findAll('nav li')
      let focused = false
      ;(items[1].element as HTMLElement).focus = () => { focused = true }

      await items[0].trigger('keydown', { key: 'ArrowDown' })
      expect(focused).toBe(true)
    })

    it('arrow-up on an item focuses the previous item', async () => {
      const items = wrapper.findAll('nav li')
      let focused = false
      ;(items[0].element as HTMLElement).focus = () => { focused = true }

      await items[1].trigger('keydown', { key: 'ArrowUp' })
      expect(focused).toBe(true)
    })
  })

  describe('Body scroll lock', () => {
    it('sets body overflow to hidden on mount', () => {
      wrapper = mountExplorer()
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body overflow on unmount', () => {
      wrapper = mountExplorer()
      wrapper.unmount()
      expect(document.body.style.overflow).toBe('')
      // Prevent double-unmount in afterEach
      wrapper = undefined as unknown as VueWrapper
    })
  })
})
