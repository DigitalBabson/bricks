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
    const form = wrapper.get('form')

    expect(listbox.attributes('tabindex')).toBe('0')
    expect(listbox.attributes('aria-labelledby')).toBe('locations-label')
    expect(listbox.attributes('aria-multiselectable')).toBe('true')
    expect(listbox.classes()).toContain('tw-max-h-[84px]')
    expect(listbox.classes()).not.toContain('tw-rounded')
    expect(listbox.classes()).toContain('tw-bg-white')
    expect(listbox.classes()).not.toContain('tw-border')
    expect(form.classes()).toContain('tw-max-w-[700px]')
    expect(form.classes()).toContain('md:tw-min-h-[310px]')

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

  it('uses the idle selected background without bold text', () => {
    const wrapper = mountBrickFilter({ locationIds: ['loc-1', 'loc-2'] })
    const options = wrapper.findAll('[role="option"]')

    expect(options[0].classes()).toContain('tw-bg-[#CECECE]')
    expect(options[1].classes()).toContain('tw-bg-[#CECECE]')
    expect(options[0].classes()).not.toContain('tw-font-bold')
    expect(options[1].classes()).not.toContain('tw-font-bold')
    expect(options[0].classes()).not.toContain('tw-text-white')
    expect(options[1].classes()).not.toContain('tw-text-white')
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

    expect(wrapper.emitted('update:locationIds')).toEqual([[['loc-2', 'loc-3']], [['loc-2']]])
  })

  it('uses the active selected background while the listbox is focused', async () => {
    const wrapper = mountBrickFilter({ locationIds: ['loc-2'] })
    const listbox = wrapper.get('[role="listbox"]')

    await listbox.trigger('focus')
    const activeSelected = wrapper.findAll('[role="option"]')[1]
    expect(activeSelected.classes()).toContain('tw-bg-[rgb(179,215,255)]')

    await listbox.trigger('keydown', { key: 'ArrowDown' })

    const activeUnselected = wrapper.findAll('[role="option"]')[2]
    expect(activeUnselected.classes()).toContain('tw-ring-2')
    expect(activeUnselected.classes()).toContain('tw-ring-inset')
  })

  it('keeps the most recently clicked selected item active after multi-select updates', async () => {
    const wrapper = mountBrickFilter({ locationIds: ['loc-1'] })
    const listbox = wrapper.get('[role="listbox"]')
    const options = wrapper.findAll('[role="option"]')

    await listbox.trigger('focus')
    await options[1].trigger('click')
    await wrapper.setProps({ locationIds: ['loc-1', 'loc-2'] })

    expect(options[0].classes()).toContain('tw-bg-[#CECECE]')
    expect(options[1].classes()).toContain('tw-bg-[rgb(179,215,255)]')
    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-2')
  })

  it('uses the active selected background after pointer selection even if the listbox was not focused first', async () => {
    const wrapper = mountBrickFilter({ locationIds: [] })
    const listbox = wrapper.get('[role="listbox"]')
    const options = wrapper.findAll('[role="option"]')

    await options[1].trigger('click')
    await wrapper.setProps({ locationIds: ['loc-2'] })

    expect(listbox.attributes('aria-activedescendant')).toBe('location-option-loc-2')
    expect(options[1].classes()).toContain('tw-bg-[rgb(179,215,255)]')
  })

  it('emits keyword updates and does not render an inline clear button', async () => {
    const wrapper = mountBrickFilter({ inscription: 'Sample keyword' })
    const input = wrapper.get('input#search-brick')

    await input.setValue('Next keyword')

    expect(wrapper.emitted('update:inscription')).toEqual([['Next keyword']])
    expect(wrapper.find('button[aria-label="Clear search"]').exists()).toBe(false)
  })

  it('renders individual location pills, remove actions, and clear all button', () => {
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
    expect(text).toContain('Brick Location: Class Walk of 2019')
    expect(text).toContain('Brick Location: Rodger Babson Statue')
    expect(wrapper.findAll('button[aria-label^="Remove"]')).toHaveLength(3)
    expect(actionStrip.classes()).toContain('tw-bg-[rgba(255,255,255,0.53)]')
    expect(actionStrip.classes()).toContain('tw-min-h-[51px]')
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

  it('removes only the targeted location pill, clears inscription, and disables clear all when inactive', async () => {
    const wrapper = mountBrickFilter({
      inscription: 'Sample keyword',
      locationIds: ['loc-1', 'loc-2'],
    })

    await wrapper.get('button[aria-label="Remove Brick Location: Class Walk of 2019"]').trigger('click')
    await wrapper.get('button[aria-label="Remove Brick Inscription: Sample keyword"]').trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Clear all')
      ?.trigger('click')

    expect(wrapper.emitted('update:inscription')).toEqual([['']])
    expect(wrapper.emitted('update:locationIds')).toEqual([[['loc-2']]])
    expect(wrapper.emitted('clearAll')).toHaveLength(1)

    const inactive = mountBrickFilter()
    const disabledClearAll = inactive
      .findAll('button')
      .find((button) => button.text() === 'Clear all')
    expect(disabledClearAll?.attributes('disabled')).toBeDefined()
    expect(disabledClearAll?.classes()).toContain('tw-bg-[#CCD8C0]')
    expect(disabledClearAll?.classes()).toContain('tw-text-[#31451D]')
    expect(disabledClearAll?.classes()).toContain('tw-cursor-not-allowed')
  })
})
