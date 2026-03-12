import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrickFilter from '../BrickFilter.vue'
import type { ParkLocation } from '../../types/index'

const locations: ParkLocation[] = [
  { id: 'loc-1', name: 'Class Walk of 2019', mapImageUrl: 'https://example.com/map1.jpg' },
  { id: 'loc-2', name: 'Rodger Babson Statue', mapImageUrl: 'https://example.com/map2.jpg' },
  { id: 'loc-3', name: '14-15-16', mapImageUrl: '' },
]

function mountBrickFilter(
  props: Partial<{
    inscription: string
    locationIds: string[]
    locations: ParkLocation[]
  }> = {},
) {
  return mount(BrickFilter, {
    props: {
      inscription: '',
      locationIds: [],
      locations,
      ...props,
    },
  })
}

describe('BrickFilter', () => {
  it('renders keyword and location labels', () => {
    const wrapper = mountBrickFilter()
    const searchLabel = wrapper.get('label[for="search-brick"]')
    const locationsLabel = wrapper.get('#locations-label')

    expect(searchLabel.text()).toBe('Search by Brick Inscription')
    expect(locationsLabel.text()).toBe('Brick Locations')
    expect(searchLabel.classes()).not.toContain('tw-uppercase')
    expect(locationsLabel.classes()).not.toContain('tw-uppercase')
    expect(searchLabel.classes()).toContain('tw-font-zilla')
    expect(locationsLabel.classes()).toContain('tw-font-zilla')
    expect(searchLabel.classes()).toContain('tw-text-[18px]')
    expect(locationsLabel.classes()).toContain('tw-text-[18px]')
  })

  it('renders all location items and no items for an empty locations array', () => {
    const wrapper = mountBrickFilter()
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(3)
    expect(options[0].classes()).toContain('tw-font-oswald')
    expect(options[0].classes()).toContain('tw-text-[16px]')

    const emptyWrapper = mountBrickFilter({ locations: [] })
    expect(emptyWrapper.findAll('[role="option"]')).toHaveLength(0)
  })

  it('renders a focusable multiselect listbox with the updated sizing and corners', async () => {
    const wrapper = mountBrickFilter()
    const listbox = wrapper.get('[role="listbox"]')

    expect(listbox.attributes('tabindex')).toBe('0')
    expect(listbox.attributes('aria-labelledby')).toBe('locations-label')
    expect(listbox.attributes('aria-multiselectable')).toBe('true')
    expect(listbox.classes()).toContain('tw-max-h-[108px]')
    expect(listbox.classes()).not.toContain('tw-rounded')

    await listbox.trigger('focus')
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-1')
  })

  it('emits locationIds updates for multi-select click toggles', async () => {
    const wrapper = mountBrickFilter({ locationIds: ['loc-1'] })
    const options = wrapper.findAll('[role="option"]')

    await options[1].trigger('click')
    await options[0].trigger('click')

    expect(wrapper.emitted('update:locationIds')).toEqual([[['loc-1', 'loc-2']], [[]]])
  })

  it('highlights all selected locations', () => {
    const wrapper = mountBrickFilter({ locationIds: ['loc-1', 'loc-2'] })
    const options = wrapper.findAll('[role="option"]')

    expect(options[0].classes()).toContain('tw-bg-brickLightGreen')
    expect(options[1].classes()).toContain('tw-bg-brickLightGreen')
    expect(options[0].classes()).toContain('tw-font-bold')
    expect(options[1].classes()).toContain('tw-font-bold')
  })

  it('supports keyboard navigation with wrapping, boundaries, and multi-select toggles', async () => {
    const wrapper = mountBrickFilter({ locationIds: ['loc-2'] })
    const listbox = wrapper.get('[role="listbox"]')

    await listbox.trigger('focus')
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-2')

    await listbox.trigger('keydown', { key: 'ArrowDown' })
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-3')

    await listbox.trigger('keydown', { key: 'ArrowDown' })
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-1')

    await listbox.trigger('keydown', { key: 'ArrowUp' })
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-3')

    await listbox.trigger('keydown', { key: 'Home' })
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-1')

    await listbox.trigger('keydown', { key: 'End' })
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-3')

    await listbox.trigger('keydown', { key: 'Enter' })
    await wrapper.setProps({ locationIds: ['loc-2', 'loc-3'] })
    await listbox.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('update:locationIds')).toEqual([[['loc-2', 'loc-3']], [['loc-3']]])
  })

  it('gives the active option a visual indicator separate from selection', async () => {
    const wrapper = mountBrickFilter({ locationIds: ['loc-2'] })
    const listbox = wrapper.get('[role="listbox"]')

    await listbox.trigger('focus')
    await listbox.trigger('keydown', { key: 'ArrowDown' })

    const active = wrapper.findAll('[role="option"]')[2]
    expect(active.classes()).toContain('tw-ring-2')
    expect(active.classes()).toContain('tw-ring-inset')
  })

  it('emits keyword updates and does not render an inline clear button', async () => {
    const wrapper = mountBrickFilter({ inscription: 'Sample keyword' })
    const input = wrapper.get('input#search-brick')

    await input.setValue('Next keyword')

    expect(wrapper.emitted('update:inscription')).toEqual([['Next keyword']])
    expect(wrapper.find('button[aria-label="Clear search"]').exists()).toBe(false)
  })

  it('renders pills, remove actions, and clear all button', () => {
    const wrapper = mountBrickFilter({
      inscription: 'Sample keyword',
      locationIds: ['loc-1', 'loc-2'],
    })
    const actionStrip = wrapper.get('.bricks__filter-actions')
    const clearAllButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Clear all')

    const text = wrapper.text()
    expect(text).toContain('Brick Inscription: Sample keyword')
    expect(text).toContain('Brick Locations: 2 selected')
    expect(wrapper.findAll('button[aria-label^="Remove"]')).toHaveLength(2)
    expect(actionStrip.classes()).toContain('tw-bg-[rgba(255,255,255,0.53)]')
    expect(clearAllButton?.classes()).toContain('tw-bg-white')
    expect(clearAllButton?.classes()).toContain('tw-text-black')
    expect(clearAllButton?.classes()).toContain('tw-font-oswald')
    expect(clearAllButton?.classes()).toContain('tw-rounded-[23px]')
    expect(wrapper.find('button[aria-label^="Remove"]').classes()).toContain('tw-bg-black')
    expect(wrapper.find('button[aria-label^="Remove"]').classes()).toContain('tw-text-white')
    expect(wrapper.find('button[aria-label^="Remove"]').classes()).toContain('tw-h-[20px]')
    expect(wrapper.find('button[aria-label^="Remove"]').classes()).toContain('tw-w-[20px]')
    expect(wrapper.find('button[aria-label^="Remove"]').classes()).toContain('tw-text-[20px]')
  })

  it('emits pill removals and clearAll, and hides pills when inactive', async () => {
    const wrapper = mountBrickFilter({
      inscription: 'Sample keyword',
      locationIds: ['loc-1', 'loc-2'],
    })

    const removeButtons = wrapper.findAll('button[aria-label^="Remove"]')
    await removeButtons[0].trigger('click')
    await removeButtons[1].trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Clear all')
      ?.trigger('click')

    expect(wrapper.emitted('update:inscription')).toEqual([['']])
    expect(wrapper.emitted('update:locationIds')).toEqual([[[]]])
    expect(wrapper.emitted('clearAll')).toHaveLength(1)

    const inactive = mountBrickFilter()
    expect(inactive.find('.bricks__filter-actions').exists()).toBe(true)
    const hiddenClearAll = inactive
      .findAll('button')
      .find((button) => button.text() === 'Clear all')
    expect(hiddenClearAll?.attributes('style')).toContain('display: none;')
  })
})
